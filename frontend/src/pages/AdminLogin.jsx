import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { Logo } from "../components/Logo";

export default function AdminLogin() {
    const { user, login, loading } = useAuth();
    const { t, lang, toggle } = useLang();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!loading && user && user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const u = await login(email.trim(), password);
            if (u.role === "admin") {
                nav("/admin/dashboard");
            } else {
                setError(lang === "es" ? "Acceso restringido al personal." : "Staff access only.");
            }
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === "string" ? detail : (lang === "es" ? "Credenciales inválidas." : "Invalid credentials."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grain min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden" data-testid="admin-login-page">
            {/* Bg gradients */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(ellipse at top, rgba(57,255,20,0.15), transparent 60%)" }} />
            <div className="absolute inset-0 tac-stripes opacity-40" />

            <button
                onClick={() => nav("/")}
                className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-neon-green font-mono text-xs tracking-[0.2em]"
                data-testid="admin-back"
            >
                <ArrowLeft size={14} /> HOME
            </button>
            <button
                onClick={toggle}
                className="absolute top-6 right-6 px-3 py-1.5 rounded-full border border-white/15 hover:border-neon-green/60 font-mono text-[11px] tracking-wider text-white"
                data-testid="admin-lang-toggle"
            >
                {lang.toUpperCase()}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md glass-strong rounded-xl p-8 border border-white/15"
            >
                <div className="flex flex-col items-center mb-6">
                    <Logo size={64} />
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30">
                        <Shield size={12} className="text-neon-green" />
                        <span className="font-mono text-[10px] tracking-[0.25em] text-neon-green">
                            {t.admin.login}
                        </span>
                    </div>
                    <h1 className="mt-4 font-display text-3xl tracking-widest text-white text-center">
                        {t.admin.title}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase mb-1.5 block">
                            {t.admin.email}
                        </span>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                required
                                type="text"
                                autoComplete="username"
                                placeholder={lang === "es" ? "email@dominio.com  o  AdminGLP2026" : "email@domain.com  or  AdminGLP2026"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bk-input"
                                data-testid="admin-email-input"
                            />
                        </div>
                    </label>
                    <label className="block">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase mb-1.5 block">
                            {t.admin.password}
                        </span>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bk-input"
                                data-testid="admin-password-input"
                            />
                        </div>
                    </label>

                    {error && (
                        <div className="text-sm text-red-400" data-testid="admin-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-neon w-full px-5 py-3.5 rounded-md text-sm disabled:opacity-60"
                        data-testid="admin-login-submit"
                    >
                        {submitting ? "..." : t.admin.enter}
                    </button>
                </form>
            </motion.div>

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
        </div>
    );
}
