"use client";

import { createContext } from "react";

export type Theme = "dark" | "light";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export default ThemeContext;
