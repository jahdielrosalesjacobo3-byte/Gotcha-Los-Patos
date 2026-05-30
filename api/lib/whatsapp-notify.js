const { sendText, adminPhone, isConfigured } = require("./whatsapp");

const SITE = (process.env.SITE_URL || "https://www.gotchalospatos.xyz").replace(
  /\/$/,
  "",
);

function statusLabel(status, paymentStatus) {
  if (status === "confirmed" || paymentStatus === "approved") return "✅ Confirmada";
  if (status === "processing" || paymentStatus === "in_process") return "⏳ En proceso";
  if (status === "cancelled") return "❌ Cancelada";
  if (status === "completed") return "🏁 Completada";
  return status;
}

async function notifyBookingProcessing(booking, checkoutUrl) {
  if (!isConfigured()) return;

  const msg =
    `🎯 *Gotcha Los Patos La Marquesa*\n\n` +
    `Hola *${booking.name}*, tu reserva está *en proceso*.\n\n` +
    `📦 ${booking.package_name}\n` +
    `📅 ${booking.date} · ${booking.slot_time}\n` +
    `💳 Anticipo: $${booking.deposit} MXN\n\n` +
    `Completa tu pago aquí:\n${checkoutUrl || `${SITE}`}\n\n` +
    `También te enviamos un correo de confirmación.`;

  await sendText(booking.phone, msg);
}

async function notifyBookingConfirmed(booking) {
  if (!isConfigured()) return;

  const msg =
    `🎯 *Gotcha Los Patos La Marquesa*\n\n` +
    `¡Hola *${booking.name}*! Tu reserva está *CONFIRMADA* ✅\n\n` +
    `📦 ${booking.package_name}\n` +
    `📅 ${booking.date} · ${booking.slot_time}\n` +
    `👥 ${booking.participants} participante(s)\n` +
    `💳 Anticipo pagado: $${booking.deposit} MXN\n\n` +
    `El saldo restante se paga el día de tu visita.\n` +
    `📍 Gotcha Los Patos, 52743 La Marquesa, Méx.\n\n` +
    `¡Nos vemos en el campo!`;

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
