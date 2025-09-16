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
      setProgress(0); // 如果不活跃，重置进度
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
  
  // --- 样式计算逻辑保持不变 ---
  let strokeColor = "rgba(255, 34, 5, 0.2)";
  if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
    strokeColor = "rgba(0, 94, 255, 0.23)";
  }

  let thickness = edgeThickness ?? 1;
  let activeStrokeColor = "rgb(251, 0, 71)";
  
  if (isActive) {
    if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
      activeStrokeColor = "rgb(0, 140, 255)";
    }
    thickness += 2;
  }
  
  // 使用 useMemo 来计算角度，避免在每次渲染时都重新计算
  const angle = useMemo(() => 
    Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI,
    [sourceX, sourceY, targetX, targetY]
  );
  
  // 根据 progress 计算箭头当前在路径上的位置
  const arrowX = sourceX + (targetX - sourceX) * progress;
  const arrowY = sourceY + (targetY - sourceY) * progress;

  return (
    // 使用 <g> 元素来包裹线和箭头
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