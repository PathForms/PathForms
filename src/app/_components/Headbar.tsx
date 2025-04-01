"use client";

import React from "react";
import { useEffect } from "react";
import styles from "./components.module.css"; // Ensure that this is the correct path for your CSS module
import { useRouter } from "next/navigation";
interface HeadbarProps {
  theme: "dark" | "light";
  toggleSettings: () => void;
  showSettings: boolean;
  edgeThickness: number;
  handleEdgeThicknessChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleshape: () => void;
}

//function for return

const Headbar: React.FC<HeadbarProps> = ({
  theme,
  toggleSettings,
  showSettings,
  edgeThickness,
  handleEdgeThicknessChange,

  handleThemeChange,
  handleshape,
}) => {
  const colors = [
    "rgb(255, 50, 91)",
    "rgb(0, 255, 106)",
    "rgb(246, 255, 0)",
    "rgb(255, 166, 0)",
    "rgb(255, 0, 255)",
    "rgb(255, 94, 0)",
    "rgb(255, 204, 160)",
    "rgb(152, 0, 137)",
    "rgb(255, 137, 239)",
  ];
  const text = "PathForms!";
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#171717");
    } else {
      root.style.setProperty("--background", "#0a0a0a");
      root.style.setProperty("--foreground", "#ededed");
    }
  }, [theme]);

  const heading = (
    <h1 style={{ cursor: "pointer" }}>
      <a
        href="https://mineyev.web.illinois.edu/PathForms/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", display: "inline-block" }}
      >
        {text.split("").map((char, index) => (
          <span key={index} style={{ color: colors[index % colors.length] }}>
            {char}
          </span>
        ))}
      </a>
    </h1>
  );

  return (
    <div className={`${styles.header} ${styles[theme]}`}>
      {" "}
      {/* Use CSS module styling for dynamic class */}
      <div>{heading}</div>
      <button className={styles["settings-button"]} onClick={toggleSettings}>
        Settings
      </button>
      <button onClick={() => handleshape()}>shape</button>
      {showSettings && (
        <div className={`${styles["settings-modal"]} ${styles[theme]}`}>
          <div>
            <label>Edge Thickness:</label>
            <input
              type="range"
              min="0.7"
              max="10"
              step="0.1"
              value={edgeThickness}
              onChange={handleEdgeThicknessChange}
            />
            <span>{edgeThickness}</span>
          </div>
          <div>
            <label>Theme:</label>
            <select value={theme} onChange={handleThemeChange}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button onClick={toggleSettings}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Headbar;
