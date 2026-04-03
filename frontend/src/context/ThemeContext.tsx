"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("rakshak-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";

    // Create a soft overlay that fades out for a smooth visual transition
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: ${next === "light" ? "rgba(248,249,252,0.4)" : "rgba(11,15,20,0.4)"};
      pointer-events: none;
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 1;
    `;
    document.body.appendChild(overlay);

    // Apply theme after a micro-delay so overlay is visible first
    requestAnimationFrame(() => {
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("rakshak-theme", next);

      // Fade out the overlay
      requestAnimationFrame(() => {
        overlay.style.opacity = "0";
        overlay.addEventListener("transitionend", () => overlay.remove());
      });
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
