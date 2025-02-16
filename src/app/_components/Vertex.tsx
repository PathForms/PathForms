import React, { useState } from "react";

interface VertexProps {
  x: number;
  y: number;
  id: string;
  onClick: (id: string) => void;
  onHover: (id: string, isHovered: boolean) => void;
  isHighlighted: boolean; // 用于改变颜色
  isShined: boolean;      // 用于改变颜色
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
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(id, true);    // 通知父组件
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(id, false);   // 通知父组件
  };

  // 根据不同状态决定颜色
  const fillColor = isHovered
    ? "orange"
    : isShined
    ? "gold"
    : isHighlighted
    ? "#007acc"
    : "lightblue";

  return (
    <circle
      cx={x}
      cy={y}
      r={1.5}  // 可根据需要调整节点半径
      fill={fillColor}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(id)}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
    />
  );
};

export default Vertex;
