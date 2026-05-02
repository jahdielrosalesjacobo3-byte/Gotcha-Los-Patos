import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Camera } from "lucide-react";
import { GALLERY_PHOTOS } from "../data/content";
import { useLang } from "../contexts/LanguageContext";

function ParallaxPhoto({ photo, index, lang }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
    const isLarge = index === 0 || index === 3;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: index * 0.06 }}
            className={`relative group overflow-hidden rounded-xl border border-white/10 ${
                isLarge ? "md:col-span-2 md:row-span-2 aspect-[4/3]" : "aspect-square"
            }`}
            data-testid={`gallery-photo-${index}`}
        >
            <motion.img
                src={photo.url}
                alt={lang === "es" ? photo.captionEs : photo.captionEn}
                style={{ y, scale }}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
            />
            {/* dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity" />
            {/* tactical corners */}
            <span className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-neon-green/70" />
            <span className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-neon-green/70" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-neon-green/70" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-neon-green/70" />
            {/* tag */}
            <div className="absolute top-4 right-4 px-2 py-1 rounded font-mono text-[10px] tracking-[0.25em] bg-bg/70 backdrop-blur-sm text-neon-green border border-neon-green/40">
                {photo.tag}
            </div>
            {/* caption */}
            <div className="absolute left-5 bottom-5 right-5">
                <p className="font-display text-xl md:text-2xl tracking-wider text-white drop-shadow-lg">
                    {lang === "es" ? photo.captionEs : photo.captionEn}
                </p>
            </div>
            {/* hover scan line */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute left-0 right-0 h-[2px] bg-neon-green/70 animate-scan" />
            </div>
        </motion.div>
    );
}

export default function Gallery() {
    const { t, lang } = useLang();

    return (
        <section
            id="gallery"
            data-testid="gallery-section"
            className="relative py-24 md:py-32 bg-bg overflow-hidden"
        >
            <div className="absolute inset-0 tac-stripes opacity-30" />
            <div className="absolute -top-40 right-0 w-[28rem] h-[28rem] rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #FF007F 0%, transparent 60%)" }} />

            <div className="relative max-w-7xl mx-auto px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-neon-green/80 mb-3">
                        <Camera size={12} /> // {t.gallery.kicker}
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl uppercase tracking-wider text-white">
                        {t.gallery.title}
                    </h2>
                    <p className="mt-4 text-white/65 max-w-2xl mx-auto text-sm md:text-base">
                        {t.gallery.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4">
                    {GALLERY_PHOTOS.map((photo, i) => (
                        <ParallaxPhoto key={i} photo={photo} index={i} lang={lang} />
                    ))}
                </div>
            </div>
        </section>
    );
}
