import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { createCheckoutPreference } from "../_shared/mercadopago.ts";
import { sendProcessingEmail } from "../_shared/email.ts";

type BookingPayload = {
  name: string;
  phone: string;
  email: string;
  package_id: string;
  package_name: string;
  package_price: number;
  package_type: string;
  participants: number;
  date: string;
  time: string;
  notes?: string;
  deposit: number;
};

function validate(body: BookingPayload) {
  if (!body.name?.trim() || body.name.trim().length < 2) {
    throw new Error("Nombre inválido");
  }
  if (!body.phone?.trim() || body.phone.trim().length < 7) {
    throw new Error("Teléfono inválido");
  }
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Correo electrónico requerido");
  }
  if (!body.date || !body.time) {
    throw new Error("Fecha y horario requeridos");
  }
  if (!body.deposit || body.deposit <= 0) {
    throw new Error("Anticipo inválido");
  }
  return { ...body, email };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405);
  }

  try {
    const raw = await req.json();
    const body = validate(raw as BookingPayload);
    const supabase = getServiceClient();

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email,
        package_id: body.package_id,
        package_name: body.package_name,
        package_price: body.package_price,
        package_type: body.package_type,
        participants: body.participants,
        date: body.date,
        slot_time: body.time,
        notes: (body.notes || "").trim(),
        deposit: body.deposit,
        status: "processing",
        payment_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.message?.includes("booking_conflict")) {
        return jsonResponse(
          { error: "Ese horario está ocupado. Elige otro slot." },
          409,
        );
      }
      throw insertError;
    }

    const preference = await createCheckoutPreference({
      bookingId: booking.id,
      deposit: Number(booking.deposit),
      payerEmail: booking.email,
      payerName: booking.name,
      packageName: booking.package_name,
    });

    await supabase
      .from("bookings")
      .update({
        mp_preference_id: preference.id,
        payment_status: "in_process",
      })
      .eq("id", booking.id);

    try {
      await sendProcessingEmail({
        email: booking.email,
        name: booking.name,
        package_name: booking.package_name,
        date: booking.date,
        slot_time: booking.slot_time,
        deposit: Number(booking.deposit),
        booking_id: booking.id,
      });
    } catch (emailErr) {
      console.error("[create-booking-checkout] email:", emailErr);
    }

    const isTestToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.startsWith("TEST-");
    const checkoutUrl = isTestToken && preference.sandbox_init_point
      ? preference.sandbox_init_point
      : preference.init_point;

    return jsonResponse({
      booking_id: booking.id,
      checkout_url: checkoutUrl,
    });
  } catch (err) {
    console.error("[create-booking-checkout]", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Error interno" },
      500,
    );
  }
});
