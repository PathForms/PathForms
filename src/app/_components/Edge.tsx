"use client";
import React, { useEffect, useState } from "react";

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  source: string;
  target: string;
  isActive?: boolean;
  isPreview?: boolean;
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
  isPreview = false,
  edgeThickness,
}) => {
  const [x, y] = source.split(",").map(Number);
  const [x2, y2] = target.split(",").map(Number);
  const [dashOffset, setDashOffset] = useState(0);

  // Animation effect for the dotted line when active
  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;
    let offset = 0;

    const animate = () => {
      // Slower animation speed (0.2 instead of 0.5)
      // Negative value to make it move in the opposite direction
      offset = (offset - 0.2) % 16;
      setDashOffset(offset);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  let strokeColor = "rgba(255, 34, 5, 0.2)";
  if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
    strokeColor = "rgba(0, 94, 255, 0.23)";
  }

  let thickness = edgeThickness ?? 1;
  let strokeDasharray = "none";
  let strokeDashoffset = "0";
  
  if (isPreview) {
    strokeColor = "rgba(255, 255, 0, 0.8)"; // Yellow for preview
    thickness += 1;
    strokeDasharray = "8,4"; // Dashed line for preview
    strokeDashoffset = dashOffset.toString();
    
    if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
      strokeColor = "rgba(0, 255, 255, 0.8)"; // Cyan for vertical preview
    }
  } else if (isActive) {
    strokeColor = "rgb(251, 0, 71)";
    thickness += 2;
    strokeDasharray = "5,3"; // Add dotted line effect when active
    strokeDashoffset = dashOffset.toString();
    
    if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
      strokeColor = "rgb(0, 140, 255)";
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
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      markerEnd="url(#arrow)"
      style={{ transition: isActive ? "none" : "all 0.3s ease" }}
    />
  );
};

export default Edge;