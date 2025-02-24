"use client";
import React, { useEffect, useState, useRef } from "react";

interface PathBarProps {
  store: () => void;
  demonstratePath: (index: number) => void;
  concatennate: () => void;
  reset: () => void;
  clear: () => void;
  nodePath: string[][];
  edgePath: string[][];
}

const Pathbar: React.FC<PathBarProps> = ({
  store,
  demonstratePath,
  concatennate,
  reset,
  clear,
  nodePath,
  edgePath,
}) => {
  const [paths, setPaths] = useState<string[][]>();

  return (
    <div
      style={{
        position: "absolute",
        top: 5,
        left: "8%",
        color: "red",
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      <h2>Node Path</h2>
      <table>
        <thead>
          <tr>
            {/* Iterate manually over the first row */}
            {nodePath[0] && nodePath[0].length > 0 ? (
              // Render header only if there is at least one node in the first row
              [...Array(nodePath[0].length)].map((_, index) => (
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
          {nodePath.length === 0 ? (
            // Show a message if no rows are present
            <tr>
              <td colSpan={nodePath[0]?.length || 1}>No Data</td>
            </tr>
          ) : (
            // Iterate manually over the rows and cells
            nodePath.map((path, rowIndex) => (
              <tr key={rowIndex}>
                {path.length === 0 ? (
                  // Display an empty cell if the row is empty
                  <td colSpan={nodePath[0]?.length || 1}>No Data</td>
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
        <button onClick={() => demonstratePath(0)}>Show Path 1</button>
        <button onClick={() => demonstratePath(1)}>Show Path 2</button>
        <button onClick={() => clear()}>Clear Stored Data</button>
        <button onClick={() => concatennate()}>Concatenate Stored Paths</button>
      </div>
    </div>
  );
};

export default Pathbar;
