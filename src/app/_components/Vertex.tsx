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

const Vertex: React.FC<VertexProps> = ({
  id,
  x,
  y,

  isActive,
}) => {
  //color logic
  let fillColor = "rgba(244, 252, 0, 0.14)";
  if (isActive) {
    fillColor = "rgb(255, 255, 255)";
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
