import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Crown, Users, Star } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

const accentMap = {
    "neon-green": {
        ring: "hover:border-neon-green/70",
        glow: "0 0 40px rgba(57,255,20,0.25)",
        text: "text-neon-green",
        bg: "bg-neon-green/10",
        cta: "btn-neon",
        priceColor: "#39FF14",
    },
    "neon-orange": {
        ring: "hover:border-neon-orange/70",
        glow: "0 0 40px rgba(255,69,0,0.25)",
        text: "text-neon-orange",
        bg: "bg-neon-orange/10",
        cta: "btn-orange",
        priceColor: "#FF4500",
    },
    "neon-magenta": {
        ring: "hover:border-neon-magenta/70",
        glow: "0 0 40px rgba(255,0,127,0.25)",
        text: "text-neon-magenta",
        bg: "bg-neon-magenta/10",
        cta: "btn-neon",
        priceColor: "#FF007F",
    },
};

const tagIconMap = {
    BÁSICO: Zap,
    POPULAR: Star,
    PRO: Crown,
    "MÁS PEDIDO": Star,
    EVENTOS: Users,
};

export default function PricingCard({ pkg, type, onBook, index }) {
    const { lang, t } = useLang();
    const a = accentMap[pkg.accent] || accentMap["neon-green"];
    const TagIcon = pkg.tag ? tagIconMap[pkg.tag] || Zap : null;
    const features = lang === "es" ? pkg.featuresEs : pkg.featuresEn;
    const name = lang === "es" ? pkg.nameEs : pkg.nameEn;
    const isFamily = type === "family";

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className={`group relative glass rounded-xl p-7 md:p-8 border border-white/10 transition-all duration-300 ${a.ring}`}
            style={{ boxShadow: pkg.highlight ? a.glow : undefined }}
            data-testid={`package-card-${pkg.id}`}
        >
            {pkg.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-bg border border-neon-orange/60 font-mono text-[10px] tracking-[0.2em] text-neon-orange">
                    ★ {pkg.tag}
                </div>
            )}
            {!pkg.highlight && pkg.tag && TagIcon && (
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${a.bg} ${a.text} font-mono text-[10px] tracking-[0.2em] mb-3`}>
                    <TagIcon size={11} />
                    {pkg.tag}
                </div>
            )}

            <h3 className="font-display text-2xl md:text-3xl tracking-wider text-white">
                {name}
            </h3>

            <div className="mt-5 flex items-baseline gap-2">
                <span className="font-mono text-xs text-white/50">$</span>
                <span
                    className="font-display text-6xl md:text-7xl leading-none"
                    style={{ color: a.priceColor }}
                >
                    {pkg.price.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-white/50 ml-1">
                    {isFamily ? t.packages.mxnGroup : t.packages.mxn}
                </span>
            </div>

            {isFamily && (
                <div className="mt-3 flex items-center gap-3 font-mono text-xs text-white/60">
                    <span className="flex items-center gap-1.5">
                        <Users size={13} className={a.text} />
                        {pkg.people} {t.packages.people}
                    </span>
                    <span>·</span>
                    <span>{pkg.balls.toLocaleString()} {t.packages.balls}</span>
                </div>
            )}

            <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <ul className="space-y-3">
                {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/85">
                        <CheckCircle2 size={16} className={`mt-0.5 ${a.text} flex-shrink-0`} />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onBook(pkg, type)}
                className={`${a.cta} mt-7 w-full px-5 py-3.5 rounded-md text-sm tracking-widest`}
                data-testid={`package-book-${pkg.id}`}
            >
                {isFamily ? t.packages.ctaGroup : t.packages.cta}
            </button>

            {/* Tactical corner accents */}
            <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-l border-t border-white/20" />
            <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-r border-b border-white/20" />
        </motion.article>
    );
}
