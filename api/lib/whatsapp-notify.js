const { sendText, adminPhone, isConfigured } = require("./whatsapp");

const SITE = (process.env.SITE_URL || "https://www.gotchalospatos.xyz").replace(
  /\/$/,
  "",
);

function statusLabel(status, paymentStatus) {
  if (status === "confirmed" || paymentStatus === "approved") return "✅ Confirmada — ¡nos vemos pronto!";
  if (status === "processing" || paymentStatus === "in_process") return "⏳ En proceso — falta completar el pago";
  if (status === "cancelled") return "❌ Cancelada";
  if (status === "completed") return "🏁 Completada — ¡esperamos que la hayas pasado increíble!";
  return status;
}

async function notifyBookingProcessing(booking, checkoutUrl) {
  if (!isConfigured()) return;

  const firstName = booking.name?.split(" ")[0] || booking.name;

  const msg =
    `🎯 *Gotcha Los Patos La Marquesa*\n\n` +
    `¡Hola *${firstName}*! 👋 Qué emoción que quieras venir al bosque con nosotros.\n\n` +
    `Ya casi queda todo listo — tu reserva está *en proceso* y solo falta completar el anticipo para asegurar tu horario:\n\n` +
    `📦 ${booking.package_name}\n` +
    `📅 ${booking.date} · ${booking.slot_time}\n` +
    `💳 Anticipo: $${booking.deposit} MXN\n\n` +
    `Con ese paso tu lugar queda apartado y empiezas a contar los días para la adrenalina con tu gente.\n\n` +
    `Completa tu pago aquí:\n${checkoutUrl || SITE}\n\n` +
    `También te llegará un correo. ¡Te esperamos en La Marquesa! 🌲`;

  await sendText(booking.phone, msg);
}

async function notifyBookingConfirmed(booking) {
  if (!isConfigured()) return;

  const firstName = booking.name?.split(" ")[0] || booking.name;

  const msg =
    `🎯 *Gotcha Los Patos La Marquesa*\n\n` +
    `¡*${firstName}*! 🎉 Tu reserva está *CONFIRMADA* — ya eres parte del squad.\n\n` +
    `Prepárate para desconectarte de la rutina y vivir una misión en bosque real con tu gente. Este es tu plan:\n\n` +
    `📦 ${booking.package_name}\n` +
    `📅 ${booking.date} · ${booking.slot_time}\n` +
    `👥 ${booking.participants} participante(s)\n` +
    `💳 Anticipo pagado: $${booking.deposit} MXN\n\n` +
    `El saldo restante lo liquidas el día de tu visita, sin sorpresas.\n\n` +
    `📍 Gotcha Los Patos, 52743 La Marquesa, Méx.\n` +
    `🗺️ https://maps.google.com/?q=Gotcha+Los+Patos+52743+La+Marquesa\n\n` +
    `Llega con ropa cómoda, buena vibra y ganas de pasarla increíble. *Te va a encantar* — nos vemos en el campo 🔥`;

  await sendText(booking.phone, msg);
}

async function notifyAdminNewBooking(booking) {
  if (!isConfigured()) return;

  const msg =
    `📋 *Nueva reserva*\n\n` +
    `👤 ${booking.name}\n` +
    `📞 ${booking.phone}\n` +
    `📧 ${booking.email}\n` +
    `📦 ${booking.package_name}\n` +
    `📅 ${booking.date} · ${booking.slot_time}\n` +
    `Estado: ${statusLabel(booking.status, booking.payment_status)}`;

  await sendText(adminPhone(), msg);
}

async function notifyAdminPaymentConfirmed(booking) {
  if (!isConfigured()) return;

  const msg =
    `💰 *Pago recibido*\n\n` +
    `👤 ${booking.name}\n` +
    `📦 ${booking.package_name}\n` +
    `📅 ${booking.date} · ${booking.slot_time}\n` +
    `💳 $${booking.deposit} MXN\n` +
    `Reserva confirmada automáticamente.`;

  await sendText(adminPhone(), msg);
}

module.exports = {
  notifyBookingProcessing,
  notifyBookingConfirmed,
  notifyAdminNewBooking,
  notifyAdminPaymentConfirmed,
  statusLabel,
};
