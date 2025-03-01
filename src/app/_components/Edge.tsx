"use client";
import React from "react";

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  source: string;
  target: string;
  isActive?: boolean;
  edgeThickness?: number;
}

const Edge: React.FC<EdgeProps> = ({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  isActive,
  edgeThickness,
}) => {
  const [x, y] = source.split(",").map(Number);
  const [x2, y2] = target.split(",").map(Number);

  let strokeColor = "rgba(255, 30, 0, 0.2)";
  if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
    strokeColor = "rgba(74, 237, 243, 0.2)";
  }

  const thickness = edgeThickness ?? 1;
  if (isActive) {
    strokeColor = "rgba(251, 0, 0, 1)";
    if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
      strokeColor = "rgba(0, 247, 255, 1)";
    }
  }

  // Compute the midpoint coordinates
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  // Create a path with two segments (source -> midpoint, midpoint -> target)
  const d = `M ${sourceX} ${sourceY} L ${midX} ${midY} L ${targetX} ${targetY}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={strokeColor}
      strokeWidth={thickness}
      markerMid="url(#arrowhead)"
      // Set the parent's current color so that the marker (using currentColor) matches the stroke
      style={{ color: strokeColor }}
    />
  );
};

export default Edge;
