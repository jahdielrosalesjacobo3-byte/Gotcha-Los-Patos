const { getServiceClient } = require("./lib/supabase");
const {
  cancelExpiredBookings,
  EXPIRY_HOURS,
} = require("./lib/cancel-expired-bookings");

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.authorization === `Bearer ${secret}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  try {
    const supabase = getServiceClient();
    const cancelledIds = await cancelExpiredBookings(supabase);

    res.status(200).json({
      ok: true,
      expiry_hours: EXPIRY_HOURS,
      cancelled_count: cancelledIds.length,
      cancelled_ids: cancelledIds,
    });
  } catch (err) {
    console.error("[cancel-expired-bookings]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error interno",
    });
  }
};
