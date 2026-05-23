const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Gotcha Los Patos <onboarding@resend.dev>";

function siteUrl() {
  return (process.env.SITE_URL || "https://www.gotchalospatos.xyz").replace(/\/$/, "");
}

function processingHtml(b) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2 style="color:#1a7f37">Reserva en proceso</h2>
      <p>Hola <strong>${b.name}</strong>,</p>
      <p>Tu reserva en <strong>Gotcha Los Patos La Marquesa</strong> está <strong>en proceso</strong>.</p>
      <p>Estamos confirmando tu anticipo de <strong>$${b.deposit} MXN</strong>.</p>
      <ul>
        <li><strong>Paquete:</strong> ${b.package_name}</li>
        <li><strong>Fecha:</strong> ${b.date}</li>
        <li><strong>Hora:</strong> ${b.slot_time}</li>
      </ul>
      <p style="color:#666;font-size:12px">${siteUrl()}</p>
    </div>
  `;
}

function confirmedHtml(b) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2 style="color:#1a7f37">¡Reserva aceptada!</h2>
      <p>Hola <strong>${b.name}</strong>,</p>
      <p>Tu pago fue recibido. Tu reserva está <strong>confirmada</strong>.</p>
      <ul>
        <li><strong>Paquete:</strong> ${b.package_name}</li>
        <li><strong>Fecha:</strong> ${b.date}</li>
        <li><strong>Hora:</strong> ${b.slot_time}</li>
        <li><strong>Anticipo:</strong> $${b.deposit} MXN</li>
      </ul>
      <p>El saldo restante se paga el día de tu visita. WhatsApp: +52 55 6032 6688</p>
      <p style="color:#666;font-size:12px">${siteUrl()}</p>
    </div>
  `;
}

async function sendViaResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY omitida:", subject);
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Resend: ${await res.text()}`);
  }
  return res.json();
}

async function sendProcessingEmail(b) {
  return sendViaResend(
    b.email,
    "Gotcha Los Patos — Reserva en proceso",
    processingHtml(b),
  );
}

async function sendConfirmedEmail(b) {
  return sendViaResend(
    b.email,
    "Gotcha Los Patos — Reserva confirmada",
    confirmedHtml(b),
  );
}

module.exports = { sendProcessingEmail, sendConfirmedEmail };
