const { handleIncomingMessage } = require("./lib/whatsapp-bot");

function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expected) {
    res.status(200).send(challenge);
    return true;
  }
  res.status(403).json({ error: "Verificación fallida" });
  return true;
}

async function processWebhookBody(body) {
  if (body?.object !== "whatsapp_business_account") return;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value?.messages) continue;

      for (const message of value.messages) {
        if (message.type !== "text" || !message.text?.body) continue;
        const from = message.from;
        try {
          await handleIncomingMessage(from, message.text.body);
        } catch (err) {
          console.error("[whatsapp-bot] error:", err);
        }
      }
    }
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    verifyWebhook(req, res);
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    await processWebhookBody(body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[whatsapp-webhook]", err);
    res.status(200).json({ ok: true });
  }
};
