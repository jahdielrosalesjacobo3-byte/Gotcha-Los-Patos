import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { getPayment } from "../_shared/mercadopago.ts";
import { sendConfirmedEmail } from "../_shared/email.ts";

async function applyPaymentUpdate(paymentId: string) {
  const payment = await getPayment(paymentId);
  const bookingId = payment.external_reference;
  if (!bookingId) {
    console.warn("[webhook] sin external_reference", paymentId);
    return;
  }

  const supabase = getServiceClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    console.warn("[webhook] reserva no encontrada", bookingId);
    return;
  }

  const mpStatus = payment.status;
  let status = booking.status;
  let payment_status = booking.payment_status;
  let paid_at = booking.paid_at;

  if (mpStatus === "approved") {
    status = "confirmed";
    payment_status = "approved";
    paid_at = new Date().toISOString();
  } else if (["rejected", "cancelled"].includes(mpStatus)) {
    status = "cancelled";
    payment_status = "rejected";
  } else if (["pending", "in_process"].includes(mpStatus)) {
    status = "processing";
    payment_status = "in_process";
  }

  const wasConfirmed = booking.status === "confirmed";

  await supabase
    .from("bookings")
    .update({
      status,
      payment_status,
      mp_payment_id: String(payment.id),
      paid_at,
    })
    .eq("id", bookingId);

  if (mpStatus === "approved" && !wasConfirmed) {
    try {
      await sendConfirmedEmail({
        email: booking.email,
        name: booking.name,
        package_name: booking.package_name,
        date: booking.date,
        slot_time: booking.slot_time,
        deposit: Number(booking.deposit),
        booking_id: booking.id,
      });
    } catch (emailErr) {
      console.error("[webhook] email confirmación:", emailErr);
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (!paymentId && req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await req.json();
        if (body?.type === "payment" && body?.data?.id) {
          paymentId = String(body.data.id);
        } else if (body?.id) {
          paymentId = String(body.id);
        }
      } else {
        const form = await req.formData();
        paymentId = form.get("data.id")?.toString() || form.get("id")?.toString() || null;
      }
    }

    if (paymentId) {
      await applyPaymentUpdate(paymentId);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("[mercadopago-webhook]", err);
    return jsonResponse({ ok: false }, 500);
  }
});
