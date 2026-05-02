import React from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, MapPin, Phone, Clock, Lock } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "../contexts/LanguageContext";
import { ADDRESS, PHONE_DISPLAY, PHONE_WHATSAPP, SCHEDULE, SOCIAL_LINKS } from "../data/content";

const TikTokIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-5.31 12.18 6.65 6.65 0 0 0 4.4 1.66 6.65 6.65 0 0 0 6.65-6.65V9.5a8.34 8.34 0 0 0 4.79 1.5V7.5a4.85 4.85 0 0 1-1.3-.81z" />
    </svg>
);

export default function CTASection({ onBook }) {
    const { t } = useLang();
    return (
        <section
            id="contact"
            data-testid="cta-section"
            className="relative py-24 md:py-32 bg-bg overflow-hidden"
        >
            <div className="absolute inset-0 opacity-25"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1759872138838-45bd5c07ddc6?crop=entropy&cs=srgb&fm=jpg&q=85')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/90 to-bg-deep" />

            <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.9] text-white"
                >
                    <span className="block">{t.cta.title.split(" ").slice(0, -1).join(" ")}</span>
                    <span className="text-neon-orange text-glow-orange">
                        {t.cta.title.split(" ").slice(-1)}
                    </span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 text-white/75 text-base md:text-lg max-w-xl mx-auto"
                >
                    {t.cta.subtitle}
                </motion.p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={onBook}
                        className="btn-neon px-8 py-4 rounded-md text-sm md:text-base"
                        data-testid="cta-book"
                    >
                        {t.cta.book}
                    </button>
                    <a
                        href={`https://wa.me/${PHONE_WHATSAPP}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-4 rounded-md font-display tracking-widest border border-white/20 text-white hover:bg-white/5 hover:border-neon-green/60 transition"
                        data-testid="cta-whatsapp"
                    >
                        {t.cta.whatsapp}
                    </a>
                </div>
            </div>
        </section>
    );
}

export function Footer() {
    const { t, lang } = useLang();
    const sched = SCHEDULE[lang];
    return (
        <footer className="relative bg-bg-deep border-t border-white/10 overflow-hidden" data-testid="footer">
            {/* Big outline text texture */}
            <div className="pointer-events-none absolute inset-x-0 -top-6 flex items-center justify-center select-none">
                <span className="font-display text-[18vw] leading-none tracking-tight stroke-text whitespace-nowrap">
                    GOTCHA · LOS PATOS
                </span>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                        <Logo size={56} />
                        <div>
                            <div className="font-display tracking-widest text-2xl text-white">
                                GOTCHA LOS PATOS
                            </div>
                            <div className="font-mono text-[10px] tracking-[0.3em] text-neon-green">
                                LA MARQUESA · MEX
                            </div>
                        </div>
                    </div>
                    <p className="mt-5 text-white/70 max-w-md text-sm leading-relaxed">
                        {t.footer.tagline} · {t.info.locationCopy}
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                        <a
                            href={SOCIAL_LINKS.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-md border border-white/15 flex items-center justify-center hover:border-neon-green hover:text-neon-green transition"
                            data-testid="social-facebook"
                            aria-label="Facebook"
                        >
                            <Facebook size={18} />
                        </a>
                        <a
                            href={SOCIAL_LINKS.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-md border border-white/15 flex items-center justify-center hover:border-neon-green hover:text-neon-green transition"
                            data-testid="social-instagram"
                            aria-label="Instagram"
                        >
                            <Instagram size={18} />
                        </a>
                        <a
                            href={SOCIAL_LINKS.tiktok}
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-md border border-white/15 flex items-center justify-center hover:border-neon-green hover:text-neon-green transition"
                            data-testid="social-tiktok"
                            aria-label="TikTok"
                        >
                            <TikTokIcon />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="font-display tracking-widest text-white text-sm mb-4">
                        {t.footer.quickLinks}
                    </h4>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li><a href="#info" className="hover:text-neon-green">{t.nav.info}</a></li>
                        <li><a href="#packages" className="hover:text-neon-green">{t.nav.packages}</a></li>
                        <li><a href="#testimonials" className="hover:text-neon-green">{t.nav.testimonials}</a></li>
                        <li><a href="#contact" className="hover:text-neon-green">{t.nav.contact}</a></li>
                        <li>
                            <a href="/admin/login" className="inline-flex items-center gap-1 text-white/40 hover:text-neon-green text-xs" data-testid="admin-link">
                                <Lock size={11} /> {t.footer.adminLink}
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-display tracking-widest text-white text-sm mb-4">
                        {t.footer.contact}
                    </h4>
                    <ul className="space-y-3 text-sm text-white/70">
                        <li className="flex items-start gap-2">
                            <MapPin size={14} className="text-neon-green mt-0.5" />
                            <span>{ADDRESS}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Phone size={14} className="text-neon-green mt-0.5" />
                            <a href={`https://wa.me/${PHONE_WHATSAPP}`} className="hover:text-neon-green">{PHONE_DISPLAY}</a>
                        </li>
                        <li className="flex items-start gap-2">
                            <Clock size={14} className="text-neon-green mt-0.5" />
                            <div className="space-y-1">
                                {sched.map((s, i) => (
                                    <div key={i} className="text-xs text-white/65">
                                        <span className="font-semibold text-white/80">{s.days}</span>
                                        <br />
                                        <span className="font-mono">{s.hours}</span>
                                    </div>
                                ))}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="relative border-t border-white/10 py-6 px-6 text-center font-mono text-[11px] tracking-[0.2em] text-white/40">
                © {new Date().getFullYear()} GOTCHA LOS PATOS LA MARQUESA · {t.footer.rights}
            </div>
        </footer>
    );
}
