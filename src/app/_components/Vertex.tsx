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
  let fillColor = "rgba(138, 143, 0, 0.29)";
  if (isActive) {
    fillColor = "rgba(255, 242, 0, 0.92)";
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={2}
      fill={fillColor}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
    />
  );
};

export default Vertex;
