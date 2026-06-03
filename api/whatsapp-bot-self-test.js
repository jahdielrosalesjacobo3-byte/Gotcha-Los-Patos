const {
  BOT_VERSION,
  classifyMessage,
  wantsPersonalAttention,
} = require("./lib/whatsapp-bot");

const PHRASES = [
  "quiero atencion personalizada",
  "Quiero atención personalizada",
  "asesor",
  "hola",
  "precios",
];

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.authorization === `Bearer ${secret}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const results = PHRASES.map((text) => ({
    text,
    route: classifyMessage(text),
    personal: wantsPersonalAttention(text),
  }));

  const ok =
    results.find((r) => r.text.toLowerCase().includes("atencion"))?.route ===
    "personal";

  res.status(200).json({
    ok,
    version: BOT_VERSION,
    results,
  });
};
