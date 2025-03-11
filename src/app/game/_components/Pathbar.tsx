"use client";
import React, { useEffect, useState } from "react";
import "./components.module.css";

type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
  up: "a",
  down: "a-",
  right: "b",
  left: "b-",
};
interface PathBarProps {
  demonstratePath: (index: number) => void;
  concatenate: (index1: number, index2: number) => void;
  invert: (index: number) => void;

  clear: () => void;

  nodePaths: string[][];
  edgePaths: string[][];
  movePaths: string[][];
}

const Pathbar: React.FC<PathBarProps> = ({
  demonstratePath,
  concatenate,
  invert,

  clear,

  nodePaths,
  edgePaths,
  movePaths,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 10,
        color: "rgb(13, 255, 0)",
        zIndex: 10,
        width: "auto",
        maxWidth: "500px", // Limits width to avoid overflow
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional subtle background for visibility
        padding: "10px",
        borderRadius: "8px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "10px",
        }}
      >
        {[
          { label: "Show Path 1", action: () => demonstratePath(0) },
          { label: "Show Path 2", action: () => demonstratePath(1) },
          { label: "Invert Path 1", action: () => invert(0) },
          { label: "Invert Path 2", action: () => invert(1) },
          { label: "Concatenate Path 1", action: () => concatenate(0, 1) },
          { label: "Concatenate Path 2", action: () => concatenate(1, 0) },
          { label: "Clear Stored Data", action: clear },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            style={{
              height: "35px",
              width: "100%", // Responsive width
              backgroundColor: "transparent",
              border: "2px solid",
              borderColor: "rgb(13, 255, 0)",
              color: "rgb(13, 255, 0)",
              fontSize: "14px",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "0.3s",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pathbar;
