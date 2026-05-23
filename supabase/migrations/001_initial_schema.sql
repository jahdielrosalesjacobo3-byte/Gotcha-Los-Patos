-- Gotcha Los Patos — Supabase schema

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  name text,
  created_at timestamptz not null default now()
);

-- Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  phone text not null check (char_length(trim(phone)) >= 7),
  email text,
  package_id text not null,
  package_name text not null,
  package_price numeric(10, 2) not null,
  package_type text not null check (package_type in ('individual', 'family')),
  participants int not null check (participants >= 1 and participants <= 20),
  date date not null,
  slot_time text not null,
  notes text default '',
  deposit numeric(10, 2) not null default 300,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on public.bookings (date);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- Helpers
create or replace function public.time_to_minutes(t text)
returns int
language plpgsql
immutable
as $$
declare
  parts text[];
begin
  parts := string_to_array(t, ':');
  if array_length(parts, 1) <> 2 then
    return -1;
  end if;
  return parts[1]::int * 60 + parts[2]::int;
exception
  when others then
    return -1;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.has_booking_conflict(p_date date, p_slot_time text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  new_minutes int;
  rec record;
begin
  new_minutes := public.time_to_minutes(p_slot_time);
  if new_minutes < 0 then
    return false;
  end if;

  for rec in
    select slot_time
    from public.bookings
    where date = p_date
      and status <> 'cancelled'
  loop
    if abs(public.time_to_minutes(rec.slot_time) - new_minutes) <= 60 then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

-- Public RPC: blocked times only (no PII)
create or replace function public.get_blocked_times(p_date date)
returns table (slot_time text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct b.slot_time
  from public.bookings b
  where b.date = p_date
    and b.status <> 'cancelled'
  order by 1;
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, role, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;

-- Profiles policies
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Bookings policies
drop policy if exists "Public insert bookings" on public.bookings;
create policy "Public insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

create or replace function public.enforce_booking_conflict()
returns trigger
language plpgsql
as $$
begin
  if public.has_booking_conflict(new.date, new.slot_time) then
    raise exception 'booking_conflict'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists check_booking_conflict on public.bookings;
create trigger check_booking_conflict
  before insert on public.bookings
  for each row
  execute function public.enforce_booking_conflict();

drop policy if exists "Admins read bookings" on public.bookings;
create policy "Admins read bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins update bookings" on public.bookings;
create policy "Admins update bookings"
  on public.bookings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete bookings" on public.bookings;
create policy "Admins delete bookings"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());

-- Grants for RPC
grant usage on schema public to anon, authenticated;
grant execute on function public.get_blocked_times(date) to anon, authenticated;
grant execute on function public.has_booking_conflict(date, text) to anon, authenticated;
