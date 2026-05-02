// Brand logo: uses the original image asset directly.
import React from "react";
import { LOGO_URL } from "../data/content";

export const Logo = ({ size = 56, className = "" }) => {
    return (
        <div
            data-testid="brand-logo"
            className={`relative inline-block rounded-full overflow-hidden ${className}`}
            style={{
                width: size,
                height: size,
                boxShadow: "0 0 24px rgba(57,255,20,0.55), 0 0 0 2px #2DD30E",
                background: "#39FF14",
            }}
            aria-label="Gotcha Los Patos La Marquesa"
        >
            <img
                src={LOGO_URL}
                alt="Gotcha Los Patos La Marquesa"
                width={size}
                height={size}
                draggable={false}
                className="w-full h-full object-cover select-none"
            />
        </div>
    );
};

export default Logo;
