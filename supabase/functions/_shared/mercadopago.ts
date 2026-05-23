const MP_API = "https://api.mercadopago.com";

export function getMpToken() {
  const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return token;
}

export type PreferencePayload = {
  bookingId: string;
  deposit: number;
  payerEmail: string;
  payerName: string;
  packageName: string;
};

export async function createCheckoutPreference(payload: PreferencePayload) {
  const siteUrl = (Deno.env.get("SITE_URL") || "https://gotchalospatos.vercel.app").replace(/\/$/, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!.replace(/\/$/, "");
  const webhookUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

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
      success: `${siteUrl}/reserva/exito?booking_id=${payload.bookingId}`,
      failure: `${siteUrl}/reserva/error?booking_id=${payload.bookingId}`,
      pending: `${siteUrl}/reserva/pendiente?booking_id=${payload.bookingId}`,
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

  return data as {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
}

export async function getPayment(paymentId: string) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getMpToken()}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data as {
    id: number;
    status: string;
    status_detail?: string;
    external_reference?: string;
  };
}
