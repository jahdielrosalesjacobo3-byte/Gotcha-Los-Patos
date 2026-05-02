import React from "react";
import { motion } from "framer-motion";
import PricingCard from "./PricingCard";
import { PACKAGES_INDIVIDUAL, PACKAGES_FAMILY } from "../data/content";
import { useLang } from "../contexts/LanguageContext";

export default function Packages({ onBook }) {
    const { t } = useLang();
    return (
        <section
            id="packages"
            data-testid="packages-section"
            className="relative py-24 md:py-32 bg-bg overflow-hidden"
        >
            {/* Splatter accents */}
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #39FF14 0%, transparent 60%)" }} />
            <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #FF4500 0%, transparent 60%)" }} />

            <div className="relative max-w-7xl mx-auto px-6 md:px-10">
                {/* INDIVIDUAL */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="font-mono text-[11px] tracking-[0.3em] text-neon-green/80 mb-3">
                            // {t.packages.kickerInd}
                        </div>
                        <h2 className="font-display text-5xl md:text-6xl uppercase tracking-wider text-white">
                            <span className="splat-underline">{t.packages.titleInd}</span>
                        </h2>
                        <div className="divider-splat mx-auto mt-6" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PACKAGES_INDIVIDUAL.map((p, i) => (
                            <PricingCard
                                key={p.id}
                                pkg={p}
                                type="individual"
                                onBook={onBook}
                                index={i}
                            />
                        ))}
                    </div>
                </div>

                {/* FAMILY */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="font-mono text-[11px] tracking-[0.3em] text-neon-orange/80 mb-3">
                            // {t.packages.kickerFam}
                        </div>
                        <h2 className="font-display text-5xl md:text-6xl uppercase tracking-wider text-white">
                            {t.packages.titleFam}
                        </h2>
                        <div className="divider-splat mx-auto mt-6" style={{ background: "linear-gradient(90deg, transparent, #FF4500, transparent)", boxShadow: "0 0 16px #FF4500" }} />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PACKAGES_FAMILY.map((p, i) => (
                            <PricingCard
                                key={p.id}
                                pkg={p}
                                type="family"
                                onBook={onBook}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
