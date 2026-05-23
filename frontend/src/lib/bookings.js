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

export async function createBooking(payload) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.toLowerCase().trim() || null,
      package_id: payload.package_id,
      package_name: payload.package_name,
      package_price: payload.package_price,
      package_type: payload.package_type,
      participants: payload.participants,
      date: payload.date,
      slot_time: payload.time,
      notes: payload.notes?.trim() || "",
      deposit: payload.deposit,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.message?.includes("booking_conflict") || error.code === "P0001") {
      const err = new Error(conflictMessage);
      err.status = 409;
      throw err;
    }
    throw error;
  }

  return mapBooking(data);
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
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    estimated_revenue: 0,
    collected_deposits: 0,
  };

  for (const b of bookings) {
    stats[b.status] = (stats[b.status] || 0) + 1;
    if (b.status === "confirmed" || b.status === "completed") {
      stats.estimated_revenue += b.package_price;
      stats.collected_deposits += b.deposit;
    }
  }

  return stats;
}
