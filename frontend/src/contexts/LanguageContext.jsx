import React, { createContext, useContext, useState, useMemo } from "react";
import { T } from "../data/content";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState("es");
    const value = useMemo(() => ({
        lang,
        setLang,
        toggle: () => setLang((l) => (l === "es" ? "en" : "es")),
        t: T[lang],
    }), [lang]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
    return ctx;
};
