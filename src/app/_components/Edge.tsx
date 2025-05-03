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
  showArrow?: boolean;           
}

const Edge: React.FC<EdgeProps> = ({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  isActive,
  edgeThickness = 1,
  showArrow = true,                
}) => {
  
  const [sx] = source.split(",").map(Number);
  const [tx] = target.split(",").map(Number);
  const isAEdge = sx === tx;               

  const lineColor = (() => {
    if (isAEdge) {
      return isActive ? "rgb(0, 140, 255)" : "rgba(0, 94, 255, 0.23)";
    }
    return isActive ? "rgb(251, 0, 71)" : "rgba(255, 34, 5, 0.2)";
  })();

  const arrowColor = (() => {
    if (!isActive) return lineColor;       
    return isAEdge ? "rgb(0, 200, 255)" : "rgb(200, 0, 50)";
  })();

  const thickness = isActive ? edgeThickness + 2 : edgeThickness;


const midX = (sourceX + targetX) / 2;
const midY = (sourceY + targetY) / 2;
const size = 4 + thickness * 2;


const arrowPath = `M 0 ${size / 2} L ${size} 0 L 0 ${-size / 2} Z`;


const dx = targetX - sourceX;
const dy = targetY - sourceY;
const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;


let isPositive = true;     
if (dx === 0) {             
  isPositive = dy > 0;      
} else {                    
  isPositive = dx > 0;      
}


const rotateDeg = isPositive ? angleDeg : angleDeg + 180;

  return (
    <>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={lineColor}
        strokeWidth={thickness}
      />
      {showArrow && (
        <path
          d={arrowPath}
          fill={arrowColor}
          transform={`translate(${midX}, ${midY}) rotate(${rotateDeg})`}
          pointerEvents="none"
        />
      )}
    </>
  );
};

export default Edge;
