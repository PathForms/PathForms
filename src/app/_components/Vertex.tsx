"use client";
import React, { useState } from "react";

interface VertexProps {
  id: string;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isShined?: boolean;
  isActive?: boolean;
}

const Vertex: React.FC<VertexProps> = ({ id, x, y, isActive }) => {
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
  if (isActive) {
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
