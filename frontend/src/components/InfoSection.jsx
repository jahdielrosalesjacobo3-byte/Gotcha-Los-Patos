import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Mountain, Shield } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { ADDRESS, ADDRESS_SHORT, MAPS_QUERY, SCHEDULE } from "../data/content";

export default function InfoSection() {
    const { t, lang } = useLang();
    const sched = SCHEDULE[lang];

    return (
        <section
            id="info"
            data-testid="info-section"
            className="relative py-24 md:py-32 bg-bg-deep overflow-hidden"
        >
            {/* Background image overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1688541197263-7b1af0e920fe?crop=entropy&cs=srgb&fm=jpg&q=85')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg-deep via-bg-deep/85 to-bg" />
            <div className="absolute inset-0 tac-stripes opacity-50" />

            <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="font-mono text-[11px] tracking-[0.3em] text-neon-green/80 mb-4">
                            // {t.info.kicker}
                        </div>
                        <h2 className="font-display text-5xl md:text-7xl leading-[0.9] uppercase whitespace-pre-line text-white">
                            {t.info.title}
                        </h2>
                        <p className="mt-6 text-white/75 text-base md:text-lg max-w-xl leading-relaxed">
                            {t.info.body}
                        </p>
                    </motion.div>

                    <div className="mt-10 grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: Mountain, label: lang === "es" ? "Bosque real" : "Real forest", desc: "1+ ha" },
                            { icon: Shield, label: lang === "es" ? "Equipo seguro" : "Safe gear", desc: "100%" },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="glass rounded-md p-4 flex items-center gap-3"
                                data-testid={`info-feature-${i}`}
                            >
                                <div className="w-10 h-10 rounded-md bg-neon-green/15 flex items-center justify-center">
                                    <f.icon size={20} className="text-neon-green" />
                                </div>
                                <div>
                                    <div className="font-display tracking-wider text-white">{f.label}</div>
                                    <div className="font-mono text-[11px] text-white/60">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="glass-strong rounded-md p-6 border-l-2 border-l-neon-green"
                        data-testid="schedule-card"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-neon-green" size={22} />
                            <h3 className="font-display text-xl tracking-widest text-white">
                                {t.info.scheduleTitle}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {sched.map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-baseline justify-between border-b border-white/10 pb-2"
                                >
                                    <span className="font-body font-semibold text-white">{s.days}</span>
                                    <span className="font-mono text-neon-green text-sm">{s.hours}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="glass-strong rounded-md p-6 border-l-2 border-l-neon-orange"
                        data-testid="location-card"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="text-neon-orange" size={22} />
                            <h3 className="font-display text-xl tracking-widest text-white">
                                {t.info.locationTitle}
                            </h3>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{t.info.locationCopy}</p>
                        <p className="font-mono text-xs text-white/60 mt-3">{ADDRESS}</p>
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(MAPS_QUERY)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex font-display tracking-widest text-sm text-neon-green hover:text-white transition"
                            data-testid="open-maps-link"
                        >
                            {lang === "es" ? "ABRIR EN MAPS →" : "OPEN IN MAPS →"}
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
