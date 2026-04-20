"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./components.module.css";
import { Direction3 } from "../utils/buildNodesEdgesFromMoves3";
import { getRank2Color, getRank3Color } from "../utils/colorConfig";

// Support both rank 2 and rank 3
type Direction2 = "up" | "down" | "left" | "right";
type Direction = Direction2 | Direction3;

// Helper to detect rank from direction type
const isRank3Direction = (dir: string): dir is Direction3 => {
  return (
    dir === "right-up" ||
    dir === "left-down" ||
    dir === "right-down" ||
    dir === "left-up"
  );
};

const translation2: Record<Direction2, string> = {
  up: "b",
  down: "b\u207B\u00B9", // b^-1
  right: "a",
  left: "a\u207B\u00B9",
};

const translation3: Record<Direction3, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1
  "right-up": "b",
  "left-down": "b\u207B\u00B9",
  "right-down": "c",
  "left-up": "c\u207B\u00B9",
};

// Color mapping using centralized config
const getDirectionColor2 = (
  direction: Direction2,
  theme: "dark" | "light" = "dark"
): string => {
  switch (direction) {
    case "up":
    case "down":
      return getRank2Color("b");
    case "left":
    case "right":
      return getRank2Color("a");
    default:
      return "rgb(64, 73, 65)";
  }
};

const getDirectionColor3 = (
  direction: Direction3,
  theme: "dark" | "light" = "dark"
): string => {
  switch (direction) {
    case "up":
    case "down":
      return getRank3Color("a", theme);
    case "right-up":
    case "left-down":
      return getRank3Color("b", theme);
    case "right-down":
    case "left-up":
      return getRank3Color("c", theme);
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
  onPathHover?: (pathIndex: number) => void;
  onPathLeave?: () => void;
  hoverPathIndex?: number;
  isDualTutorial?: boolean;
}

const CLICK_INTERVAL = 250;
const LONG_PRESS_DURATION = 500;
const DRAG_THRESHOLD_PX = 6;

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
  onPathHover,
  onPathLeave,
  hoverPathIndex = -1,
  isDualTutorial = false,
}) => {
  const singleClickTimer = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef<{
    fromIndex: number;
    pointerId: number;
    startX: number;
    startY: number;
    started: boolean;
  } | null>(null);

  ///////////// pointer drag handler //////////////
  const getPathIndexAtPoint = (clientX: number, clientY: number): number => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const row = el?.closest("[data-path-index]") as HTMLElement | null;
    if (!row) return -1;
    const value = Number(row.dataset.pathIndex);
    return Number.isFinite(value) ? value : -1;
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLParagraphElement>,
    fromIndex: number
  ) => {
    if (e.button !== 0) return;
    dragStateRef.current = {
      fromIndex,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      started: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    suppressClickRef.current = false;
    // Keep existing long-press behavior for show/hide.
    timerRef.current = setTimeout(() => {
      demonstratePath(fromIndex);
      if (singleClickTimer.current) {
        clearTimeout(singleClickTimer.current);
        singleClickTimer.current = null;
      }
    }, LONG_PRESS_DURATION);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.started && Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        drag.started = true;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        onDragStart?.(drag.fromIndex);
      }
      if (drag.started) {
        const toIndex = getPathIndexAtPoint(e.clientX, e.clientY);
        if (toIndex >= 0) {
          onDragHover?.(toIndex);
        }
      }
    };

    const handlePointerUpOrCancel = (e: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (drag.started) {
        const toIndex = getPathIndexAtPoint(e.clientX, e.clientY);
        if (toIndex >= 0 && toIndex !== drag.fromIndex) {
          concatenate(toIndex, drag.fromIndex);
        }
        onDragEnd?.();
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
      dragStateRef.current = null;
      onDragLeave?.();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUpOrCancel);
    window.addEventListener("pointercancel", handlePointerUpOrCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUpOrCancel);
      window.removeEventListener("pointercancel", handlePointerUpOrCancel);
    };
  }, [concatenate, demonstratePath, onDragEnd, onDragHover, onDragLeave, onDragStart]);

  const handlePointerEnter = (toIndex: number) => {
    const drag = dragStateRef.current;
    if (drag?.started) {
      onDragHover?.(toIndex);
    }
  };

  const handlePointerLeave = () => {
    const drag = dragStateRef.current;
    if (drag?.started) {
      onDragLeave?.();
    }
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (index: number) => {
    if (suppressClickRef.current) return;
    if (movePaths[index].length === 0) {
      removePath(index);
      return;
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
                  (tutorialStep === 2 || tutorialStep === 3) && rowIndex === 0 && !isDualTutorial
                    ? styles.highlight
                    : tutorialStep === 4 && rowIndex === 2 && !isDualTutorial
                      ? styles.highlight
                      : tutorialStep === 5 && (rowIndex === 1 || rowIndex === 2) && !isDualTutorial
                        ? styles.highlight
                        : tutorialStep === 6 &&
                            (rowIndex === 0 || rowIndex === 1) && !isDualTutorial
                          ? styles.highlight
                          : tutorialStep === 7 &&
                              (rowIndex === 0 || rowIndex === 1) && !isDualTutorial
                            ? styles.highlight
                            : ""
                }`}
                data-path-index={rowIndex}
                draggable={false}
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
                  backgroundColor: isHoveredForDrop
                    ? "rgba(255, 255, 0, 0.2)"
                    : "transparent",
                  transition: "all 0.2s ease",
                }}
                onPointerDown={(e) => handlePointerDown(e, rowIndex)}
                onPointerUp={handlePointerUp}
                onPointerEnter={() => handlePointerEnter(rowIndex)}
                onPointerLeave={handlePointerLeave}
                onClick={() => handleClick(rowIndex)}
                onDoubleClick={() => {
                  if (!suppressClickRef.current) {
                    invert(rowIndex);
                  }
                }}
                onMouseEnter={() => onPathHover?.(rowIndex)}
                onMouseLeave={() => onPathLeave?.()}
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
                          {nodeIndex > 0 && (
                            <span style={{ color: "rgb(64, 73, 65)" }}> </span>
                          )}
                          <span style={{ color: color }}>{letter}</span>
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
