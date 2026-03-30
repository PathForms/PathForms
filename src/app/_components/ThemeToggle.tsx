"use client";

import React, { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === "light") {
    root.style.setProperty("--background", "#ffffff");
    root.style.setProperty("--foreground", "#171717");
  } else {
    root.style.setProperty("--background", "#0a0a0a");
    root.style.setProperty("--foreground", "#ededed");
  }
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme: Theme =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (typeof window === "undefined") return;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const listener = (event: Event) => {
      const custom = event as CustomEvent<Theme>;
      if (custom.detail === "light" || custom.detail === "dark") {
        setTheme(custom.detail);
      }
    };

    window.addEventListener("theme-change", listener);
    return () => window.removeEventListener("theme-change", listener);
  }, []);

  const buttonText = theme === "dark" ? "Switch to Light" : "Switch to Dark";

  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      aria-label="Toggle dark and light theme"
      type="button"
    >
      {theme === "dark" ? "☀️" : "🌙"} {buttonText}
    </button>
  );
};

export default ThemeToggle;
