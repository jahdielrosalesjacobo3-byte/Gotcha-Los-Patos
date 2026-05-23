const MP_API = "https://api.mercadopago.com";

function getMpToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return token;
}

function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://scorpioncode.dev";
}

async function createCheckoutPreference(payload) {
  const base = siteUrl();
  const webhookUrl = `${base}/api/mercadopago-webhook`;

  const body = {
    items: [
      {
        id: payload.bookingId,
        title: `Anticipo — ${payload.packageName}`,
        description: "Reserva Gotcha Los Patos La Marquesa",
        quantity: 1,
        currency_id: "MXN",
        unit_price: Number(payload.deposit),
      },
    ],
    payer: {
      email: payload.payerEmail,
      name: payload.payerName,
    },
    back_urls: {
      success: `${base}/reserva/exito?booking_id=${payload.bookingId}`,
      failure: `${base}/reserva/error?booking_id=${payload.bookingId}`,
      pending: `${base}/reserva/pendiente?booking_id=${payload.bookingId}`,
    },
    auto_return: "approved",
    external_reference: payload.bookingId,
    notification_url: webhookUrl,
    statement_descriptor: "GOTCHA PATOS",
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getMpToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

async function getPayment(paymentId) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getMpToken()}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

module.exports = { createCheckoutPreference, getPayment, siteUrl };
