"use client";
import React, { useState } from "react";

interface VertexProps {
  id: string;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isShined?: boolean;
  isActive?: boolean;
  isPreview?: boolean;
  isCancelled?: boolean;
}

const Vertex: React.FC<VertexProps> = ({ id, x, y, isActive, isPreview = false, isCancelled = false }) => {
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
  if (isPreview) {
    // Keep original colors and size but add thicker stroke for preview
    stroke = "#ffffff"; // White stroke for preview
    strokeW = 2; // Thicker stroke for preview
    
    if (isCancelled) {
      // Dimmed effect for cancelled parts
      if (!isRoot) {
        fillColor = "rgba(244, 252, 0, 0.2)"; // Dimmed for cancelled
      }
    } else {
      // Normal preview colors
      if (!isRoot) {
        fillColor = "rgba(244, 252, 0, 0.6)"; // Higher opacity for preview
      }
    }
    // Don't change radius - keep original
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
