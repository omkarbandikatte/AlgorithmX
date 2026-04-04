"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import "@/i18n"; // Boot i18next on module load
import i18n from "i18next";

// Speech/TTS lang codes (BCP-47) for Web Speech API
export type LanguageCode = "en-US" | "hi-IN" | "mr-IN";

// i18next uses two-letter keys (en / hi / mr) – map from BCP-47
const SPEECH_TO_I18N: Record<LanguageCode, string> = {
  "en-US": "en",
  "hi-IN": "hi",
  "mr-IN": "mr",
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LANGUAGES: { code: LanguageCode; name: string; short: string }[] = [
  { code: "en-US", name: "English",          short: "EN" },
  { code: "hi-IN", name: "हिंदी",             short: "हि" },
  { code: "mr-IN", name: "मराठी",             short: "म" },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en-US");

  // Hydrate from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("rakshak-lang") as LanguageCode;
    if (saved && LANGUAGES.find(l => l.code === saved)) {
      setLanguage(saved);
      i18n.changeLanguage(SPEECH_TO_I18N[saved]);
    }
  }, []);

  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem("rakshak-lang", lang);
    // Keep i18next in sync — instant UI translation with no reload
    i18n.changeLanguage(SPEECH_TO_I18N[lang]);
  };

  const languageName = LANGUAGES.find(l => l.code === language)?.name || "English";

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, languageName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
