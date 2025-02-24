import React, { useState } from "react";

interface VertexProps {
  id: string;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isShined?: boolean;
  isActive?: boolean;
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
}) => {
  const [hovered, setHovered] = useState(false);

  //color logic
  let fillColor = "rgba(0, 159, 251, 0.25)";
  if (isActive) {
    fillColor = "rgba(15, 114, 163, 0.54)";
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
