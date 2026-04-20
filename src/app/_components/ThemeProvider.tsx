"use client";

import React, { useState, useEffect, useCallback } from "react";
import ThemeContext, { Theme } from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const applyThemeToDocument = (theme: Theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "light") {
    root.style.setProperty("--background", "#e6e6e6");
    root.style.setProperty("--foreground", "#171717");
  } else {
    root.style.setProperty("--background", "#0a0a0a");
    root.style.setProperty("--foreground", "#ededed");
  }
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("theme");
    const initial: Theme = saved === "light" || saved === "dark" ? saved : "dark";
    setThemeState(initial);
    applyThemeToDocument(initial);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", next);
    }
    applyThemeToDocument(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
