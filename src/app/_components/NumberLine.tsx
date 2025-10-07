"use client";
import React, { useEffect, useRef } from "react";

interface NumberLineProps {
  theme: "dark" | "light";
  currentPosition?: number;
}

const NumberLine: React.FC<NumberLineProps> = ({ 
  theme, 
  currentPosition = 0 
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

  }, [theme, currentPosition]);

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
