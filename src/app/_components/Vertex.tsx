"use client";
import React, { useState } from "react";

interface VertexProps {
  id: string;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isShined?: boolean;
  isActive?: boolean;
  isFinalResult?: boolean;
  isCancelledPart?: boolean;
  isHoveredTarget?: boolean;
}

const Vertex: React.FC<VertexProps> = ({ id, x, y, isActive, isFinalResult = false, isCancelledPart = false, isHoveredTarget = false }) => {
  //color logic
  const isRoot = id === "0,0";

  let fillColor = "rgba(244, 252, 0, 0.14)";
  let radius = 2;
  let stroke = "transparent";
  let strokeW = 0;

  if (isRoot) {
    fillColor = "#ffd700";
    radius = 4;
    stroke = "#ffffff";
    strokeW = 0.8;
  }
  if (isFinalResult) {
    // Final result preview - bright
    stroke = "#ffffff";
    strokeW = 2;
    if (!isRoot) {
      fillColor = "rgba(244, 252, 0, 0.6)"; // Bright for final result
    }
  } else if (isCancelledPart) {
    // Cancelled parts - dimmed
    stroke = "#ffffff";
    strokeW = 2;
    if (!isRoot) {
      fillColor = "rgba(244, 252, 0, 0.2)"; // Dimmed for cancelled
    }
  } else if (isHoveredTarget) {
    // Highlight the hovered target path with brighter color and thicker stroke
    fillColor = "#ffffff";
    radius = 5;
    stroke = "#87ceeb"; // Light blue stroke
    strokeW = 3;
  } else if (isActive) {
    fillColor = "#ffffff";
  }

  const className = isRoot ? "root-vertex" : "";
  return (
    <circle
      className = {className}
      cx={x}
      cy={y}
      r={radius}
      fill={fillColor}
      stroke={stroke}
      strokeWidth={strokeW}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
    />
  );
};

export default Vertex;
