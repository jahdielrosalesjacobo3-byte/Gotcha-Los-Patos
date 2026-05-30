-- Reservas en proceso sin pago: liberar slot tras 4 horas

create index if not exists bookings_expiry_idx
  on public.bookings (created_at)
  where status = 'processing'
    and payment_status in ('pending', 'in_process');

-- Reserva activa = bloquea horario (excepto canceladas y expiradas sin pago)
create or replace function public.booking_blocks_slot(
  p_status text,
  p_payment_status text,
  p_created_at timestamptz
)
returns boolean
language sql
stable
as $$
  select
    p_status <> 'cancelled'
    and not (
      p_status = 'processing'
      and p_payment_status in ('pending', 'in_process')
      and p_created_at < now() - interval '4 hours'
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
      and public.booking_blocks_slot(status, payment_status, created_at)
  loop
    if abs(public.time_to_minutes(rec.slot_time) - new_minutes) <= 60 then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

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
    and public.booking_blocks_slot(b.status, b.payment_status, b.created_at)
  order by 1;
$$;

-- Marca como canceladas las reservas expiradas (cron / checkout)
create or replace function public.cancel_expired_bookings(p_hours numeric default 4)
returns table (id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.bookings
  set
    status = 'cancelled',
    payment_status = 'rejected'
  where
    status = 'processing'
    and payment_status in ('pending', 'in_process')
    and created_at < now() - (p_hours || ' hours')::interval
  returning bookings.id;
end;
$$;

revoke all on function public.cancel_expired_bookings(numeric) from public;
grant execute on function public.cancel_expired_bookings(numeric) to service_role;
