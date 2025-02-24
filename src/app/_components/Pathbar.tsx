"use client";
import React, { useEffect, useState, useRef } from "react";

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
  const [paths, setPaths] = useState<string[][]>();

  return (
    <div
      style={{
        position: "fixed",
        top: 5,
        left: 10, // Align it to the left of the screen
        color: "red",
        zIndex: 10,
        width: "auto", // Allow the container to grow
      }}
    >
      <h2>Node Path</h2>
      <table style={{ width: "auto" }}>
        <thead>
          <tr>
            {/* Iterate manually over the first row */}
            {movePath[0] && movePath[0].length > 0 ? (
              // Render header only if there is at least one node in the first row
              [...Array(movePath[0].length)].map((_, index) => (
                <th key={index}>Node {index + 1}</th>
              ))
            ) : (
              // Render nothing if the first row is empty
              <th>No Nodes</th>
            )}
          </tr>
        </thead>
        <tbody>
          {/* Check if nodePath has any rows to display */}
          {movePath.length === 0 ? (
            // Show a message if no rows are present
            <tr>
              <td colSpan={movePath[0]?.length || 1}>No Data</td>
            </tr>
          ) : (
            // Iterate manually over the rows and cells
            movePath.map((path, rowIndex) => (
              <tr key={rowIndex}>
                {path.length === 0 ? (
                  // Display an empty cell if the row is empty
                  <td colSpan={movePath[0]?.length || 1}>No Data</td>
                ) : (
                  path.map((node, colIndex) => <td key={colIndex}>{node}</td>)
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button onClick={() => store()}>Store Current Path</button>
        <button onClick={() => reset()}>Reset Current Path</button>
        <button onClick={() => clear()}>Clear Stored Data</button>
        <button onClick={() => demonstratePath(0)}>Show Path 1</button>
        <button onClick={() => demonstratePath(1)}>Show Path 2</button>
        <button onClick={() => invert(0)}>Invert Path 1</button>
        <button onClick={() => invert(1)}>Invert Path 2</button>
        <button onClick={() => concatenate()}>Concatenate Stored Paths</button>
      </div>
    </div>
  );
};

export default Pathbar;
