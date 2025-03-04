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
  store: () => void;
  demonstratePath: (index: number) => void;
  concatenate: () => void;
  invert: (index: number) => void;
  reset: () => void;
  clear: () => void;

  nodePath: string[][];
  edgePath: string[][];
  movePath: string[][];
}

const Pathbar: React.FC<PathBarProps> = ({
  store,
  demonstratePath,
  concatenate,
  invert,
  reset,
  clear,

  nodePath,
  edgePath,
  movePath,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        left: 10,
        color: "rgb(13, 255, 0)",
        zIndex: 10,
        width: "auto",
        maxWidth: "250px", // Limits width to avoid overflow
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional subtle background for visibility
        padding: "10px",
        borderRadius: "8px",
        overflow: "auto",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Node Path</h2>

      <div style={{ overflowX: "auto", maxWidth: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {/* <thead>
            <tr>
              {movePath[0] && movePath[0].length > 0 ? (
                [...Array(movePath[0].length)].map((_, index) => (
                  <th
                    key={index}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid rgb(13, 255, 0)",
                    }}
                  >
                    Node {index + 1}
                  </th>
                ))
              ) : (
                <th>No Nodes</th>
              )}
            </tr>
          </thead> */}
          <tbody>
            {movePath.length === 0 ? (
              <tr>
                <td
                  colSpan={movePath[0]?.length || 1}
                  style={{
                    textAlign: "left",

                    minWidth: "5px",
                    maxWidth: "5px",
                    width: "5px",
                  }}
                >
                  No Data
                </td>
              </tr>
            ) : (
              movePath.map((path, rowIndex) => (
                <tr key={rowIndex}>
                  {path.length === 0 ? (
                    <td
                      colSpan={movePath[0]?.length || 1}
                      style={{
                        textAlign: "left",
                        minWidth: "5px",
                        maxWidth: "5px",
                        width: "5px",
                      }}
                    >
                      No Data
                    </td>
                  ) : (
                    path.map((node, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          padding: "2px",
                          textAlign: "left",
                          minWidth: "5px",
                          maxWidth: "5px",
                          width: "5px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis", // Truncate long text
                        }}
                      >
                        {translation[node as keyof typeof translation]}
                      </td>
                    ))
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "10px",
        }}
      >
        {[
          { label: "Reset Current Path", action: reset },
          { label: "Store Current Path", action: store },
          { label: "Show Path 1", action: () => demonstratePath(0) },
          { label: "Show Path 2", action: () => demonstratePath(1) },
          { label: "Invert Path 1", action: () => invert(0) },
          { label: "Invert Path 2", action: () => invert(1) },
          { label: "Concatenate Stored Paths", action: concatenate },
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
