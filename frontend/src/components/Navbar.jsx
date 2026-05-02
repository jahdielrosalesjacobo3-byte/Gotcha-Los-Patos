import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "../contexts/LanguageContext";

const links = [
    { id: "info", key: "info" },
    { id: "packages", key: "packages" },
    { id: "testimonials", key: "testimonials" },
    { id: "contact", key: "contact" },
];

export default function Navbar({ onBook }) {
    const { lang, toggle, t } = useLang();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id) => {
        setOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? "glass-strong" : "bg-transparent"
            }`}
            data-testid="navbar"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                <button
                    onClick={() => scrollTo("hero")}
                    className="flex items-center gap-3"
                    data-testid="nav-logo"
                >
                    <Logo size={48} />
                    <div className="hidden md:flex flex-col leading-tight">
                        <span className="font-display text-white text-lg tracking-widest">GOTCHA</span>
                        <span className="font-mono text-[10px] text-neon-green tracking-[0.3em]">
                            LOS PATOS · LA MARQUESA
                        </span>
                    </div>
                </button>

                <nav className="hidden lg:flex items-center gap-8">
                    {links.map((l) => (
                        <button
                            key={l.id}
                            data-testid={`nav-${l.id}`}
                            onClick={() => scrollTo(l.id)}
                            className="font-display tracking-widest text-sm text-white/80 hover:text-neon-green transition-colors relative group"
                        >
                            {t.nav[l.key]}
                            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-neon-green group-hover:w-full transition-all" />
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        data-testid="lang-toggle"
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 hover:border-neon-green/60 hover:bg-white/5 transition"
                    >
                        <Globe size={14} className="text-neon-green" />
                        <span className="font-mono text-[11px] tracking-wider">
                            {lang.toUpperCase()}
                        </span>
                    </button>
                    <button
                        onClick={onBook}
                        data-testid="nav-book-btn"
                        className="btn-neon hidden md:inline-flex px-5 py-2.5 rounded-md text-sm"
                    >
                        {t.nav.book}
                    </button>
                    <button
                        className="lg:hidden text-white"
                        onClick={() => setOpen((v) => !v)}
                        data-testid="nav-menu-toggle"
                        aria-label="menu"
                    >
                        {open ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Top stripe accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-neon-green/60 to-transparent" />

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="lg:hidden glass-strong border-t border-white/10"
                    >
                        <div className="flex flex-col px-6 py-6 gap-4">
                            {links.map((l) => (
                                <button
                                    key={l.id}
                                    data-testid={`nav-mobile-${l.id}`}
                                    onClick={() => scrollTo(l.id)}
                                    className="font-display tracking-widest text-left text-base text-white/90 hover:text-neon-green"
                                >
                                    {t.nav[l.key]}
                                </button>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={toggle}
                                    data-testid="lang-toggle-mobile"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15"
                                >
                                    <Globe size={14} className="text-neon-green" />
                                    <span className="font-mono text-[11px] tracking-wider">
                                        {lang.toUpperCase()}
                                    </span>
                                </button>
                                <button
                                    onClick={() => { setOpen(false); onBook(); }}
                                    data-testid="nav-book-btn-mobile"
                                    className="btn-neon px-4 py-2 rounded-md text-sm flex-1"
                                >
                                    {t.nav.book}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
