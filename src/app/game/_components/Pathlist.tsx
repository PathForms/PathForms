"use client";
import React, { useEffect, useState } from "react";
import "./components.module.css";

type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^(-1)
  right: "b",
  left: "b\u207B\u00B9",
};

interface PathlistProps {
  nodePaths: string[][];
  edgePaths: string[][];
  movePaths: string[][];
}

const Pathlist: React.FC<PathlistProps> = ({
  nodePaths,
  edgePaths,
  movePaths,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 5,
        left: 10,
        color: "rgb(13, 255, 0)",
        zIndex: 10,
        width: "auto",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional subtle background for visibility
        padding: "10px",
        borderRadius: "8px",
        overflow: "hidden", // Hide the scrollbar
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Node Path</h2>
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
          movePaths.map((path, rowIndex) => (
            <p
              key={rowIndex}
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
                scrollbarWidth: "none", // Firefox: hides scrollbar
              }}
            >
              {path.length === 0
                ? "No Data"
                : path
                    .map(
                      (node) => translation[node as keyof typeof translation]
                    )
                    .join(" ")}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default Pathlist;
