-- Mercado Pago + estados automáticos + email obligatorio

alter table public.bookings
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'in_process', 'approved', 'rejected', 'refunded')),
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text,
  add column if not exists paid_at timestamptz;

-- Migrar estados legacy
update public.bookings set status = 'processing' where status = 'pending';

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('processing', 'confirmed', 'cancelled', 'completed'));

-- Email obligatorio en nuevas reservas
update public.bookings
set email = 'legacy@gotchalospatos.local'
where email is null;

alter table public.bookings
  alter column email set not null;

-- Solo el backend (service role) crea reservas con pago
drop policy if exists "Public insert bookings" on public.bookings;

-- Estado público limitado (página de éxito)
create or replace function public.get_booking_status(p_id uuid)
returns table (
  id uuid,
  status text,
  payment_status text,
  name text,
  package_name text,
  date date,
  slot_time text,
  deposit numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id,
    b.status,
    b.payment_status,
    b.name,
    b.package_name,
    b.date,
    b.slot_time,
    b.deposit
  from public.bookings b
  where b.id = p_id;
$$;

grant execute on function public.get_booking_status(uuid) to anon, authenticated;
