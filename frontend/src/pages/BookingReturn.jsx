import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { fetchBookingStatus } from "../lib/bookings";
import { Logo } from "../components/Logo";

const VARIANTS = {
  exito: {
    icon: CheckCircle2,
    iconClass: "text-neon-green",
    titleEs: "¡Pago recibido!",
    titleEn: "Payment received!",
    hintEs: "Tu reserva será confirmada en segundos. Revisa tu correo.",
    hintEn: "Your booking will be confirmed shortly. Check your email.",
  },
  pendiente: {
    icon: Clock,
    iconClass: "text-neon-orange",
    titleEs: "Pago en proceso",
    titleEn: "Payment processing",
    hintEs: "Estamos confirmando tu pago. Te avisaremos por correo.",
    hintEn: "We are confirming your payment. We'll email you when it's done.",
  },
  error: {
    icon: XCircle,
    iconClass: "text-neon-magenta",
    titleEs: "No se completó el pago",
    titleEn: "Payment not completed",
    hintEs: "Puedes intentar reservar de nuevo desde la página principal.",
    hintEn: "You can try booking again from the home page.",
  },
};

export default function BookingReturn({ variant = "exito" }) {
  const [params] = useSearchParams();
  const bookingId = params.get("booking_id");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!bookingId);
  const lang = "es";
  const v = VARIANTS[variant] || VARIANTS.exito;
  const Icon = v.icon;

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    let attempts = 0;
    const maxAttempts = variant === "exito" ? 12 : 4;

    const poll = async () => {
      try {
        const row = await fetchBookingStatus(bookingId);
        if (!active) return;
        setBooking(row);
        if (row?.status === "confirmed" || attempts >= maxAttempts) {
          setLoading(false);
          return;
        }
      } catch {
        if (!active) return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(poll, 2500);
      } else {
        setLoading(false);
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [bookingId, variant]);

  const confirmed = booking?.status === "confirmed";
  const title = confirmed
    ? (lang === "es" ? "¡Reserva confirmada!" : "Booking confirmed!")
    : (lang === "es" ? v.titleEs : v.titleEn);

  return (
    <div className="grain min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="glass-strong max-w-md w-full rounded-xl p-8 border border-white/15 text-center">
        <Logo size={56} className="mx-auto mb-4" />
        {loading ? (
          <Loader2 className="mx-auto animate-spin text-neon-green mb-4" size={40} />
        ) : (
          <Icon className={`mx-auto mb-4 ${confirmed ? "text-neon-green" : v.iconClass}`} size={48} />
        )}
        <h1 className="font-display text-2xl tracking-wider text-white mb-2">{title}</h1>
        <p className="text-sm text-white/70 mb-4">
          {confirmed
            ? (lang === "es"
              ? "Recibirás un correo con los detalles de tu misión."
              : "You'll receive an email with your mission details.")
            : (lang === "es" ? v.hintEs : v.hintEn)}
        </p>
        {booking && (
          <div className="text-left text-xs font-mono text-white/60 space-y-1 mb-6 bg-white/5 rounded-md p-4">
            <p>{booking.package_name}</p>
            <p>{booking.date} · {booking.time}</p>
            <p>Estado: {booking.status} / {booking.payment_status}</p>
          </div>
        )}
        <Link
          to="/"
          className="btn-neon inline-block px-6 py-3 rounded-md text-sm"
        >
          VOLVER AL INICIO
        </Link>
      </div>
    </div>
  );
}
