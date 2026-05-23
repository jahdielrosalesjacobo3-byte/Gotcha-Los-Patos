import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LogOut, RefreshCw, Trash2, CheckCircle2, XCircle, Clock, Calendar, Phone, Users, DollarSign, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { Logo } from "../components/Logo";
import {
  fetchAdminBookings,
  updateBookingStatus,
  deleteBooking,
  computeStats,
} from "../lib/bookings";

const STATUS_COLORS = {
    pending: { color: "#FF4500", label: "Pendiente", labelEn: "Pending" },
    confirmed: { color: "#39FF14", label: "Confirmada", labelEn: "Confirmed" },
    cancelled: { color: "#FF007F", label: "Cancelada", labelEn: "Cancelled" },
    completed: { color: "#9CA3AF", label: "Completada", labelEn: "Completed" },
};

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const { lang, toggle, t } = useLang();
    const nav = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState("all");

    const fetchAll = useCallback(async () => {
        setBusy(true);
        try {
            const rows = await fetchAdminBookings();
            setBookings(rows);
            setStats(computeStats(rows));
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.role === "admin") fetchAll();
    }, [user, fetchAll]);

    if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-white/60 font-mono">Cargando...</div>;
    if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

    const updateStatus = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const removeBooking = async (id) => {
        if (!window.confirm(lang === "es" ? "¿Eliminar reserva?" : "Delete booking?")) return;
        try {
            await deleteBooking(id);
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

    return (
        <div className="grain min-h-screen bg-bg" data-testid="admin-dashboard">
            <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo size={44} />
                        <div>
                            <div className="font-display tracking-widest text-white text-lg">{t.admin.title}</div>
                            <div className="font-mono text-[10px] tracking-[0.3em] text-neon-green">
                                ADMIN · {user.email}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggle} className="font-mono text-[11px] tracking-wider px-3 py-1.5 rounded-full border border-white/15 hover:border-neon-green/60 text-white" data-testid="admin-lang">
                            {lang.toUpperCase()}
                        </button>
                        <button onClick={fetchAll} className="p-2 rounded-md border border-white/15 hover:border-neon-green/60 text-white" data-testid="admin-refresh">
                            <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
                        </button>
                        <button onClick={() => { logout(); nav("/"); }} className="flex items-center gap-2 px-3 py-2 rounded-md border border-white/15 hover:border-red-500/60 text-white text-sm" data-testid="admin-logout">
                            <LogOut size={14} /> {t.admin.logout}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8" data-testid="admin-stats">
                        <StatCard icon={Calendar} label={lang === "es" ? "Total" : "Total"} value={stats.total} color="#39FF14" />
                        <StatCard icon={Clock} label={lang === "es" ? "Pendientes" : "Pending"} value={stats.pending} color="#FF4500" />
                        <StatCard icon={CheckCircle2} label={lang === "es" ? "Confirmadas" : "Confirmed"} value={stats.confirmed} color="#39FF14" />
                        <StatCard icon={XCircle} label={lang === "es" ? "Canceladas" : "Cancelled"} value={stats.cancelled} color="#FF007F" />
                        <StatCard icon={DollarSign} label={lang === "es" ? "Anticipos" : "Deposits"} value={`$${stats.collected_deposits.toLocaleString()}`} color="#39FF14" />
                        <StatCard icon={TrendingUp} label={lang === "es" ? "Ingreso est." : "Est. Revenue"} value={`$${stats.estimated_revenue.toLocaleString()}`} color="#FF4500" />
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                    {["all", "pending", "confirmed", "cancelled", "completed"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            data-testid={`filter-${f}`}
                            className={`px-3 py-1.5 rounded-full font-mono text-[11px] tracking-wider border transition ${
                                filter === f
                                    ? "border-neon-green text-neon-green bg-neon-green/10"
                                    : "border-white/15 text-white/70 hover:border-white/30"
                            }`}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-white/50 font-mono text-sm">
                            {lang === "es" ? "Sin reservas en este filtro." : "No bookings under this filter."}
                        </div>
                    )}
                    {filtered.map(b => {
                        const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                        return (
                            <div key={b.id} className="glass rounded-md p-5 border border-white/10" data-testid={`booking-row-${b.id}`}>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex-1 min-w-[260px]">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-display tracking-wider text-white text-lg">{b.name}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-[0.2em]" style={{ background: `${sc.color}22`, color: sc.color }}>
                                                {(lang === "es" ? sc.label : sc.labelEn).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                                            <Info icon={Phone} value={b.phone} />
                                            <Info icon={Calendar} value={`${b.date} · ${b.time}`} />
                                            <Info icon={Users} value={`${b.participants}p`} />
                                            <Info icon={DollarSign} value={`$${b.package_price} (${b.package_name})`} />
                                        </div>
                                        {b.notes && <p className="mt-3 text-sm text-white/70 italic">"{b.notes}"</p>}
                                        {b.email && <p className="mt-2 font-mono text-[11px] text-white/50">{b.email}</p>}
                                        <p className="mt-2 font-mono text-[10px] text-white/40">
                                            {new Date(b.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button onClick={() => updateStatus(b.id, "confirmed")} className="px-3 py-1.5 rounded text-xs font-mono tracking-wider bg-neon-green/15 text-neon-green border border-neon-green/40 hover:bg-neon-green/25" data-testid={`confirm-${b.id}`}>
                                            CONFIRMAR
                                        </button>
                                        <button onClick={() => updateStatus(b.id, "completed")} className="px-3 py-1.5 rounded text-xs font-mono tracking-wider bg-white/5 text-white/70 border border-white/15 hover:bg-white/10" data-testid={`complete-${b.id}`}>
                                            COMPLETAR
                                        </button>
                                        <button onClick={() => updateStatus(b.id, "cancelled")} className="px-3 py-1.5 rounded text-xs font-mono tracking-wider bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/40 hover:bg-neon-magenta/20" data-testid={`cancel-${b.id}`}>
                                            CANCELAR
                                        </button>
                                        <button onClick={() => removeBooking(b.id)} className="p-2 rounded text-white/60 hover:text-red-400" data-testid={`delete-${b.id}`}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="glass rounded-md p-4 border-l-2" style={{ borderLeftColor: color }}>
            <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color }} />
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase">{label}</span>
            </div>
            <div className="font-display text-2xl text-white">{value}</div>
        </div>
    );
}

function Info({ icon: Icon, value }) {
    return (
        <div className="flex items-center gap-2 text-white/75">
            <Icon size={13} className="text-neon-green flex-shrink-0" />
            <span className="truncate">{value}</span>
        </div>
    );
}
