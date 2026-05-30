const GRAPH_API = "https://graph.facebook.com/v21.0";

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId };
}

function isConfigured() {
  return !!getConfig();
}

/** Normaliza teléfono MX para la API de WhatsApp (solo dígitos, código país 52). */
function normalizePhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) digits = `52${digits}`;
  if (digits.length === 13 && digits.startsWith("521")) {
    digits = `52${digits.slice(3)}`;
  }
  return digits;
}

function adminPhone() {
  return normalizePhone(
    process.env.WHATSAPP_ADMIN_PHONE || "525560326688",
  );
}

async function sendText(to, text) {
  const cfg = getConfig();
  if (!cfg) {
    console.warn("[whatsapp] WHATSAPP_ACCESS_TOKEN o PHONE_NUMBER_ID no configurados");
    return { skipped: true };
  }

  const res = await fetch(`${GRAPH_API}/${cfg.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(to),
      type: "text",
      text: { preview_url: true, body: text },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }
  return data;
}

module.exports = {
  isConfigured,
  normalizePhone,
  adminPhone,
  sendText,
};
