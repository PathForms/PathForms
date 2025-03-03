"use client";

import React from "react";
import styles from "./components.module.css"; // Ensure that this is the correct path for your CSS module
import { useRouter } from "next/navigation";
interface HeadbarProps {
  theme: "dark" | "light";
  toggleSettings: () => void;
  showSettings: boolean;
  edgeThickness: number;
  handleEdgeThicknessChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

//function for return

const Headbar: React.FC<HeadbarProps> = ({
  theme,
  toggleSettings,
  showSettings,
  edgeThickness,
  handleEdgeThicknessChange,

  handleThemeChange,
}) => {
  const router = useRouter();

  const goToPlayground = () => {
    router.push("/");
  };
  return (
    <div className={`${styles.header} ${styles[theme]}`}>
      {" "}
      {/* Use CSS module styling for dynamic class */}
      <h1>PathForms</h1>
      <button className={styles["settings-button"]} onClick={toggleSettings}>
        Settings
      </button>
      {showSettings && (
        <div className={`${styles["settings-modal"]} ${styles[theme]}`}>
          <div>
            <label>Edge Thickness:</label>
            <input
              type="range"
              min="1"
              max="10"
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
      <button onClick={goToPlayground}>Back to Home</button>
    </div>
  );
};

export default Headbar;
