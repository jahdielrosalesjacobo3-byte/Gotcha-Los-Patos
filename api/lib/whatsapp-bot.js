const { getServiceClient } = require("./supabase");
const { sendText, normalizePhone } = require("./whatsapp");
const { statusLabel } = require("./whatsapp-notify");

const SITE = (process.env.SITE_URL || "https://www.gotchalospatos.xyz").replace(
  /\/$/,
  "",
);

const PERSONAL_PHONE =
  process.env.WHATSAPP_PERSONAL_PHONE || "525560326688";
const PERSONAL_DISPLAY = "+52 55 6032 6688";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Saludos de apertura — cortos, cálidos, distintos cada vez
const WELCOME_OPENER = [
  "¡Hola! 👋 Qué gusto que nos escribas.",
  "¡Hey! 🎯 Bienvenido a Gotcha Los Patos.",
  "¡Qué onda! 🦆 Gracias por contactarnos.",
  "¡Hola, campeón! 👋 Me da gusto saludarte.",
];

// Gancho emocional — explica quiénes somos e incita a visitar
const WELCOME_PITCH = [
  `Somos *Gotcha Los Patos La Marquesa*: paintball en *bosque de verdad*, no en un salón cerrado. A 30 min de la CDMX vives una misión con amigos, familia o compañeros de trabajo — risas, adrenalina y recuerdos que se quedan.

¿Primera vez? No te preocupes: te equipamos, te orientamos y te haces sentir parte del squad desde el primer minuto.`,
  `Aquí no vienes solo a disparar balas — vienes a *desconectarte de la rutina* y conectar con tu gente en plena naturaleza. La Marquesa es el escenario perfecto: pinos, aire fresco y esa emoción de gritar "¡lo logramos!" con tu equipo.

Cada grupo vive su propia aventura. La tuya empieza cuando tú quieras.`,
  `Imagina un sábado diferente: tú y tu crew en el bosque, chalecos puestos, estrategia en mente y cero estrés de la ciudad. Eso es lo que hacemos en *Gotcha Los Patos* — experiencias que se sienten únicas porque *cada visita es distinta*.

Estamos a un paso de la CDMX y con ganas de recibirte.`,
];

const MENU_OPTIONS = `Cuéntame, ¿por dónde empezamos?

1️⃣ *horarios* — ¿Cuándo podemos recibirte?
2️⃣ *precios* — Paquetes para ti o tu grupo
3️⃣ *ubicacion* — Cómo llegar al campo
4️⃣ *reservar* — Aparta tu fecha ya
5️⃣ *estado* — Revisa tus reservas

¿Cumpleaños, empresa o algo a la medida? Escribe *asesor* y te conectamos con el equipo.

🌐 Reserva directo: ${SITE}`;

function buildReply({ opener, explain, details, invite }) {
  const parts = [opener, explain, details, invite].filter(Boolean);
  return parts.join("\n\n");
}

const REPLY_SCHEDULE = () =>
  buildReply({
    opener: pick([
      "¡Qué padre que ya estés pensando en venir! 🌲",
      "¡Me encanta que quieras planear tu visita! 🎯",
    ]),
    explain:
      "Abrimos *todos los días* porque sabemos que la mejor escapada no espera al fin de semana. Entre semana hay menos gente y más espacio para que tu squad disfrute el bosque a su ritmo; el fin de semana la energía sube y el ambiente se pone increíble.",
    details:
      "🕐 *Horario:* Lunes a domingo, *10:00 AM – 6:00 PM*\n\nTu reserva cubre ±1 hora alrededor del horario que elijas — llega con calma, respira aire de montaña y disfruta sin prisa.",
    invite:
      "¿Ya tienes fecha en mente? Escribe *reservar* y te ayudo a apartarla. ¡Te va a encantar salir de la ciudad aunque sea un ratito! 😊",
  });

const REPLY_PRICES = () =>
  buildReply({
    opener: "¡Claro! Te platico cómo armamos la experiencia 💰",
    explain:
      "No pagas solo por balas — pagas por *salir de lo ordinary*: equipo completo, campo en bosque real y ese rush de adrenalina con tu gente. Tenemos opciones para quien viene solo, en pareja o con todo el squad.",
    details:
      `*Por persona:*
• Paquete 1 — $160 · 100 balas · perfecto para estrenarte
• Paquete 2 — $190 · 110 balas ⭐ · el más pedido
• Paquete 3 — $240 · 150 balas + guantes · modo pro

*Grupos (10+ personas):*
• Familiar 1 — $2,500 · 10 pers., 2,000 balas
• Familiar 2 — $2,800 · 10 pers. + overoles ⭐
• Familiar 3 — $5,200 · 16 pers., 4,000 balas

💳 Solo apartas con *$300 MXN* — el resto lo pagas el día que nos visites.`,
    invite:
      `¿Te late alguno? Aparta tu lugar aquí 👇\n${SITE}\n\n¿Grupo grande o evento especial? Escribe *asesor* y te armamos algo a tu medida.`,
  });

const REPLY_LOCATION = () =>
  buildReply({
    opener: pick([
      "¡Te esperamos con los chalecos listos! 📍",
      "¡Qué emoción que quieras conocernos en persona! 🌲",
    ]),
    explain:
      "Estamos en *La Marquesa*, uno de los rincones más bonitos cerca de la CDMX. Sales de la ciudad, cruzas la México–Toluca y en unos 30 minutos ya estás entre pinos, aire fresco y el campo donde tu equipo va a vivir su misión. No es gotcha cualquiera — es *bosque de verdad*.",
    details:
      `*Gotcha Los Patos*
52743 La Marquesa, Estado de México

🗺️ Maps: https://maps.google.com/?q=Gotcha+Los+Patos+52743+La+Marquesa`,
    invite:
      "Cuando vengas, trae ropa cómoda, buena vibra y ganas de pasarla increíble. ¿Quieres que alguien del equipo te guíe con indicaciones? Escribe *asesor*. ¡Nos vemos en el campo! 🎯",
  });

const REPLY_RESERVE = () =>
  buildReply({
    opener: pick([
      "¡Esa es la actitud! 🎯 Vamos a apartar tu misión.",
      "¡Me encanta! 🔥 Tu aventura en el bosque está a un paso.",
    ]),
    explain:
      "Reservar es rapidísimo y así te aseguras tu horario — sobre todo fines de semana y fechas especiales. Con $300 MXN de anticipo ya tienes tu lugar; el resto lo liquidas el día que llegues, sin sorpresas.",
    details:
      `*Así de fácil:*
1️⃣ Entra a nuestra web
2️⃣ Elige paquete, fecha y horario
3️⃣ Paga el anticipo con Mercado Pago

🔗 ${SITE}`,
    invite:
      "En cuanto se apruebe el pago te confirmamos por aquí y por correo. Imagina contarle a tus amigos que el sábado van al bosque a hacer historia — *ese puede ser tu próximo plan*. ¡Te esperamos! 🌲",
  });

const REPLY_PERSONAL = () =>
  buildReply({
    opener: "¡Por supuesto! 🤝 Tu evento merece atención de verdad.",
    explain:
      "Para cumpleaños, empresas, despedidas, grupos grandes o cualquier idea que quieras armar a tu manera, tenemos gente del equipo que te ayuda personalmente — cotizaciones, horarios flexibles y detalles que el bot no puede cubrir.",
    details:
      `Escríbeles directo aquí:\n📱 *${PERSONAL_DISPLAY}*\nhttps://wa.me/${PERSONAL_PHONE}`,
    invite:
      "Cuéntales qué tienes en mente y te ayudan a que tu grupo se sienta *único*. ¡Va a quedar una experiencia que van a recordar mucho tiempo! 🎯",
  });

const REPLY_UNKNOWN = () =>
  buildReply({
    opener: pick([
      "¡Oye! 👋 Perdón, no alcancé a entenderte bien.",
      "¡Hola de nuevo! 😊 Creo que se me pasó tu mensaje.",
    ]),
    explain:
      "Estoy aquí para platicarte de Gotcha Los Patos — el paintball en bosque cerca de la CDMX donde cada visita se siente especial. Cuéntame qué buscas y con gusto te oriento.",
    details:
      `Puedes escribir:\n• *menu* — ver todas las opciones\n• *precios* · *horarios* · *ubicacion* · *reservar*`,
    invite:
      `¿Prefieres que te atienda alguien del equipo? Escribe *asesor* 📱\n\nO reserva directo: ${SITE}`,
  });

function normalizeForMatch(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matches(text, keywords) {
  const n = normalizeForMatch(text);
  return keywords.some((k) => n.includes(normalizeForMatch(k)));
}

function wantsPersonalAttention(text) {
  const msg = normalizeForMatch(text);
  if (!msg) return false;

  const keywords = [
    "asesor",
    "asesora",
    "asesoria",
    "atencion personal",
    "atencion personalizada",
    "personalizada",
    "personalizado",
    "personalizad",
    "humano",
    "humana",
    "persona real",
    "persona del equipo",
    "hablar con alguien",
    "hablar con una persona",
    "hablar con persona",
    "hablar con un humano",
    "platicar con alguien",
    "platicar con persona",
    "agente",
    "operador",
    "representante",
    "ejecutivo",
    "cotizacion",
    "cotizar",
    "presupuesto",
    "evento especial",
    "evento corporativo",
    "corporativo",
    "cumpleanos",
    "despedida",
    "grupo grande",
    "contacto directo",
    "numero directo",
    "whatsapp directo",
    "me atienda",
    "me atiendan",
    "quiero persona",
    "necesito persona",
  ];

  if (keywords.some((k) => msg.includes(k))) return true;
  if (msg.includes("personaliz")) return true;
  if (msg.includes("atencion") && msg.includes("personal")) return true;
  if (
    msg.includes("hablar") &&
    (msg.includes("alguien") || msg.includes("persona") || msg.includes("humano"))
  ) {
    return true;
  }
  if (
    (msg.includes("quiero") || msg.includes("necesito")) &&
    (msg.includes("persona") || msg.includes("humano") || msg.includes("asesor"))
  ) {
    return true;
  }
  if (msg.includes("evento") && msg.includes("empresa")) return true;
  if (
    msg.includes("empresa") &&
    (msg.includes("cotiz") || msg.includes("evento") || msg.includes("grupo"))
  ) {
    return true;
  }

  return false;
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
    return buildReply({
      opener: "¡Hola! 👋 Revisé por aquí y no encontré reservas con este número.",
      explain:
        "A veces pasa si reservaste con otro teléfono o aún no has apartado tu fecha. Si quieres vivir la experiencia en el bosque, te conviene reservar pronto — los fines de semana se llenan rápido.",
      details: `Puedes reservar en:\n${SITE}`,
      invite:
        "¿Necesitas ayuda? Escribe *asesor* y alguien del equipo te apoya. ¡Ojalá pronto te veamos en el campo! 🎯",
    });
  }

  const firstName = bookings[0].name?.split(" ")[0] || "campeón";
  const lines = bookings.map((b) => {
    const st = statusLabel(b.status, b.payment_status);
    return `• *${b.package_name}*\n  ${b.date} · ${b.slot_time}\n  ${st}`;
  });

  const hasConfirmed = bookings.some(
    (b) => b.status === "confirmed" || b.payment_status === "approved",
  );

  return buildReply({
    opener: `¡Hola *${firstName}*! 👋 Qué gusto saludarte de nuevo.`,
    explain: hasConfirmed
      ? "Ya tienes todo listo para tu misión — solo falta que llegue el día y disfrutes con tu gente. Trae ropa cómoda, buena actitud y ganas de pasarla increíble."
      : "Vi que tienes una reserva en proceso — en cuanto completes el pago te confirmamos al instante y tu lugar queda asegurado.",
    details: `📋 *Tus reservas:*\n\n${lines.join("\n\n")}`,
    invite:
      "¿Alguna duda antes del gran día? Escríbenos *asesor* o responde aquí. ¡Te esperamos en La Marquesa! 🌲",
  });
}

async function sendWelcome(from) {
  await sendText(from, `${pick(WELCOME_OPENER)}\n\n${pick(WELCOME_PITCH)}`);
  await sendText(from, MENU_OPTIONS);
}

async function handleIncomingMessage(from, text) {
  const raw = (text || "").trim();
  if (!raw) return;

  if (wantsPersonalAttention(raw)) {
    await sendText(from, REPLY_PERSONAL());
    return;
  }

  if (
    matches(raw, [
      "hola",
      "buenas",
      "buen dia",
      "buen día",
      "menu",
      "menú",
      "ayuda",
      "help",
      "info",
      "inicio",
      "start",
      "hey",
      "que tal",
      "qué tal",
    ])
  ) {
    await sendWelcome(from);
    return;
  }

  if (matches(raw, ["horario", "horarios", "hora", "schedule", "abierto", "abren"])) {
    await sendText(from, REPLY_SCHEDULE());
    return;
  }

  if (matches(raw, ["precio", "precios", "paquete", "paquetes", "costo", "cuanto", "promo", "promocion"])) {
    await sendText(from, REPLY_PRICES());
    return;
  }

  if (matches(raw, ["ubicacion", "direccion", "donde", "llegar", "mapa", "como llego"])) {
    await sendText(from, REPLY_LOCATION());
    return;
  }

  if (matches(raw, ["reservar", "reserva", "reservacion", "book", "cita", "apartar", "fecha"])) {
    await sendText(from, REPLY_RESERVE());
    return;
  }

  if (matches(raw, ["estado", "mis reservas", "confirmacion", "mi reserva"])) {
    await sendText(from, await buildStatusReply(from));
    return;
  }

  await sendText(from, REPLY_UNKNOWN());
}

module.exports = {
  handleIncomingMessage,
  sendWelcome,
  wantsPersonalAttention,
  normalizeForMatch,
};
