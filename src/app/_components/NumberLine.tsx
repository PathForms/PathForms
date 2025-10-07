"use client";
import React, { useEffect, useRef } from "react";

export interface Rank1Path {
  exponent: number; // a^exponent (positive = right, negative = left)
  color: string;
}

interface NumberLineProps {
  theme: "dark" | "light";
  currentPosition?: number;
  paths?: Rank1Path[];
}

const NumberLine: React.FC<NumberLineProps> = ({ 
  theme, 
  currentPosition = 0,
  paths = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get actual canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size for retina displays
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set colors based on theme
    const lineColor = theme === "dark" ? "#ffffff" : "#000000";
    const axisColor = theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
    const tickColor = theme === "dark" ? "#ffffff" : "#000000";
    const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

    // Draw faint vertical axis at x=0 (reference line)
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw horizontal number line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(50, centerY);
    ctx.lineTo(width - 50, centerY);
    ctx.stroke();

    // Add arrow heads at both ends
    const arrowSize = 10;
    // Right arrow
    ctx.beginPath();
    ctx.moveTo(width - 50, centerY);
    ctx.lineTo(width - 50 - arrowSize, centerY - arrowSize / 2);
    ctx.lineTo(width - 50 - arrowSize, centerY + arrowSize / 2);
    ctx.closePath();
    ctx.fillStyle = lineColor;
    ctx.fill();

    // Left arrow
    ctx.beginPath();
    ctx.moveTo(50, centerY);
    ctx.lineTo(50 + arrowSize, centerY - arrowSize / 2);
    ctx.lineTo(50 + arrowSize, centerY + arrowSize / 2);
    ctx.closePath();
    ctx.fill();

    // Draw tick marks and labels
    const tickSpacing = 60; // pixels between ticks
    const numTicks = Math.floor((width - 100) / tickSpacing / 2);

    ctx.fillStyle = tickColor;
    ctx.strokeStyle = tickColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 1.5;

    for (let i = -numTicks; i <= numTicks; i++) {
      const x = centerX + i * tickSpacing;
      
      if (x < 50 || x > width - 50) continue;

      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(x, centerY - 10);
      ctx.lineTo(x, centerY + 10);
      ctx.stroke();

      // Draw faint vertical grid lines
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.strokeStyle = tickColor;
      ctx.lineWidth = 1.5;

      // Draw label
      ctx.font = i === 0 ? "bold 18px Arial" : "14px Arial";
      ctx.fillText(i.toString(), x, centerY + 18);
    }

    // Draw paths stacked vertically above the number line
    const pathVerticalSpacing = 60; // vertical spacing between paths
    const pathStartY = centerY - 80; // start drawing paths above the number line
    
    paths.forEach((path, pathIndex) => {
      const yOffset = pathStartY - (pathIndex * pathVerticalSpacing);
      const startX = centerX; // always start from 0
      const endX = centerX + path.exponent * tickSpacing;
      
      // Draw the line segment
      ctx.strokeStyle = path.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, yOffset);
      ctx.lineTo(endX, yOffset);
      ctx.stroke();
      
      // Draw circles at start and end
      ctx.fillStyle = path.color;
      ctx.beginPath();
      ctx.arc(startX, yOffset, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, yOffset, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw arrow heads along the path
      const numArrows = Math.abs(path.exponent);
      const direction = path.exponent > 0 ? 1 : -1;
      
      for (let i = 0; i < numArrows; i++) {
        const arrowX = startX + (i + 0.5) * tickSpacing * direction;
        const arrowHeadSize = 8;
        
        ctx.fillStyle = path.color;
        ctx.strokeStyle = path.color;
        ctx.lineWidth = 2;
        
        // Draw arrow pointing right (or left if negative)
        ctx.beginPath();
        if (direction > 0) {
          // Right arrow
          ctx.moveTo(arrowX + arrowHeadSize, yOffset);
          ctx.lineTo(arrowX, yOffset - arrowHeadSize / 2);
          ctx.lineTo(arrowX, yOffset + arrowHeadSize / 2);
        } else {
          // Left arrow
          ctx.moveTo(arrowX - arrowHeadSize, yOffset);
          ctx.lineTo(arrowX, yOffset - arrowHeadSize / 2);
          ctx.lineTo(arrowX, yOffset + arrowHeadSize / 2);
        }
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw path label (a^n notation)
      ctx.fillStyle = path.color;
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const label = path.exponent === 1 ? "a" : 
                   path.exponent === -1 ? "a⁻¹" :
                   path.exponent > 0 ? `a^${path.exponent}` :
                   `a^${path.exponent}`;
      ctx.fillText(label, Math.max(startX, endX) + 15, yOffset);
    });

    // Highlight current position if provided
    if (currentPosition !== 0) {
      const posX = centerX + currentPosition * tickSpacing;
      if (posX >= 50 && posX <= width - 50) {
        ctx.beginPath();
        ctx.arc(posX, centerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = theme === "dark" ? "#4CAF50" : "#2E7D32";
        ctx.fill();
        ctx.strokeStyle = theme === "dark" ? "#81C784" : "#66BB6A";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

  }, [theme, currentPosition, paths]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "1400px",
          maxHeight: "500px",
        }}
      />
    </div>
  );
};

export default NumberLine;
