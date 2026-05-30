const { getServiceClient } = require("./lib/supabase");
const { getPayment } = require("./lib/mercadopago");
const { sendConfirmedEmail } = require("./lib/email");
const {
  notifyBookingConfirmed,
  notifyAdminPaymentConfirmed,
} = require("./lib/whatsapp-notify");

async function applyPaymentUpdate(paymentId) {
  const payment = await getPayment(paymentId);
  const bookingId = payment.external_reference;
  if (!bookingId) return;

  const supabase = getServiceClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) return;

  const mpStatus = payment.status;
  let status = booking.status;
  let payment_status = booking.payment_status;
  let paid_at = booking.paid_at;

  if (mpStatus === "approved") {
    status = "confirmed";
    payment_status = "approved";
    paid_at = new Date().toISOString();
  } else if (["rejected", "cancelled"].includes(mpStatus)) {
    status = "cancelled";
    payment_status = "rejected";
  } else if (["pending", "in_process"].includes(mpStatus)) {
    status = "processing";
    payment_status = "in_process";
  }

  const wasConfirmed = booking.status === "confirmed";

  await supabase
    .from("bookings")
    .update({
      status,
      payment_status,
      mp_payment_id: String(payment.id),
      paid_at,
    })
    .eq("id", bookingId);

  if (mpStatus === "approved" && !wasConfirmed) {
    try {
      await sendConfirmedEmail({
        email: booking.email,
        name: booking.name,
        package_name: booking.package_name,
        date: booking.date,
        slot_time: booking.slot_time,
        deposit: Number(booking.deposit),
        booking_id: booking.id,
      });
    } catch (emailErr) {
      console.error("[webhook] email:", emailErr);
    }
    try {
      await notifyBookingConfirmed(booking);
      await notifyAdminPaymentConfirmed(booking);
    } catch (waErr) {
      console.error("[webhook] whatsapp:", waErr);
    }
  }
}

module.exports = async function handler(req, res) {
  try {
    let paymentId =
      req.query?.id ||
      req.query?.["data.id"] ||
      req.body?.data?.id ||
      req.body?.id;

    if (!paymentId && req.body) {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (body?.type === "payment" && body?.data?.id) {
        paymentId = String(body.data.id);
      }
    }

    if (paymentId) {
      await applyPaymentUpdate(String(paymentId));
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[mercadopago-webhook]", err);
    res.status(500).json({ ok: false });
  }
};
