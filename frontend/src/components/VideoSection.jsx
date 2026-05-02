import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Youtube } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { YOUTUBE_VIDEO_ID, YOUTUBE_URL } from "../data/content";

export default function VideoSection() {
    const { t } = useLang();
    const [playing, setPlaying] = useState(false);
    const thumb = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;

    return (
        <section
            id="video"
            data-testid="video-section"
            className="relative py-24 md:py-32 bg-bg-deep overflow-hidden"
        >
            <div className="absolute inset-0 tac-stripes opacity-40" />
            <div className="absolute -top-40 left-0 w-[24rem] h-[24rem] rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #39FF14 0%, transparent 60%)" }} />

            <div className="relative max-w-6xl mx-auto px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-neon-orange/90 mb-3">
                        <Youtube size={14} /> // {t.videoSection.kicker}
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl uppercase tracking-wider text-white">
                        {t.videoSection.title}
                    </h2>
                    <p className="mt-4 text-white/65 max-w-2xl mx-auto text-sm md:text-base">
                        {t.videoSection.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 shadow-2xl"
                    style={{ boxShadow: "0 0 60px rgba(57,255,20,0.18)" }}
                    data-testid="video-player"
                >
                    {!playing ? (
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            className="group absolute inset-0 w-full h-full"
                            aria-label="Play video"
                            data-testid="video-play"
                        >
                            <img
                                src={thumb}
                                alt="Gotcha Los Patos video"
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`;
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/80 via-transparent to-bg-deep/40" />
                            {/* Play button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <span className="absolute inset-0 rounded-full bg-neon-green/30 blur-2xl" />
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-neon-green text-bg-deep transition-transform group-hover:scale-110 animate-pulse-neon">
                                        <Play size={36} fill="currentColor" className="ml-1" />
                                    </div>
                                </div>
                            </div>
                            {/* Tactical corners */}
                            <span className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-neon-green" />
                            <span className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-neon-green" />
                            <span className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-neon-green" />
                            <span className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-neon-green" />
                            <span className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded font-mono text-[10px] tracking-[0.3em] bg-bg/70 backdrop-blur-sm text-neon-green border border-neon-green/40">
                                ► HD VIDEO
                            </span>
                        </button>
                    ) : (
                        <iframe
                            title="Gotcha Los Patos La Marquesa - Video"
                            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                            data-testid="video-iframe"
                        />
                    )}
                </motion.div>

                <div className="mt-6 text-center">
                    <a
                        href={YOUTUBE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-white/60 hover:text-neon-green transition"
                        data-testid="video-youtube-link"
                    >
                        <Youtube size={14} /> VER EN YOUTUBE →
                    </a>
                </div>
            </div>
        </section>
    );
}
