// Edge.tsx
import React from "react";

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHighlighted: boolean;
  direction?: string;
  onHover?: (hovered: boolean) => void;
}

const Edge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  isHighlighted,
  direction,
  onHover,
}) => {

  let strokeColor = "#999";
  if (direction === "up" || direction === "down") {
    strokeColor = "pink";
  } else if (direction === "left" || direction === "right") {
    strokeColor = "yellow";
  }
  
  if (isHighlighted) {
    strokeColor = "orange";
  }

  const handleMouseEnter = () => {
    if (onHover) onHover(true);
  };
  const handleMouseLeave = () => {
    if (onHover) onHover(false);
  };

  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke={strokeColor}
      strokeWidth={0.7}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Edge;
