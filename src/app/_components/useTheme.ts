"use client";

import { useContext } from "react";
import ThemeContext, { ThemeContextValue } from "./ThemeContext";

const useTheme = (): ThemeContextValue => useContext(ThemeContext);

export default useTheme;
