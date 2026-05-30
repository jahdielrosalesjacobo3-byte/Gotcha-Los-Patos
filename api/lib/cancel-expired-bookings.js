const EXPIRY_HOURS = Number(process.env.BOOKING_EXPIRY_HOURS || 4);

/**
 * Cancela reservas en proceso sin pago después de EXPIRY_HOURS (default 4).
 * @returns {Promise<string[]>} IDs cancelados
 */
async function cancelExpiredBookings(supabase) {
  const hours = EXPIRY_HOURS;

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "cancel_expired_bookings",
    { p_hours: hours },
  );

  if (!rpcError) {
    return (rpcData || []).map((row) => (typeof row === "string" ? row : row.id));
  }

  // Fallback si la migración SQL aún no está aplicada
  if (rpcError.code !== "PGRST202" && !rpcError.message?.includes("cancel_expired_bookings")) {
    console.warn("[cancel-expired] RPC:", rpcError.message);
  }

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      payment_status: "rejected",
    })
    .eq("status", "processing")
    .in("payment_status", ["pending", "in_process"])
    .lt("created_at", cutoff)
    .select("id");

  if (error) throw error;
  return (data || []).map((row) => row.id);
}

module.exports = { cancelExpiredBookings, EXPIRY_HOURS };
