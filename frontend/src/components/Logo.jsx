// Build the brand logo with pure HTML/SVG (image gen failed).
// Neon green circle with red GOTCHA / LOS PATOS text and a magenta paint splatter.
import React from "react";
import { Crosshair } from "lucide-react";

export const Logo = ({ size = 56 }) => {
    return (
        <div
            data-testid="brand-logo"
            className="relative flex items-center justify-center rounded-full"
            style={{
                width: size,
                height: size,
                background: "#39FF14",
                boxShadow: "0 0 24px rgba(57,255,20,0.55)",
                border: "2px solid #2DD30E",
            }}
            aria-label="Gotcha Los Patos La Marquesa"
        >
            <div className="flex flex-col items-center justify-center leading-none select-none">
                <span className="font-display text-[8px] tracking-[0.18em] text-black/80" style={{ marginBottom: 0 }}>
                    LA MARQUESA
                </span>
                <span className="font-display text-red-600 leading-none" style={{ fontSize: size * 0.32 }}>
                    GOTCHA
                </span>
                <span className="font-display text-red-600 leading-none" style={{ fontSize: size * 0.16, marginTop: 1 }}>
                    LOS PATOS
                </span>
            </div>
            {/* Magenta splatter accent */}
            <span
                className="absolute -right-1 -top-1 rounded-full"
                style={{
                    width: size * 0.28,
                    height: size * 0.28,
                    background: "radial-gradient(circle, #FF007F 30%, transparent 70%)",
                    filter: "blur(0.6px)",
                }}
            />
            <span
                className="absolute -left-1 bottom-0 rounded-full opacity-80"
                style={{
                    width: size * 0.18,
                    height: size * 0.18,
                    background: "radial-gradient(circle, #FF4500 30%, transparent 70%)",
                }}
            />
            {/* small crosshair for tactical feel */}
            <Crosshair
                className="absolute"
                size={size * 0.24}
                color="#000"
                style={{ opacity: 0.35, bottom: 4, right: size * 0.28 }}
                strokeWidth={2.5}
            />
        </div>
    );
};

export default Logo;
