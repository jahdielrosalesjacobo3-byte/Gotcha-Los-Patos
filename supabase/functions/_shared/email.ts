type BookingEmail = {
  email: string;
  name: string;
  package_name: string;
  date: string;
  slot_time: string;
  deposit: number;
  booking_id: string;
};

const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Gotcha Los Patos <onboarding@resend.dev>";

function siteUrl() {
  return (Deno.env.get("SITE_URL") || "https://gotchalospatos.vercel.app").replace(/\/$/, "");
}

function processingHtml(b: BookingEmail) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2 style="color:#1a7f37">Reserva en proceso</h2>
      <p>Hola <strong>${b.name}</strong>,</p>
      <p>Recibimos tu solicitud de reserva en <strong>Gotcha Los Patos La Marquesa</strong>.</p>
      <p>Tu reserva está <strong>en proceso</strong> mientras confirmamos tu pago de anticipo ($${b.deposit} MXN).</p>
      <ul>
        <li><strong>Paquete:</strong> ${b.package_name}</li>
        <li><strong>Fecha:</strong> ${b.date}</li>
        <li><strong>Hora:</strong> ${b.slot_time}</li>
        <li><strong>Referencia:</strong> ${b.booking_id}</li>
      </ul>
      <p>Si no completaste el pago, puedes intentar de nuevo desde nuestra web.</p>
      <p style="color:#666;font-size:12px">${siteUrl()}</p>
    </div>
  `;
}

function confirmedHtml(b: BookingEmail) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2 style="color:#1a7f37">¡Reserva aceptada!</h2>
      <p>Hola <strong>${b.name}</strong>,</p>
      <p>Tu pago fue recibido correctamente. Tu reserva está <strong>confirmada</strong>.</p>
      <ul>
        <li><strong>Paquete:</strong> ${b.package_name}</li>
        <li><strong>Fecha:</strong> ${b.date}</li>
        <li><strong>Hora:</strong> ${b.slot_time}</li>
        <li><strong>Anticipo pagado:</strong> $${b.deposit} MXN</li>
      </ul>
      <p>El saldo restante se paga el día de tu visita. ¡Nos vemos en el campo!</p>
      <p>WhatsApp: +52 55 6032 6688</p>
      <p style="color:#666;font-size:12px">${siteUrl()}</p>
    </div>
  `;
}

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY no configurada; correo omitido:", subject);
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${text}`);
  }

  return await res.json();
}

export async function sendProcessingEmail(b: BookingEmail) {
  return sendViaResend(
    b.email,
    "Gotcha Los Patos — Reserva en proceso",
    processingHtml(b),
  );
}

export async function sendConfirmedEmail(b: BookingEmail) {
  return sendViaResend(
    b.email,
    "Gotcha Los Patos — Reserva confirmada",
    confirmedHtml(b),
  );
}
