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

  let thickness = edgeThickness ?? 1;
  if (isActive) {
    strokeColor = "rgba(251, 0, 0, 1)";
    thickness += 2;
    if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
      strokeColor = "rgba(0, 247, 255, 1)";
    }
  }

  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke={strokeColor}
      strokeWidth={thickness}
    />
  );
};

export default Edge;
