import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Crosshair } from "lucide-react";
import Hero3D from "./Hero3D";
import { useLang } from "../contexts/LanguageContext";

export default function Hero({ onBook }) {
    const { t } = useLang();
    return (
        <section
            id="hero"
            data-testid="hero-section"
            className="relative min-h-[100svh] w-full overflow-hidden bg-bg"
        >
            <Hero3D />

            {/* Tactical HUD frame */}
            <div className="pointer-events-none absolute inset-0 z-10">
                <div className="absolute top-24 left-4 md:left-10 flex items-center gap-2 font-mono text-[10px] text-neon-green/70 tracking-[0.3em]">
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    SYSTEM ONLINE · GRID 19.2856° N, 99.3475° W
                </div>
                <div className="absolute top-24 right-4 md:right-10 font-mono text-[10px] text-white/40 tracking-[0.3em]">
                    SQUAD CHANNEL · #LOS-PATOS
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
                    <span className="font-mono text-[10px] tracking-[0.3em]">SCROLL</span>
                    <ChevronDown className="animate-bounce" size={18} />
                </div>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 pt-36 md:pt-44 pb-24 flex flex-col items-start">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-green/40 bg-neon-green/5 backdrop-blur-sm mb-6"
                    data-testid="hero-badge"
                >
                    <Crosshair size={14} className="text-neon-green" />
                    <span className="font-mono text-[11px] text-neon-green tracking-[0.25em]">
                        {t.hero.badge}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-display uppercase leading-[0.85] text-[clamp(3.5rem,11vw,9rem)] tracking-tight max-w-5xl"
                    data-testid="hero-title"
                >
                    <span className="text-white text-glow-green block">{t.hero.titleA}</span>
                    <span className="text-neon-orange text-glow-orange block">
                        {t.hero.titleB}
                    </span>
                    <span className="text-white block stroke-text">{t.hero.titleC}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-8 max-w-xl text-base md:text-lg text-white/80 leading-relaxed"
                    data-testid="hero-subtitle"
                >
                    {t.hero.subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-10 flex flex-wrap items-center gap-4"
                >
                    <button
                        onClick={onBook}
                        className="btn-neon px-8 py-4 rounded-md text-sm md:text-base"
                        data-testid="hero-cta-book"
                    >
                        {t.hero.cta}
                    </button>
                    <a
                        href="#packages"
                        className="px-8 py-4 rounded-md text-sm md:text-base font-display tracking-widest border border-white/20 text-white hover:bg-white/5 hover:border-neon-green/60 transition"
                        data-testid="hero-cta-packages"
                    >
                        {t.hero.cta2}
                    </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl w-full"
                >
                    {t.hero.stats.map((s, i) => (
                        <div
                            key={i}
                            className="glass rounded-md p-4 border-l-2 border-l-neon-green/60"
                            data-testid={`hero-stat-${i}`}
                        >
                            <div className="font-display text-3xl md:text-4xl text-white">{s.value}</div>
                            <div className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase mt-1">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
