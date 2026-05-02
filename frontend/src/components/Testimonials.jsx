import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { TESTIMONIALS } from "../data/content";

const accentColors = ["#39FF14", "#FF4500", "#FF007F", "#39FF14", "#FF4500"];

export default function Testimonials() {
    const { t, lang } = useLang();

    return (
        <section
            id="testimonials"
            data-testid="testimonials-section"
            className="relative py-24 md:py-32 bg-bg-deep overflow-hidden"
        >
            {/* Background paint splat */}
            <div className="absolute top-1/4 left-0 w-72 h-72 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #FF007F 0%, transparent 60%)" }} />

            <div className="relative max-w-7xl mx-auto px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="font-mono text-[11px] tracking-[0.3em] text-neon-magenta/80 mb-3">
                        // {t.testimonials.kicker}
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl uppercase tracking-wider text-white">
                        {t.testimonials.title}
                    </h2>
                </motion.div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
                    {TESTIMONIALS.map((rev, i) => {
                        // Bento sizing: first card spans 2 cols on md, 5 cols on lg (big)
                        const layouts = [
                            "md:col-span-3 lg:col-span-5",
                            "md:col-span-3 lg:col-span-4",
                            "md:col-span-3 lg:col-span-3",
                            "md:col-span-3 lg:col-span-4",
                            "md:col-span-6 lg:col-span-8",
                        ];
                        const accent = accentColors[i % accentColors.length];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className={`relative glass rounded-xl p-6 md:p-7 border border-white/10 hover:border-white/30 transition-colors ${layouts[i]}`}
                                data-testid={`testimonial-${i}`}
                                style={{
                                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.02)`,
                                }}
                            >
                                <Quote
                                    size={36}
                                    color={accent}
                                    className="absolute top-4 right-4 opacity-30"
                                />
                                <div className="flex items-center gap-1 mb-3">
                                    {Array.from({ length: rev.rating }).map((_, k) => (
                                        <Star key={k} size={14} fill={accent} stroke={accent} />
                                    ))}
                                </div>
                                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                                    "{lang === "es" ? rev.es : rev.en}"
                                </p>
                                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm tracking-widest"
                                            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}40` }}
                                        >
                                            {rev.name.split(" ")[0][0]}
                                            {rev.name.split(" ").slice(-1)[0][0]}
                                        </div>
                                        <div>
                                            <div className="font-display tracking-wider text-white text-sm">
                                                {rev.name}
                                            </div>
                                            <div className="font-mono text-[10px] tracking-[0.2em] text-white/50">
                                                CLIENTE VERIFICADO
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className="font-mono text-[10px] tracking-[0.2em] px-2 py-1 rounded"
                                        style={{ background: `${accent}15`, color: accent }}
                                    >
                                        {rev.tag}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
