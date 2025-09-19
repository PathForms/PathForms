"use client";
import React, { useEffect, useState, useMemo } from "react";

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
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0); 
      return;
    }

    let animationFrameId: number;
    const animate = () => {
      setProgress(prev => (prev + 0.008) % 1); 
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);
  
  const isVertical = (x === x2 && y !== y2);
  let strokeColor = isVertical ? "rgba(0, 94, 255, 0.23)" : "rgba(255, 34, 5, 0.2)";

  let thickness = edgeThickness ?? 1;
  let activeStrokeColor = isVertical ? "rgb(0, 140, 255)" : "rgb(251, 0, 71)";
  
  if (isActive) {
    thickness += 2;
  }
  
  const angle = useMemo(() => {
    if (isVertical) {
      return -90; // 朝上
    } else {
      return 0;   // 朝右
    }
  }, [isVertical]);
  
  // ==================== 核心修改点 ====================
  // 根据固定方向，重新定义动画的起点和终点
  let animStartX, animStartY, animEndX, animEndY;

  if (isVertical) {
    // 强制动画方向为“从下到上” (Y值从大到小)
    animStartX = sourceX;
    animEndX = targetX;
    animStartY = Math.max(sourceY, targetY);
    animEndY = Math.min(sourceY, targetY);
  } else {
    // 强制动画方向为“从左到右” (X值从小到大)
    animStartY = sourceY;
    animEndY = targetY;
    animStartX = Math.min(sourceX, targetX);
    animEndX = Math.max(sourceX, targetX);
  }

  // 使用新的动画起点和终点来计算箭头位置
  const arrowX = animStartX + (animEndX - animStartX) * progress;
  const arrowY = animStartY + (animEndY - animStartY) * progress;
  // ======================================================

  return (
    <g>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={isActive ? activeStrokeColor : strokeColor}
        strokeWidth={thickness}
        style={{ transition: isActive ? "none" : "all 0.3s ease" }}
      />
      
      {isActive && (
        <path
          d="M-8,-5 L8,0 L-8,5 Z"
          fill={activeStrokeColor}
          transform={`translate(${arrowX}, ${arrowY}) rotate(${angle})`}
        />
      )}
    </g>
  );
};

export default Edge;