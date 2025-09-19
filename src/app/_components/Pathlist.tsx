"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1
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
  concatenate: (from: number, to: number) => void;
  invert: (index: number) => void;
  removePath: (index: number) => void;
  tutorialStep?: number;
}

const CLICK_INTERVAL = 250;
const LONG_PRESS_DURATION = 500;

const Pathlist: React.FC<PathlistProps> = ({
  mode,
  nodePaths,
  edgePaths,
  movePaths,
  pathIndex,
  demonstratePath,
  concatenate,
  invert,
  removePath,
  tutorialStep,
}) => {
  const singleClickTimer = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  ///////////// dragging handler //////////////
  const handleDragStart = (
    e: React.DragEvent<HTMLParagraphElement>,
    fromIndex: number
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(fromIndex));
    e.currentTarget.classList.add(styles.dragging);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLParagraphElement>) => {
    e.currentTarget.classList.remove(styles.dragging);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLParagraphElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add(styles.dragOver);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLParagraphElement>) => {
    e.currentTarget.classList.remove(styles.dragOver);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLParagraphElement>,
    toIndex: number
  ) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    e.currentTarget.classList.remove(styles.dragOver);
    if (fromIndex !== toIndex) {
      concatenate(toIndex, fromIndex);
    }
  };

  const handleClick = (index: number) => {
    if (movePaths[index].length === 0) {
      removePath(index);
      return;
    }
  };

  const handleMouseDown = (index: number) => {
    timerRef.current = setTimeout(() => {
      demonstratePath(index);
      if (singleClickTimer.current) {
        clearTimeout(singleClickTimer.current);
        singleClickTimer.current = null;
      }
    }, LONG_PRESS_DURATION);
  };
  const handleMouseUp = (index: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
        backgroundColor: "rgba(47, 47, 47, 0.5)",
        padding: "10px",
        borderRadius: "8px",
        maxHeight: "450px",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
        WebkitOverflowScrolling: "touch", // iOS smooth scroll
      }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Path List</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "33vw",
        }}
      >
        {movePaths.length === 0 ? (
          <p
            style={{
              color: "rgb(255, 255, 0)",
              textAlign: "left",
              minWidth: "100px",
              maxWidth: "33vw",
              whiteSpace: "nowrap",
              overflowX: "auto",
              padding: "2px",
              margin: "0",
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
                key={rowIndex}
                className={`${styles.textbox} ${
                  (tutorialStep === 2 || tutorialStep === 3) && rowIndex === 0
                    ? styles.highlight
                    : tutorialStep === 4 && rowIndex === 1
                    ? styles.highlight
                    : tutorialStep === 5 && (rowIndex === 0 || rowIndex === 1)
                    ? styles.highlight
                    : tutorialStep === 6 && (rowIndex === 0 || rowIndex === 1)
                    ? styles.highlight
                    : tutorialStep === 7 && (rowIndex === 0 || rowIndex === 1)
                    ? styles.highlight
                    : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, rowIndex)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, rowIndex)}
                style={{
                  color: textColor,
                  textAlign: "left",
                  minWidth: "100px",
                  maxWidth: "33vw",
                  whiteSpace: "nowrap",
                  overflowX: "auto",
                  padding: "2px",
                  margin: "0",
                }}
                onMouseDown={() => handleMouseDown(rowIndex)}
                onMouseUp={() => handleMouseUp(rowIndex)}
                onClick={() => handleClick(rowIndex)}
                onDoubleClick={() => invert(rowIndex)}
              >
                {`[P${rowIndex + 1}]: `}{" "}
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
