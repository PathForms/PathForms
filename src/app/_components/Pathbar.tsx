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
  mode: string;
  setInvert: () => void;
  setConcat: () => void;
  demonstratePath: (index: number) => void;
  concatenate: (index1: number, index2: number) => void;
  invert: (index: number) => void;
  clear: () => void;

  nodePaths: string[][];
  edgePaths: string[][];
  movePaths: string[][];
}

const InvertStyles = (mode: string) => {
  switch (mode) {
    case "invert":
      return {
        backgroundColor: "rgb(13, 255, 0)",
        color: "black",
        borderColor: "rgb(13, 255, 0)",
      };
    default:
      return {
        backgroundColor: "transparent",
        color: "rgb(13, 255, 0)",
        borderColor: "rgb(13, 255, 0)",
      };
  }
};
const ConcatStyles = (mode: string) => {
  switch (mode) {
    case "concat":
      return {
        backgroundColor: "rgb(13, 255, 0)",
        color: "black",
        borderColor: "rgb(13, 255, 0)",
      };
    default:
      return {
        backgroundColor: "transparent",
        color: "rgb(13, 255, 0)",
        borderColor: "rgb(13, 255, 0)",
      };
  }
};

const Pathbar: React.FC<PathBarProps> = ({
  mode,
  setInvert,
  setConcat,
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
        <button
          onClick={() => setInvert()}
          style={{
            height: "35px",
            width: "100%",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "0.1s ease-in-out",
            ...InvertStyles(mode), // Dynamically applies styles based on mode
          }}
        >
          Invert Mode
        </button>
        <button
          onClick={() => setConcat()}
          style={{
            height: "35px",
            width: "100%",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "0.1s ease-in-out",
            ...ConcatStyles(mode), // Dynamically applies styles based on mode
          }}
        >
          Concatenate Mode
        </button>
        <button
          onClick={() => clear()}
          style={{
            height: "35px",
            width: "100%",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "0.1s ease-in-out",
            backgroundColor: "transparent",
            color: "rgb(13, 255, 0)",
            borderColor: "rgb(13, 255, 0)",
          }}
        >
          Clear Stored Data
        </button>
      </div>
    </div>
  );
};

export default Pathbar;
