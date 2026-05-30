const { getServiceClient } = require("./lib/supabase");
const { createCheckoutPreference } = require("./lib/mercadopago");
const { sendProcessingEmail } = require("./lib/email");
const { cancelExpiredBookings } = require("./lib/cancel-expired-bookings");
const {
  notifyBookingProcessing,
  notifyAdminNewBooking,
} = require("./lib/whatsapp-notify");

function validate(body) {
  if (!body.name?.trim() || body.name.trim().length < 2) {
    throw new Error("Nombre inválido");
  }
  if (!body.phone?.trim() || body.phone.trim().length < 7) {
    throw new Error("Teléfono inválido");
  }
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Correo electrónico requerido");
  }
  if (!body.date || !body.time) {
    throw new Error("Fecha y horario requeridos");
  }
  if (!body.deposit || body.deposit <= 0) {
    throw new Error("Anticipo inválido");
  }
  return { ...body, email };
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    json(res, 405, { error: "Método no permitido" });
    return;
  }

  try {
    const body = validate(req.body);
    const supabase = getServiceClient();

    try {
      await cancelExpiredBookings(supabase);
    } catch (expiryErr) {
      console.error("[checkout] cancel-expired:", expiryErr);
    }

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email,
        package_id: body.package_id,
        package_name: body.package_name,
        package_price: body.package_price,
        package_type: body.package_type,
        participants: body.participants,
        date: body.date,
        slot_time: body.time,
        notes: (body.notes || "").trim(),
        deposit: body.deposit,
        status: "processing",
        payment_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.message?.includes("booking_conflict")) {
        json(res, 409, { error: "Ese horario está ocupado. Elige otro slot." });
        return;
      }
      throw insertError;
    }

    const preference = await createCheckoutPreference({
      bookingId: booking.id,
      deposit: Number(booking.deposit),
      payerEmail: booking.email,
      payerName: booking.name,
      packageName: booking.package_name,
    });

    await supabase
      .from("bookings")
      .update({
        mp_preference_id: preference.id,
        payment_status: "in_process",
      })
      .eq("id", booking.id);

    try {
      await sendProcessingEmail({
        email: booking.email,
        name: booking.name,
        package_name: booking.package_name,
        date: booking.date,
        slot_time: booking.slot_time,
        deposit: Number(booking.deposit),
        booking_id: booking.id,
      });
    } catch (emailErr) {
      console.error("[checkout] email:", emailErr);
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
    const checkoutUrl =
      token.startsWith("TEST-") && preference.sandbox_init_point
        ? preference.sandbox_init_point
        : preference.init_point;

    try {
      await notifyBookingProcessing(booking, checkoutUrl);
      await notifyAdminNewBooking(booking);
    } catch (waErr) {
      console.error("[checkout] whatsapp:", waErr);
    }

    json(res, 200, { booking_id: booking.id, checkout_url: checkoutUrl });
  } catch (err) {
    console.error("[create-booking-checkout]", err);
    json(res, 500, {
      error: err instanceof Error ? err.message : "Error interno",
    });
  }
};
