import { supabase } from "./supabase";

const mapBooking = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  package_id: row.package_id,
  package_name: row.package_name,
  package_price: Number(row.package_price),
  package_type: row.package_type,
  participants: row.participants,
  date: row.date,
  time: row.slot_time,
  notes: row.notes || "",
  deposit: Number(row.deposit),
  status: row.status,
  payment_status: row.payment_status,
  paid_at: row.paid_at,
  created_at: row.created_at,
});

const conflictMessage =
  "Ese horario está ocupado. Elige otro slot.";

export async function fetchBlockedTimes(date) {
  const { data, error } = await supabase.rpc("get_blocked_times", {
    p_date: date,
  });
  if (error) throw error;
  return (data || []).map((row) => row.slot_time);
}

export async function createBookingCheckout(payload) {
  const { data, error } = await supabase.functions.invoke(
    "create-booking-checkout",
    { body: payload },
  );

  if (error) {
    const ctx = error.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        if (body?.error) {
          const err = new Error(body.error);
          if (body.error.includes("ocupado")) err.status = 409;
          throw err;
        }
      } catch (parseErr) {
        if (parseErr?.status === 409) throw parseErr;
      }
    }
    throw error;
  }

  if (data?.error) {
    const err = new Error(data.error);
    if (data.error.includes("ocupado")) {
      err.status = 409;
    }
    throw err;
  }

  return data;
}

export async function fetchBookingStatus(bookingId) {
  const { data, error } = await supabase.rpc("get_booking_status", {
    p_id: bookingId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    payment_status: row.payment_status,
    name: row.name,
    package_name: row.package_name,
    date: row.date,
    time: row.slot_time,
    deposit: Number(row.deposit),
  };
}

export async function fetchAdminBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapBooking);
}

export async function updateBookingStatus(id, status) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapBooking(data);
}

export async function deleteBooking(id) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

export function computeStats(bookings) {
  const stats = {
    total: bookings.length,
    processing: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    estimated_revenue: 0,
    collected_deposits: 0,
  };

  for (const b of bookings) {
    if (stats[b.status] !== undefined) {
      stats[b.status] += 1;
    }
    if (b.status === "confirmed" || b.status === "completed") {
      stats.estimated_revenue += b.package_price;
      if (b.payment_status === "approved") {
        stats.collected_deposits += b.deposit;
      }
    }
  }

  return stats;
}
