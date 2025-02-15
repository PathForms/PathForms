import React, { useState } from "react";

interface VertexProps {
  id: string;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isShined?: boolean;
  isActive?: boolean;
  onHover?: (id: string, hovered: boolean) => void;
  onClick?: (id: string) => void;
}

/**
 * Vertex:
 * A circle at (x, y). Different fill colors indicate hover,
 * highlight, or shine states.
 */
const Vertex: React.FC<VertexProps> = ({
  id,
  x,
  y,
  isHighlighted = false,
  isShined = false,
  isActive,
  onHover,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  //color logic
  let fillColor = "steelblue";
  if (hovered) {
    fillColor = "orange";
  } else if (isShined) {
    fillColor = "gold";
  } else if (isHighlighted) {
    fillColor = "#007acc";
  } else if (isActive) {
    fillColor = "red";
  }

  const handleMouseEnter = () => {
    setHovered(true);
    onHover?.(id, true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    onHover?.(id, false);
  };

  return (
    <circle
      cx={x}
      cy={y}
      r={2}
      fill={fillColor}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick?.(id)}
    />
  );
};

export default Vertex;
