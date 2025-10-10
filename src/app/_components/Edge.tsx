"use client";
import React, { useEffect, useState } from "react";

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  source: string;
  target: string;
  isActive?: boolean;
  isFinalResult?: boolean;
  isCancelledPart?: boolean;
  edgeThickness?: number;
  shape?: string;
}

const Edge: React.FC<EdgeProps> = ({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  isActive,
  isFinalResult = false,
  isCancelledPart = false,
  edgeThickness,
  shape,
}) => {
  const [x, y] = source.split(",").map(Number);
  const [x2, y2] = target.split(",").map(Number);
  const [dashOffset, setDashOffset] = useState(0);

  // Determine arrow marker for midpoint based on shape and direction
  const getMidpointArrowMarker = () => {
    // Only show arrows on active paths (user-generated paths)
    if (!isActive) return undefined;
    
    if (shape === "rect") {
      // For rectangle shape, determine direction
      const dx = x2 - x;
      const dy = y2 - y;
      
      // For horizontal movement, always use left arrow
      // For vertical movement, always use up arrow
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement - use left arrow
        return "url(#arrow-left-mid-active)";
      } else {
        // Vertical movement - use up arrow
        return "url(#arrow-up-mid-active)";
      }
    }
    // For circle shape, don't use midpoint arrows (use end arrows instead)
    return undefined;
  };

  // Animation effect for the dotted line when active
  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;
    let offset = 0;

    const animate = () => {
      // Slower animation speed (0.2 instead of 0.5)
      // Negative value to make it move in the opposite direction
      offset = (offset - 0.2) % 16;
      setDashOffset(offset);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  let strokeColor = "rgba(255, 34, 5, 0.2)";
  if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
    strokeColor = "rgba(0, 94, 255, 0.23)";
  }

  let thickness = edgeThickness ?? 1;
  let strokeDasharray = "none";
  let strokeDashoffset = "0";
  
  if (isFinalResult) {
    // Final result preview - bright and dashed
    thickness += 2;
    strokeDasharray = "8,4";
    strokeDashoffset = dashOffset.toString();
    if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
      strokeColor = "rgba(0, 94, 255, 0.8)"; // Bright blue for final result
    } else {
      strokeColor = "rgba(255, 34, 5, 0.8)"; // Bright red for final result
    }
  } else if (isCancelledPart) {
    // Cancelled parts - dimmed and dashed
    thickness += 2;
    strokeDasharray = "8,4";
    strokeDashoffset = dashOffset.toString();
    if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
      strokeColor = "rgba(0, 94, 255, 0.3)"; // Dimmed blue for cancelled
    } else {
      strokeColor = "rgba(255, 34, 5, 0.3)"; // Dimmed red for cancelled
    }
  } else if (isActive) {
    strokeColor = "rgb(251, 0, 71)";
    thickness += 2;
    strokeDasharray = "5,3"; // Add dotted line effect when active
    strokeDashoffset = dashOffset.toString();
    
    if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
      strokeColor = "rgb(0, 140, 255)";
    }
  }

  // Calculate midpoint for arrow placement
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={strokeColor}
        strokeWidth={thickness}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        markerEnd={undefined}
        style={{ transition: isActive ? "none" : "all 0.3s ease" }}
      />
      {/* Add arrow at midpoint */}
      {isActive && (
        <>
          {shape === "rect" ? (
            // Rectangle shape - keep original logic (up and left only)
            <>
              {Math.abs(x2 - x) > Math.abs(y2 - y) ? (
                // Horizontal movement - left arrow (triangle) - pointing towards source
                <polygon
                  points={`${midX-9} ${midY-6}, ${midX+9} ${midY}, ${midX-9} ${midY+6}`}
                  fill="rgb(0, 255, 0)"
                />
              ) : (
                // Vertical movement - up arrow (triangle) - pointing towards source
                <polygon
                  points={`${midX-6} ${midY+9}, ${midX+6} ${midY+9}, ${midX} ${midY-9}`}
                  fill="rgb(0, 255, 0)"
                />
              )}
            </>
          ) : shape === "circle" ? (
            // Circle shape - follow actual path direction (outward)
            (() => {
              // Calculate actual path direction
              const dx = targetX - sourceX;
              const dy = targetY - sourceY;
              const length = Math.sqrt(dx * dx + dy * dy);
              const pathDirX = dx / length;
              const pathDirY = dy / length;
              
              // Calculate perpendicular vector for arrow width
              const perpX = -pathDirY;
              const perpY = pathDirX;
              
              // Arrow dimensions (wider base)
              const arrowLength = 9;
              const arrowWidth = 12;
              
              // Calculate arrow points (pointing outward along path)
              const tipX = midX + pathDirX * arrowLength;
              const tipY = midY + pathDirY * arrowLength;
              const base1X = midX - pathDirX * arrowLength + perpX * arrowWidth / 2;
              const base1Y = midY - pathDirY * arrowLength + perpY * arrowWidth / 2;
              const base2X = midX - pathDirX * arrowLength - perpX * arrowWidth / 2;
              const base2Y = midY - pathDirY * arrowLength - perpY * arrowWidth / 2;
              
              return (
                <polygon
                  points={`${base1X} ${base1Y}, ${tipX} ${tipY}, ${base2X} ${base2Y}`}
                  fill="rgb(0, 255, 0)"
                />
              );
            })()
          ) : null}
        </>
      )}
    </>
  );
};

export default Edge;