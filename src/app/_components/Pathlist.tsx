"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./components.module.css";
import { Direction3 } from "../utils/buildNodesEdgesFromMoves3";

// Support both rank 2 and rank 3
type Direction2 = "up" | "down" | "left" | "right";
type Direction = Direction2 | Direction3;

// Helper to detect rank from direction type
const isRank3Direction = (dir: string): dir is Direction3 => {
  return dir === "right-up" || dir === "left-down" || dir === "right-down" || dir === "left-up";
};

const translation2: Record<Direction2, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1
  right: "b",
  left: "b\u207B\u00B9",
};

const translation3: Record<Direction3, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1
  "right-up": "b",
  "left-down": "b\u207B\u00B9",
  "right-down": "c",
  "left-up": "c\u207B\u00B9",
};

// Color mapping to match CayleyTree colors
const getDirectionColor2 = (direction: Direction2, theme: "dark" | "light" = "dark"): string => {
  switch (direction) {
    case "up":
    case "down":
      return "rgb(0, 140, 255)"; // Blue for a/a^-1
    case "left":
    case "right":
      return "rgb(251, 0, 71)"; // Red for b/b^-1
    default:
      return "rgb(64, 73, 65)"; // Default color
  }
};

const getDirectionColor3 = (direction: Direction3, theme: "dark" | "light" = "dark"): string => {
  const greenColor = theme === "light" ? "#0891b2" : "#00ff00"; // Cyan for light mode, green for dark
  switch (direction) {
    case "up":
    case "down":
      return "#ff0000"; // Red for a/a^-1
    case "right-up":
    case "left-down":
      return greenColor; // Theme-aware green for b/b^-1
    case "right-down":
    case "left-up":
      return "#800080"; // Purple for c/c^-1
    default:
      return "rgb(64, 73, 65)"; // Default color
  }
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
  onDragStart?: (fromIndex: number) => void;
  onDragEnd?: () => void;
  onDragHover?: (toIndex: number) => void;
  onDragLeave?: () => void;
  isDragging?: boolean;
  dragFromIndex?: number;
  dragHoverIndex?: number;
  theme?: "dark" | "light"; // Add theme prop
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
  onDragStart,
  onDragEnd,
  onDragHover,
  onDragLeave,
  isDragging = false,
  dragFromIndex = -1,
  dragHoverIndex = -1,
  theme = "dark",
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
    onDragStart?.(fromIndex);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLParagraphElement>) => {
    e.currentTarget.classList.remove(styles.dragging);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent<HTMLParagraphElement>, toIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add(styles.dragOver);
    onDragHover?.(toIndex);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLParagraphElement>) => {
    e.currentTarget.classList.remove(styles.dragOver);
    onDragLeave?.();
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
      <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Path list</h2>
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
            No data
          </p>
        ) : (
          movePaths.map((path, rowIndex) => {
            const isActive = pathIndex.includes(rowIndex);
            const isDraggingFrom = isDragging && dragFromIndex === rowIndex;
            const isHoveredForDrop = isDragging && dragHoverIndex === rowIndex;
            
            let textColor = isActive ? "rgb(255, 255, 0)" : "rgb(64, 73, 65)";
            if (isDraggingFrom) {
              textColor = "rgba(255, 255, 0, 0.5)"; // Dimmed when dragging
            } else if (isHoveredForDrop) {
              textColor = "rgb(255, 255, 0)"; // Highlight when hovered for drop
            }

            return (
              <p
                key={rowIndex}
                className={`${styles.textbox} ${
                  (tutorialStep === 2 || tutorialStep === 3) && rowIndex === 0
                    ? styles.highlight
                    : tutorialStep === 4 && rowIndex === 2
                    ? styles.highlight
                    : tutorialStep === 5 && (rowIndex === 1 || rowIndex === 2)
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
                onDragOver={(e) => handleDragOver(e, rowIndex)}
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
                  opacity: isDraggingFrom ? 0.5 : 1,
                  backgroundColor: isHoveredForDrop ? "rgba(255, 255, 0, 0.2)" : "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseDown={() => handleMouseDown(rowIndex)}
                onMouseUp={() => handleMouseUp(rowIndex)}
                onClick={() => handleClick(rowIndex)}
                onDoubleClick={() => invert(rowIndex)}
              >
                {`[P${rowIndex + 1}]: `}{" "}
                {path.length === 0
                  ? "1"
                  : path.map((node, nodeIndex) => {
                      const direction = node as Direction;
                      const isRank3 = isRank3Direction(direction);
                      const letter = isRank3 
                        ? translation3[direction as Direction3]
                        : translation2[direction as Direction2];
                      const color = isRank3
                        ? getDirectionColor3(direction as Direction3, theme)
                        : getDirectionColor2(direction as Direction2, theme);
                      return (
                        <React.Fragment key={nodeIndex}>
                          {nodeIndex > 0 && <span style={{ color: "rgb(64, 73, 65)" }}> </span>}
                          <span style={{ color: color }}>
                            {letter}
                          </span>
                        </React.Fragment>
                      );
                    })}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Pathlist;
