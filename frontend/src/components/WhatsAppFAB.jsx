import React from "react";
import { motion } from "framer-motion";
import { PHONE_WHATSAPP } from "../data/content";

const WhatsAppIcon = (props) => (
    <svg viewBox="0 0 32 32" fill="currentColor" width="28" height="28" {...props}>
        <path d="M19.11 17.91c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.13-.42-2.16-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.12-.12.27-.32.4-.48.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34s-.96.94-.96 2.29.99 2.66 1.13 2.84c.13.18 1.94 2.96 4.71 4.15 2.77 1.19 2.77.79 3.27.74.5-.05 1.6-.65 1.83-1.29.23-.64.23-1.18.16-1.29-.07-.11-.25-.18-.52-.31zM16 3C8.82 3 3 8.82 3 16c0 2.32.62 4.49 1.7 6.36L3 29l6.81-1.78A12.93 12.93 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.4c-2.06 0-3.99-.61-5.6-1.65l-.4-.25-4.04 1.06 1.08-3.94-.26-.41A10.4 10.4 0 1 1 16 26.4z" />
    </svg>
);

export default function WhatsAppFAB() {
    return (
        <motion.a
            href={`https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent("Hola! Quiero información sobre Gotcha Los Patos La Marquesa.")}`}
            target="_blank"
            rel="noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-bg animate-pulse-neon"
            style={{ background: "#39FF14" }}
            aria-label="Contactar por WhatsApp"
            data-testid="whatsapp-fab"
        >
            <WhatsAppIcon />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-orange border-2 border-bg animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-orange border-2 border-bg" />
        </motion.a>
    );
}
