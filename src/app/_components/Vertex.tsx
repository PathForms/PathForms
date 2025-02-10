import React, { useState } from "react";

interface VertexProps {
  x: number;
  y: number;
  id: string;
  onClick: (id: string) => void;
  onHover: (id: string, isHovered: boolean) => void;
  isHighlighted: boolean;
  isShined: boolean;
}

const Vertex: React.FC<VertexProps> = ({
  x,
  y,
  id,
  onClick,
  onHover,
  isHighlighted,
  isShined,
}) => {
  // Use useState to manage the hover state
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(id, true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(id, false);
  };

  // Set the fill color based on the current state
  const fillColor = isHovered
    ? "orange"       // When hovered, the color becomes orange
    : isShined
    ? "gold"         // When isShined is true, the color becomes gold
    : isHighlighted
    ? "#007acc"      // When isHighlighted is true, the color becomes blue
    : "lightblue";   // Default color is light blue

  return (
    <circle
      cx={x}
      cy={y}
      r={3}
      fill={fillColor}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(id)}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
    />
  );
};

export default Vertex;
