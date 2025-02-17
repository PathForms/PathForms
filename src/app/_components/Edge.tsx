import React from "react";

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHighlighted?: boolean;
  onHover?: (hovered: boolean) => void;
}

/**
 * Edge:
 * A basic line connecting source and target coordinates.
 * It can highlight on hover if needed.
 */
const Edge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  isHighlighted = false,
  onHover,
}) => {
  const strokeColor = isHighlighted ? "orange" : "#999";

  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke={strokeColor}
      strokeWidth={1}
    />
  );
};

export default Edge;
