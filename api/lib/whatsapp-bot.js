const { getServiceClient } = require("./supabase");
const { sendText, normalizePhone } = require("./whatsapp");
const { statusLabel } = require("./whatsapp-notify");

const SITE = (process.env.SITE_URL || "https://www.gotchalospatos.xyz").replace(
  /\/$/,
  "",
);

const MENU = `🎯 *Gotcha Los Patos La Marquesa*

Elige una opción o escribe una palabra clave:

1️⃣ *horarios* — Horario de operación
2️⃣ *precios* — Paquetes y costos
3️⃣ *ubicacion* — Cómo llegar
4️⃣ *reservar* — Reservar en la web
5️⃣ *estado* — Ver tus reservas (con este número)

También puedes escribir *menu* en cualquier momento.

🌐 Reserva en línea: ${SITE}`;

const PRICES = `💰 *Paquetes individuales* (por persona)
• Paquete 1 — $160 MXN (100 balas)
• Paquete 2 — $190 MXN (110 balas) ⭐
• Paquete 3 — $240 MXN (150 balas + guantes)

👨‍👩‍👧‍👦 *Paquetes familiares*
• Familiar 1 — $2,500 (10 pers., 2,000 balas)
• Familiar 2 — $2,800 (10 pers., overoles) ⭐
• Familiar 3 — $5,200 (16 pers., 4,000 balas)

💳 Anticipo de reserva: *$300 MXN* (resto el día de la visita)

Reserva: ${SITE}`;

const SCHEDULE = `🕐 *Horarios*
Lunes a domingo: *10:00 AM – 6:00 PM*

Cada reserva ocupa ±1 h alrededor del horario elegido.`;

const LOCATION = `📍 *Ubicación*
Gotcha Los Patos
52743 La Marquesa, Estado de México
(A ~30 min de CDMX por México–Toluca)

🗺️ Maps: https://maps.google.com/?q=Gotcha+Los+Patos+52743+La+Marquesa`;

function matches(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

async function lookupBookingsByPhone(phone) {
  const supabase = getServiceClient();
  const digits = normalizePhone(phone).slice(-10);

  const { data, error } = await supabase
    .from("bookings")
    .select("name, package_name, date, slot_time, status, payment_status, deposit, created_at")
    .or(`phone.ilike.%${digits}%`)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data || [];
}

async function buildStatusReply(phone) {
  const bookings = await lookupBookingsByPhone(phone);
  if (bookings.length === 0) {
    return (
      `No encontré reservas con este número de WhatsApp.\n\n` +
      `Si reservaste con otro teléfono, escríbenos desde ese número o reserva en:\n${SITE}`
    );
  }

  const lines = bookings.map((b) => {
    const st = statusLabel(b.status, b.payment_status);
    return (
      `• *${b.package_name}*\n` +
      `  ${b.date} · ${b.slot_time}\n` +
      `  ${st}`
    );
  });

  return `📋 *Tus reservas recientes:*\n\n${lines.join("\n\n")}`;
}

async function handleIncomingMessage(from, text) {
  const msg = (text || "").trim().toLowerCase();
  if (!msg) return;

  if (
    matches(msg, [
      "hola",
      "buenas",
      "menu",
      "menú",
      "ayuda",
      "help",
      "info",
      "inicio",
      "start",
    ])
  ) {
    await sendText(from, MENU);
    return;
  }

  if (matches(msg, ["horario", "horarios", "hora", "schedule", "abierto"])) {
    await sendText(from, SCHEDULE);
    return;
  }

  if (matches(msg, ["precio", "precios", "paquete", "paquetes", "costo", "cuanto", "cuánto"])) {
    await sendText(from, PRICES);
    return;
  }

  if (matches(msg, ["ubicacion", "ubicación", "direccion", "dirección", "donde", "dónde", "llegar", "mapa"])) {
    await sendText(from, LOCATION);
    return;
  }

  if (matches(msg, ["reservar", "reserva", "reservacion", "reservación", "book", "cita"])) {
    await sendText(
      from,
      `🎯 *Reservar tu misión*\n\n` +
        `Entra a nuestra web, elige paquete, fecha y horario, y paga el anticipo de $300 MXN con Mercado Pago:\n\n` +
        `${SITE}\n\n` +
        `Te confirmaremos por WhatsApp y correo cuando el pago sea aprobado.`,
    );
    return;
  }

  if (matches(msg, ["estado", "reserva", "mis reservas", "confirmacion", "confirmación"])) {
    const reply = await buildStatusReply(from);
    await sendText(from, reply);
    return;
  }

  await sendText(
    from,
    `No entendí tu mensaje. Escribe *menu* para ver opciones o *reservar* para ir a la web:\n${SITE}`,
  );
}

module.exports = { handleIncomingMessage, MENU };
