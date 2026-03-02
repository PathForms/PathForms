"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CayleyTree from "../_components/CayleyTree";
import Headbar from "../_components/Headbar";
import buildNodesEdgesFromMoves from "../utils/buildNodesEdgesFromMoves";
import { useRouter } from "next/navigation";

type Direction = "up" | "down" | "left" | "right";

// Direction labels for display
const directionLabels: Record<Direction, string> = {
  up: "b",
  down: "b⁻¹",
  right: "a",
  left: "a⁻¹",
};

// Opposite directions
const oppositeDir: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

// Convert path to readable string
const pathToString = (path: Direction[]): string => {
  if (path.length === 0) return "ε (empty)";
  
  // Group consecutive same directions
  const groups: { dir: Direction; count: number }[] = [];
  for (const dir of path) {
    if (groups.length > 0 && groups[groups.length - 1].dir === dir) {
      groups[groups.length - 1].count++;
    } else {
      groups.push({ dir, count: 1 });
    }
  }
  
  return groups
    .map(({ dir, count }) => {
      const label = directionLabels[dir];
      if (count === 1) return label;
      // For inverse directions, handle exponent display
      if (dir === "down" || dir === "left") {
        const base = dir === "down" ? "b" : "a";
        return `${base}⁻${superscript(count)}`;
      }
      return `${label}${superscript(count)}`;
    })
    .join("");
};

// Convert number to superscript
const superscript = (n: number): string => {
  const superscripts: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  };
  return n.toString().split("").map(d => superscripts[d]).join("");
};

// Generate a random path
const generateRandomPath = (length: number = 4): Direction[] => {
  const directions: Direction[] = ["up", "down", "left", "right"];
  const path: Direction[] = [];
  let lastDir: Direction | null = null;
  
  for (let i = 0; i < length; i++) {
    // Avoid immediately canceling moves
    const available = directions.filter(d => lastDir === null || d !== oppositeDir[lastDir]);
    const randomDir = available[Math.floor(Math.random() * available.length)];
    path.push(randomDir);
    lastDir = randomDir;
  }
  
  return path;
};

// Reduce path by canceling opposite adjacent moves
const reducePath = (path: Direction[]): Direction[] => {
  const stack: Direction[] = [];
  for (const move of path) {
    if (stack.length > 0 && oppositeDir[stack[stack.length - 1]] === move) {
      stack.pop();
    } else {
      stack.push(move);
    }
  }
  return stack;
};

// Apply transformation: replace all occurrences of 'a' in the path
// Transformation types:
// 1. a → ab
// 2. a → ab⁻¹
// 3. a → ba
// 4. a → b⁻¹a
type TransformationType = "a_to_ab" | "a_to_ab_inv" | "a_to_ba" | "a_to_b_inv_a";

const applyTransformation = (path: Direction[], type: TransformationType): Direction[] => {
  const result: Direction[] = [];
  
  for (const dir of path) {
    if (dir === "right") {
      // This is 'a'
      switch (type) {
        case "a_to_ab":
          result.push("right", "up"); // a → ab
          break;
        case "a_to_ab_inv":
          result.push("right", "down"); // a → ab⁻¹
          break;
        case "a_to_ba":
          result.push("up", "right"); // a → ba
          break;
        case "a_to_b_inv_a":
          result.push("down", "right"); // a → b⁻¹a
          break;
      }
    } else if (dir === "left") {
      // This is 'a⁻¹', apply inverse transformation
      switch (type) {
        case "a_to_ab":
          result.push("down", "left"); // a⁻¹ → b⁻¹a⁻¹
          break;
        case "a_to_ab_inv":
          result.push("up", "left"); // a⁻¹ → ba⁻¹
          break;
        case "a_to_ba":
          result.push("left", "down"); // a⁻¹ → a⁻¹b⁻¹
          break;
        case "a_to_b_inv_a":
          result.push("left", "up"); // a⁻¹ → a⁻¹b
          break;
      }
    } else {
      // 'b' or 'b⁻¹' unchanged
      result.push(dir);
    }
  }
  
  return reducePath(result);
};

const transformationLabels: Record<TransformationType, string> = {
  a_to_ab: "a → ab",
  a_to_ab_inv: "a → ab⁻¹",
  a_to_ba: "a → ba",
  a_to_b_inv_a: "a → b⁻¹a",
};

const Sandbox = () => {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState<Direction[]>([]);
  const [history, setHistory] = useState<Direction[][]>([]);
  const [transformationHistory, setTransformationHistory] = useState<string[]>([]);
  
  // For CayleyTree visualization
  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);
  
  // Initialize with a random path
  useEffect(() => {
    const initialPath = generateRandomPath(4);
    setCurrentPath(initialPath);
    setHistory([initialPath]);
    updateVisualization(initialPath);
  }, []);
  
  const updateVisualization = (path: Direction[]) => {
    const { newNodes, newEdges } = buildNodesEdgesFromMoves(path);
    setNodePaths([newNodes]);
    setEdgePaths([newEdges]);
  };
  
  const handleTransformation = (type: TransformationType) => {
    const newPath = applyTransformation(currentPath, type);
    setCurrentPath(newPath);
    setHistory([...history, newPath]);
    setTransformationHistory([...transformationHistory, transformationLabels[type]]);
    updateVisualization(newPath);
  };
  
  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousPath = newHistory[newHistory.length - 1];
      setCurrentPath(previousPath);
      setHistory(newHistory);
      setTransformationHistory(transformationHistory.slice(0, -1));
      updateVisualization(previousPath);
    }
  };
  
  const handleReset = () => {
    const newPath = generateRandomPath(4);
    setCurrentPath(newPath);
    setHistory([newPath]);
    setTransformationHistory([]);
    updateVisualization(newPath);
  };
  
  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "18px",
    fontWeight: "bold" as const,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "140px",
  };
  
  const transformButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3b82f6",
    color: "white",
  };
  
  const controlButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6b7280",
    color: "white",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#0a0a0a",
        color: "#ededed",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
          <span style={{ color: "#3b82f6" }}>Sandbox</span> - Nielsen Transformations Demo
        </h1>
        <button
          onClick={() => router.push("/")}
          style={{
            ...controlButtonStyle,
            backgroundColor: "#374151",
          }}
        >
          ← Back to Home
        </button>
      </div>
      
      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left panel - Controls */}
        <div
          style={{
            width: "320px",
            minWidth: "320px",
            flexShrink: 0,
            padding: "24px",
            borderRight: "1px solid #333",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            overflowY: "auto",
          }}
        >
          {/* Current Path Display */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#9ca3af", fontSize: "14px" }}>
              CURRENT PATH
            </h3>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#3b82f6",
                wordBreak: "break-all",
              }}
            >
              {pathToString(currentPath)}
            </div>
            <div style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}>
              Length: {currentPath.length}
            </div>
          </div>
          
          {/* Transformation Buttons */}
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: "#9ca3af", fontSize: "14px" }}>
              APPLY TRANSFORMATION
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(Object.keys(transformationLabels) as TransformationType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTransformation(type)}
                  style={transformButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {transformationLabels[type]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              style={{
                ...controlButtonStyle,
                flex: 1,
                opacity: history.length <= 1 ? 0.5 : 1,
                cursor: history.length <= 1 ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (history.length > 1) {
                  e.currentTarget.style.backgroundColor = "#4b5563";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6b7280";
              }}
            >
              ↩ Undo
            </button>
            <button
              onClick={handleReset}
              style={{
                ...controlButtonStyle,
                flex: 1,
                backgroundColor: "#7c3aed",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6d28d9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#7c3aed";
              }}
            >
              🎲 New Path
            </button>
          </div>
          
          {/* Transformation History */}
          {transformationHistory.length > 0 && (
            <div
              style={{
                backgroundColor: "#1a1a1a",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #333",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", color: "#9ca3af", fontSize: "14px" }}>
                TRANSFORMATION HISTORY
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {transformationHistory.map((trans, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: "14px",
                      color: "#d1d5db",
                      padding: "8px",
                      backgroundColor: "#262626",
                      borderRadius: "6px",
                    }}
                  >
                    {idx + 1}. {trans}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#9ca3af", fontSize: "14px" }}>
              LEGEND
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
              <div><span style={{ color: "#ef4444" }}>→</span> a (right)</div>
              <div><span style={{ color: "#22c55e" }}>←</span> a⁻¹ (left)</div>
              <div><span style={{ color: "#3b82f6" }}>↑</span> b (up)</div>
              <div><span style={{ color: "#f59e0b" }}>↓</span> b⁻¹ (down)</div>
            </div>
          </div>
        </div>
        
        {/* Right panel - Cayley Tree Visualization */}
        <div style={{ flex: 1, position: "relative" }}>
          <CayleyTree
            pathIndex={[0]}
            nodePaths={nodePaths}
            edgePaths={edgePaths}
            edgeThickness={0.7}
            shape="rect"
          />
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
