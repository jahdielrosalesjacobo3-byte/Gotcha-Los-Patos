import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, User, Phone, Mail, MessageSquare, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { DEPOSIT, PHONE_WHATSAPP, TIME_SLOTS_WEEKDAY, TIME_SLOTS_WEEKEND } from "../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const toMin = (t) => {
    const [h, m] = t.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
};

// A slot is blocked if any existing booking time is within ±60 minutes
const isSlotBlocked = (slot, blockedTimes) => {
    const s = toMin(slot);
    return blockedTimes.some((b) => Math.abs(toMin(b) - s) <= 60);
};

// Determine slots based on date weekday
const slotsForDate = (dateStr) => {
    if (!dateStr) return [];
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d)) return [];
    const wd = d.getDay(); // 0=Sun, 6=Sat
    return wd === 0 || wd === 6 ? TIME_SLOTS_WEEKEND : TIME_SLOTS_WEEKDAY;
};

function buildWhatsappUrl({ name, pkgName, participants, date, time, deposit, total, lang }) {
    const txt = lang === "es"
        ? `Hola! Soy *${name}*. Quiero confirmar mi reserva en *Gotcha Los Patos La Marquesa*.\n\n📦 Paquete: *${pkgName}*\n👥 Participantes: ${participants}\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n💵 Total: $${total} MXN\n💳 Anticipo a pagar hoy: $${deposit} MXN`
        : `Hi! I'm *${name}*. I want to confirm my booking at *Gotcha Los Patos La Marquesa*.\n\n📦 Package: *${pkgName}*\n👥 Participants: ${participants}\n📅 Date: ${date}\n⏰ Time: ${time}\n💵 Total: $${total} MXN\n💳 Deposit today: $${deposit} MXN`;
    return `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(txt)}`;
}

export default function BookingModal({ open, onClose, pkg, type }) {
    const { t, lang } = useLang();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        participants: 1,
        date: "",
        time: "",
        notes: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null); // null | { whatsappUrl }
    const [error, setError] = useState("");
    const [blockedTimes, setBlockedTimes] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (open) {
            setSuccess(null);
            setError("");
            setBlockedTimes([]);
            setForm((f) => ({
                ...f,
                date: "",
                time: "",
                participants: type === "family" ? Math.min(pkg?.people || 10, 10) : 1,
            }));
        }
    }, [open, pkg, type]);

    // When date changes, fetch availability
    useEffect(() => {
        if (!open || !form.date) {
            setBlockedTimes([]);
            return;
        }
        let active = true;
        setLoadingSlots(true);
        axios
            .get(`${API}/availability`, { params: { date: form.date } })
            .then((r) => { if (active) setBlockedTimes(r.data.blocked_times || []); })
            .catch(() => { if (active) setBlockedTimes([]); })
            .finally(() => { if (active) setLoadingSlots(false); });
        return () => { active = false; };
    }, [open, form.date]);

    const dateSlots = useMemo(() => slotsForDate(form.date), [form.date]);
    const availableSlots = useMemo(
        () => dateSlots.map((s) => ({ time: s, blocked: isSlotBlocked(s, blockedTimes) })),
        [dateSlots, blockedTimes]
    );

    const total = useMemo(() => {
        if (!pkg) return 0;
        const p = Number(form.participants) || 1;
        return type === "family" ? pkg.price : pkg.price * p;
    }, [pkg, type, form.participants]);
    const depositToPay = Math.min(DEPOSIT, total);
    const remaining = Math.max(total - depositToPay, 0);

    const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pkg) return;
        if (!form.name || !form.phone || !form.date || !form.time) {
            setError(t.booking.error);
            return;
        }
        // Frontend block check
        if (isSlotBlocked(form.time, blockedTimes)) {
            setError(t.booking.timeConflict);
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                email: form.email || null,
                package_id: pkg.id,
                package_name: lang === "es" ? pkg.nameEs : pkg.nameEn,
                package_price: pkg.price,
                package_type: type,
                participants: Number(form.participants) || 1,
                date: form.date,
                time: form.time,
                notes: form.notes,
                deposit: depositToPay,
            };
            await axios.post(`${API}/bookings`, payload);
            const wa = buildWhatsappUrl({
                name: form.name,
                pkgName: payload.package_name,
                participants: payload.participants,
                date: form.date,
                time: form.time,
                deposit: depositToPay,
                total,
                lang,
            });
            setSuccess({ whatsappUrl: wa });
            // Auto-redirect to WhatsApp after short delay
            setTimeout(() => {
                window.open(wa, "_blank");
            }, 600);
        } catch (e) {
            const detail = e.response?.data?.detail;
            const status = e.response?.status;
            if (status === 409) {
                setError(typeof detail === "string" ? detail : t.booking.timeConflict);
                // Refresh availability so the slot becomes visibly blocked
                if (form.date) {
                    try {
                        const r = await axios.get(`${API}/availability`, { params: { date: form.date } });
                        setBlockedTimes(r.data.blocked_times || []);
                    } catch {}
                }
            } else {
                setError(typeof detail === "string" ? detail : t.booking.error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!pkg) return null;
    const name = lang === "es" ? pkg.nameEs : pkg.nameEn;

    return (
        <>
        <AnimatePresence>
            {open && (
                <motion.div
                    key="booking-modal-root"
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-testid="booking-modal"
                >
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.94, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.94, y: 16 }}
                        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl border border-white/15 bg-bg-surface shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 px-6 pt-6 pb-4 bg-bg-surface border-b border-white/10 flex items-start justify-between">
                            <div>
                                <div className="font-mono text-[10px] tracking-[0.3em] text-neon-green mb-1">
                                    // {pkg.tag || "MISIÓN"}
                                </div>
                                <h3 className="font-display text-2xl md:text-3xl tracking-wider text-white">
                                    {t.booking.title}
                                </h3>
                                <p className="text-xs text-white/60 mt-1">{name} · ${total} MXN</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-md hover:bg-white/10 text-white/70"
                                aria-label="close"
                                data-testid="booking-close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {success ? (
                            <div className="p-6 text-center" data-testid="booking-success">
                                <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="text-neon-green" size={36} />
                                </div>
                                <h4 className="font-display text-2xl tracking-wider text-white mb-2">
                                    {t.booking.successTitle}
                                </h4>
                                <p className="text-sm text-white/70 mb-6">{t.booking.successBody}</p>
                                <a
                                    href={success.whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-neon inline-flex px-6 py-3 rounded-md text-sm"
                                    data-testid="booking-success-whatsapp"
                                >
                                    {t.booking.confirm}
                                </a>
                            </div>
                        ) : (
                            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                                <div className="rounded-md border border-neon-orange/40 bg-neon-orange/10 p-4 flex items-start gap-3">
                                    <Shield className="text-neon-orange mt-0.5" size={18} />
                                    <p className="text-xs text-white/85 leading-relaxed">
                                        {t.booking.subtitle}
                                    </p>
                                </div>

                                <Field icon={User} label={t.booking.name}>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="bk-input"
                                        data-testid="booking-name"
                                    />
                                </Field>
                                <Field icon={Phone} label={t.booking.phone}>
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="bk-input"
                                        data-testid="booking-phone"
                                    />
                                </Field>
                                <Field icon={Mail} label={t.booking.email}>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="bk-input"
                                        data-testid="booking-email"
                                    />
                                </Field>

                                <div className="grid grid-cols-1 gap-3">
                                    <Field icon={Users} label={t.booking.participants}>
                                        <input
                                            required
                                            type="number"
                                            min={1}
                                            max={type === "family" ? pkg.people : 4}
                                            value={form.participants}
                                            onChange={(e) => handleChange("participants", e.target.value)}
                                            className="bk-input"
                                            data-testid="booking-participants"
                                        />
                                    </Field>
                                </div>
                                <Field icon={Calendar} label={t.booking.date}>
                                    <input
                                        required
                                        type="date"
                                        min={new Date().toISOString().split("T")[0]}
                                        value={form.date}
                                        onChange={(e) => handleChange("date", e.target.value)}
                                        className="bk-input"
                                        data-testid="booking-date"
                                    />
                                </Field>

                                {/* Time slots picker */}
                                <div>
                                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase mb-1.5 flex items-center gap-2">
                                        <Clock size={12} className="text-neon-green" />
                                        {t.booking.time}
                                    </span>
                                    {!form.date ? (
                                        <p className="text-xs text-white/40 italic px-1 py-2">
                                            {lang === "es" ? "Selecciona primero una fecha" : "Pick a date first"}
                                        </p>
                                    ) : dateSlots.length === 0 ? (
                                        <p className="text-xs text-neon-orange/90 px-1 py-2">
                                            {t.booking.noSlotsToday}
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2" data-testid="time-slots-grid">
                                            {availableSlots.map(({ time: slot, blocked }) => {
                                                const selected = form.time === slot;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={slot}
                                                        disabled={blocked}
                                                        onClick={() => !blocked && handleChange("time", slot)}
                                                        data-testid={`time-slot-${slot}`}
                                                        title={blocked ? t.booking.slotTaken : t.booking.slotAvailable}
                                                        className={`relative px-2 py-2 rounded-md font-mono text-xs tracking-wider border transition ${
                                                            blocked
                                                                ? "border-red-500/30 bg-red-500/5 text-red-400/60 cursor-not-allowed line-through"
                                                                : selected
                                                                    ? "border-neon-green bg-neon-green/15 text-neon-green"
                                                                    : "border-white/15 text-white/80 hover:border-neon-green/60 hover:text-neon-green"
                                                        }`}
                                                    >
                                                        {slot}
                                                        {blocked && (
                                                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {loadingSlots && (
                                        <p className="text-[10px] font-mono text-white/40 mt-2">
                                            {lang === "es" ? "Verificando disponibilidad..." : "Checking availability..."}
                                        </p>
                                    )}
                                    {form.date && dateSlots.length > 0 && (
                                        <p className="text-[10px] font-mono text-white/40 mt-2">
                                            {lang === "es"
                                                ? "Cada reserva ocupa ±1 h alrededor del horario elegido."
                                                : "Each booking occupies a ±1 hr buffer around the picked slot."}
                                        </p>
                                    )}
                                </div>
                                <Field icon={MessageSquare} label={t.booking.notes}>
                                    <textarea
                                        rows={2}
                                        value={form.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        className="bk-input resize-none"
                                        data-testid="booking-notes"
                                    />
                                </Field>

                                {/* Cost summary */}
                                <div className="rounded-md border border-white/10 p-4 space-y-2 bg-white/5">
                                    <Row label={t.booking.totalLabel} value={`$${total.toLocaleString()} MXN`} />
                                    <Row label={t.booking.depositLabel} value={`$${depositToPay.toLocaleString()} MXN`} accent />
                                    <Row label={t.booking.remainingLabel} value={`$${remaining.toLocaleString()} MXN`} muted />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-400">
                                        <AlertTriangle size={16} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-neon w-full px-5 py-3.5 rounded-md text-sm disabled:opacity-60"
                                    data-testid="booking-submit"
                                >
                                    {submitting ? t.booking.sending : t.booking.confirm}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        <style>{`
            .bk-input {
                width: 100%;
                padding: 10px 12px 10px 36px;
                border-radius: 6px;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.12);
                color: #fff;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            .bk-input:focus {
                border-color: rgba(57,255,20,0.6);
                background: rgba(57,255,20,0.05);
            }
        `}</style>
        </>
    );
}

function Field({ icon: Icon, label, children }) {
    return (
        <label className="block">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase mb-1.5 block">
                {label}
            </span>
            <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                {children}
            </div>
        </label>
    );
}

function Row({ label, value, accent, muted }) {
    return (
        <div className="flex items-center justify-between">
            <span className={`text-xs ${muted ? "text-white/50" : "text-white/75"}`}>{label}</span>
            <span className={`font-display tracking-wider ${accent ? "text-neon-orange text-lg" : muted ? "text-white/60" : "text-white"}`}>
                {value}
            </span>
        </div>
    );
}
