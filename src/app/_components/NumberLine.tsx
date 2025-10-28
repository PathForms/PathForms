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
  onPathInvert?: (index: number) => void;
  onPathConcatenate?: (draggedIndex: number, targetIndex: number) => void;
}

const NumberLine: React.FC<NumberLineProps> = ({ 
  theme, 
  currentPosition = 0,
  paths = [],
  onPathInvert,
  onPathConcatenate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedPathIndex, setDraggedPathIndex] = React.useState<number | null>(null);
  const [hoveredPathIndex, setHoveredPathIndex] = React.useState<number | null>(null);
  const [mousePosition, setMousePosition] = React.useState<{ x: number; y: number } | null>(null);

  // Helper function to get path index at mouse position
  const getPathAtPosition = (mouseX: number, mouseY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;
    
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const tickSpacing = 60;
    const pathVerticalSpacing = 35; // Reduced spacing to fit more paths
    const pathStartY = centerY - 175; // Start position for first path (5 paths above = 5 * 35 = 175px)

    // Check each path
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      // Position paths: 0-4 above the number line, 5-9 below
      let yOffset;
      if (i < 5) {
        yOffset = pathStartY + (i * pathVerticalSpacing);
      } else {
        yOffset = centerY + ((i - 4) * pathVerticalSpacing);
      }
      
      // Special handling for a^0 (identity element) - check if near the dot
      if (path.exponent === 0) {
        const dotRadius = 15; // Hit detection radius
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - yOffset, 2));
        if (distance <= dotRadius) {
          return i;
        }
        continue;
      }
      
      const startX = centerX;
      const endX = centerX + path.exponent * tickSpacing;
      
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      
      // Check if mouse is within the path's bounding box (with some tolerance)
      if (x >= minX - 10 && x <= maxX + 10 && 
          y >= yOffset - 15 && y <= yOffset + 15) {
        return i;
      }
    }
    
    return null;
  };

  // Handle double-click to invert
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pathIndex = getPathAtPosition(e.clientX, e.clientY);
    if (pathIndex !== null && onPathInvert) {
      onPathInvert(pathIndex);
    }
  };

  // Handle mouse down to start drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pathIndex = getPathAtPosition(e.clientX, e.clientY);
    if (pathIndex !== null) {
      setDraggedPathIndex(pathIndex);
    }
  };

  // Handle mouse move to track hover and drag position
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update mouse position for drag rendering
    setMousePosition({ x, y });
    
    const pathIndex = getPathAtPosition(e.clientX, e.clientY);
    
    // Only update hover if not dragging
    if (draggedPathIndex === null) {
      setHoveredPathIndex(pathIndex);
    }
    
    // Update cursor style
    if (canvas) {
      if (draggedPathIndex !== null) {
        canvas.style.cursor = 'grabbing';
      } else {
        canvas.style.cursor = pathIndex !== null ? 'grab' : 'default';
      }
    }
  };

  // Handle mouse up to complete drag
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedPathIndex !== null) {
      const targetPathIndex = getPathAtPosition(e.clientX, e.clientY);
      if (targetPathIndex !== null && targetPathIndex !== draggedPathIndex && onPathConcatenate) {
        onPathConcatenate(draggedPathIndex, targetPathIndex);
      }
      setDraggedPathIndex(null);
      setMousePosition(null);
    }
  };

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

    // Draw paths stacked vertically above and below the number line
    const pathVerticalSpacing = 35; // vertical spacing between paths (reduced to fit 10 paths total)
    const pathStartY = centerY - 175; // start drawing paths above the number line (5 paths above = 5 * 35 = 175px)
    
    paths.forEach((path, pathIndex) => {
      // Position paths: 0-4 above the number line, 5-9 below
      // Above: pathIndex 0-4 -> offset from pathStartY
      // Below: pathIndex 5-9 -> offset from centerY + pathVerticalSpacing
      let yOffset;
      if (pathIndex < 5) {
        yOffset = pathStartY + (pathIndex * pathVerticalSpacing);
      } else {
        yOffset = centerY + ((pathIndex - 4) * pathVerticalSpacing);
      }

      const startX = centerX; // always start from 0
      const endX = centerX + path.exponent * tickSpacing;
      
      const isHovered = hoveredPathIndex === pathIndex;
      const isDragged = draggedPathIndex === pathIndex;
      
      // Special handling for a^0 (identity element) - render as a dot
      if (path.exponent === 0) {
        // Draw highlight background if hovered or dragged
        if (isHovered || isDragged) {
          ctx.fillStyle = isDragged ? 
            'rgba(255, 255, 255, 0.2)' : 
            'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(startX - 20, yOffset - 20, 40, 40);
        }
        
        // Draw a single prominent dot at the origin
        ctx.fillStyle = path.color;
        const dotRadius = isDragged ? 10 : isHovered ? 9 : 8;
        ctx.beginPath();
        ctx.arc(startX, yOffset, dotRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.strokeStyle = path.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(startX, yOffset, dotRadius + 3, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = path.color;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("a⁰", startX + 15, yOffset);
        
        return; // Skip the rest of the rendering for this path
      }
      
      // Draw highlight background if hovered or dragged
      if (isHovered || isDragged) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        ctx.fillStyle = isDragged ? 
          'rgba(255, 255, 255, 0.2)' : 
          'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(minX - 15, yOffset - 20, maxX - minX + 30, 40);
      }
      
      // Draw the line segment
      ctx.strokeStyle = path.color;
      ctx.lineWidth = isDragged ? 6 : isHovered ? 5 : 4;
      ctx.globalAlpha = isDragged ? 0.7 : 1;
      ctx.beginPath();
      ctx.moveTo(startX, yOffset);
      ctx.lineTo(endX, yOffset);
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Draw circles at start and end
      ctx.fillStyle = path.color;
      const circleRadius = isDragged ? 7 : isHovered ? 6 : 5;
      ctx.beginPath();
      ctx.arc(startX, yOffset, circleRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, yOffset, circleRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw arrow heads along the path (larger and more visible)
      const numArrows = Math.abs(path.exponent);
      const direction = path.exponent > 0 ? 1 : -1;
      
      for (let i = 0; i < numArrows; i++) {
        const arrowX = startX + (i + 0.5) * tickSpacing * direction;
        const arrowHeadSize = 12; // Increased from 8
        
        ctx.fillStyle = path.color;
        ctx.strokeStyle = path.color;
        ctx.lineWidth = 2.5; // Increased from 2
        
        // Draw arrow always pointing right
        ctx.beginPath();
        ctx.moveTo(arrowX + arrowHeadSize, yOffset);
        ctx.lineTo(arrowX, yOffset - arrowHeadSize / 2);
        ctx.lineTo(arrowX, yOffset + arrowHeadSize / 2);
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

    // Draw dragged path following mouse cursor
    if (draggedPathIndex !== null && mousePosition && paths[draggedPathIndex]) {
      const draggedPath = paths[draggedPathIndex];
      const dragX = mousePosition.x;
      const dragY = mousePosition.y;
      
      // Special handling for a^0 (identity element) when dragging
      if (draggedPath.exponent === 0) {
        // Draw semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(dragX - 25, dragY - 25, 50, 50);
        
        // Draw a prominent dot
        ctx.fillStyle = draggedPath.color;
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = draggedPath.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(dragX, dragY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = draggedPath.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dragX, dragY, 13, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = draggedPath.color;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("a⁰", dragX, dragY + 20);
        
      } else {
        // Regular path rendering
        // Calculate path dimensions
        const pathLength = Math.abs(draggedPath.exponent) * tickSpacing;
        const dragStartX = dragX - pathLength / 2;
        const dragEndX = dragX + pathLength / 2;
        
        // Draw semi-transparent background for dragged path
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(dragStartX - 15, dragY - 25, pathLength + 30, 50);
        
        // Draw the dragged path with enhanced visibility
        ctx.strokeStyle = draggedPath.color;
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = draggedPath.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(dragStartX, dragY);
        ctx.lineTo(dragEndX, dragY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        // Draw circles at start and end
        ctx.fillStyle = draggedPath.color;
        ctx.beginPath();
        ctx.arc(dragStartX, dragY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dragEndX, dragY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw arrow heads along the dragged path (larger and more visible)
        const numArrows = Math.abs(draggedPath.exponent);
        const direction = draggedPath.exponent > 0 ? 1 : -1;
        
        for (let i = 0; i < numArrows; i++) {
          const arrowX = dragStartX + (i + 0.5) * tickSpacing * direction;
          const arrowHeadSize = 14; // Increased from 10
          
          ctx.fillStyle = draggedPath.color;
          ctx.strokeStyle = draggedPath.color;
          ctx.lineWidth = 2.5; // Increased from 2
          
          // Draw arrow always pointing right
          ctx.beginPath();
          ctx.moveTo(arrowX + arrowHeadSize, dragY);
          ctx.lineTo(arrowX, dragY - arrowHeadSize / 2);
          ctx.lineTo(arrowX, dragY + arrowHeadSize / 2);
          ctx.closePath();
          ctx.fill();
        }
        
        // Draw path label
        ctx.fillStyle = draggedPath.color;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const dragLabel = draggedPath.exponent === 1 ? "a" : 
                          draggedPath.exponent === -1 ? "a⁻¹" :
                          draggedPath.exponent > 0 ? `a^${draggedPath.exponent}` :
                          `a^${draggedPath.exponent}`;
        ctx.fillText(dragLabel, dragX, dragY + 15);
      }
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

  }, [theme, currentPosition, paths, hoveredPathIndex, draggedPathIndex, mousePosition]);

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
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredPathIndex(null);
          setDraggedPathIndex(null);
          setMousePosition(null);
        }}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "1400px",
          maxHeight: "500px",
          cursor: "default",
        }}
      />
    </div>
  );
};

export default NumberLine;
