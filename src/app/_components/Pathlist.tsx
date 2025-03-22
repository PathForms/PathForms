"use client";
import React, { useEffect, useState } from "react";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1^
  right: "b",
  left: "b\u207B\u00B9",
};

interface PathlistProps {
  mode: string;
  nodePaths: string[][];
  edgePaths: string[][];
  movePaths: string[][];
  pathIndex: number[];
  demonstratePath: (index: number) => void;
  concatenate: (index1: number, index2: number) => void;
  invert: (index: number) => void;
}

const Pathlist: React.FC<PathlistProps> = ({
  mode,
  nodePaths,
  edgePaths,
  movePaths,
  pathIndex,
  demonstratePath,
  concatenate,
  invert,
}) => {
  const [concatIndexes, setConcatIndexes] = useState<number[]>([]);

  //Effect to handle concat
  useEffect(() => {
    if (concatIndexes.length === 2) {
      concatenate(concatIndexes[0], concatIndexes[1]);
      setConcatIndexes([]); // Clear after concatenation
    }
  }, [concatIndexes]); // Runs whenever `concatIndexes` changes
  useEffect(() => {
    setConcatIndexes([]);
  }, [mode]); //reset concat indexes whenever mode change
  //

  const handleClick = (index: number) => {
    if (mode === "invert") {
      invert(index);
      return;
    } else if (mode === "concat") {
      setConcatIndexes((prev) => [...prev, index]);
      return;
    }
    demonstratePath(index);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 5,
        left: 10,
        color: "rgb(230, 255, 138)",
        zIndex: 10,
        width: "auto",
        backgroundColor: "rgba(47, 47, 47, 0.5)", // Optional subtle background for visibility
        padding: "10px",
        borderRadius: "8px",
        overflow: "hidden", // Hide the scrollbar
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Word Vector</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "33vw", // 33% of the screen width
        }}
      >
        {movePaths.length === 0 ? (
          <p
            style={{
              color: "rgb(255, 255, 0)",
              textAlign: "left",
              minWidth: "100px",
              maxWidth: "33vw", // 33% of the screen width
              width: "auto",
              whiteSpace: "nowrap", // Prevent wrapping
              overflowX: "auto", // Allow horizontal scrolling
              padding: "2px",
              margin: "0", // Remove default margin to reduce vertical space
            }}
          >
            No Data
          </p>
        ) : (
          movePaths.map((path, rowIndex) => {
            const isActive = pathIndex.includes(rowIndex);
            const textColor = isActive ? "rgb(255, 255, 0)" : "rgb(64, 73, 65)";

            return (
              <p
                className={styles["textbox"]}
                onClick={() => handleClick(rowIndex)}
                key={rowIndex}
                style={{
                  color: textColor,
                  textAlign: "left",
                  minWidth: "100px",
                  maxWidth: "33vw",
                  width: "auto",
                  whiteSpace: "nowrap",
                  overflowX: "auto",
                  padding: "2px",
                  margin: "0",
                  scrollbarWidth: "none",
                }}
              >
                {`[W${rowIndex + 1}]: `}
                {path.length === 0
                  ? "1"
                  : path
                      .map(
                        (node) => translation[node as keyof typeof translation]
                      )
                      .join(" ")}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Pathlist;
