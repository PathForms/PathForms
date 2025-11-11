"use client";
import React, { useEffect, useState, useRef } from "react";

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
  isHoveredTarget?: boolean;
  edgeThickness?: number;
  edgeColor?: string;
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
  isHoveredTarget = false,
  edgeThickness,
  edgeColor,
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
  // Use useRef to store offset to prevent infinite loop
  const offsetRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive && !isHoveredTarget) {
      // Reset offset when not active
      offsetRef.current = 0;
      setDashOffset(0);
      return;
    }

    const animate = () => {
      // Slower animation speed (0.2 instead of 0.5)
      // Negative value to make it move in the opposite direction
      offsetRef.current = (offsetRef.current - 0.2) % 16;
      setDashOffset(offsetRef.current);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isActive, isHoveredTarget]);

  // For hexagon layout (rank 3), use the edgeColor from the tree
  // For other layouts, use direction-based colors
  let strokeColor = "rgba(255, 34, 5, 0.2)";
  if (shape === "hexagon" && edgeColor) {
    // Use the edge color from the tree, with reduced opacity for inactive edges
    // Convert hex to rgba format
    if (edgeColor.startsWith("#")) {
      const r = parseInt(edgeColor.slice(1, 3), 16);
      const g = parseInt(edgeColor.slice(3, 5), 16);
      const b = parseInt(edgeColor.slice(5, 7), 16);
      strokeColor = isActive
        ? `rgba(${r}, ${g}, ${b}, 0.8)`
        : `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
  } else if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
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
    if (shape === "hexagon" && edgeColor) {
      // Use edge color with high opacity for final result
      if (edgeColor.startsWith("#")) {
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        strokeColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
      }
    } else if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
      strokeColor = "rgba(0, 94, 255, 0.8)"; // Bright blue for final result
    } else {
      strokeColor = "rgba(255, 34, 5, 0.8)"; // Bright red for final result
    }
  } else if (isCancelledPart) {
    // Cancelled parts - dimmed and dashed
    thickness += 2;
    strokeDasharray = "8,4";
    strokeDashoffset = dashOffset.toString();
    if (shape === "hexagon" && edgeColor) {
      // Use edge color with low opacity for cancelled parts
      if (edgeColor.startsWith("#")) {
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        strokeColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
    } else if ((x === x2 && y <= y2) || (x === x2 && y >= y2)) {
      strokeColor = "rgba(0, 94, 255, 0.3)"; // Dimmed blue for cancelled
    } else {
      strokeColor = "rgba(255, 34, 5, 0.3)"; // Dimmed red for cancelled
    }
  } else if (isHoveredTarget) {
    // Highlight the hovered target path with a brighter, thicker line
    thickness += 4;
    strokeDasharray = "6,3";
    strokeDashoffset = dashOffset.toString();
    if (shape === "hexagon" && edgeColor) {
      // Use edge color with high brightness for hovered target
      if (edgeColor.startsWith("#")) {
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        // Lighten the color
        const lightR = Math.min(255, r + 60);
        const lightG = Math.min(255, g + 60);
        const lightB = Math.min(255, b + 60);
        strokeColor = `rgb(${lightR}, ${lightG}, ${lightB})`;
      }
    } else if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
      strokeColor = "rgb(135, 206, 250)"; // Light blue for hovered target
    } else {
      strokeColor = "rgb(255, 99, 132)"; // Light red/pink for hovered target
    }
  } else if (isActive) {
    thickness += 2;
    strokeDasharray = "5,3"; // Add dotted line effect when active
    strokeDashoffset = dashOffset.toString();

    if (shape === "hexagon" && edgeColor) {
      // Use edge color with high opacity for active edges
      if (edgeColor.startsWith("#")) {
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        strokeColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
      }
    } else {
      strokeColor = "rgb(251, 0, 71)";
      if ((x == x2 && y <= y2) || (x == x2 && y >= y2)) {
        strokeColor = "rgb(0, 140, 255)";
      }
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
                  points={`${midX - 9} ${midY - 6}, ${midX + 9} ${midY}, ${midX - 9} ${midY + 6}`}
                  fill="rgb(0, 255, 0)"
                />
              ) : (
                // Vertical movement - up arrow (triangle) - pointing towards source
                <polygon
                  points={`${midX - 6} ${midY + 9}, ${midX + 6} ${midY + 9}, ${midX} ${midY - 9}`}
                  fill="rgb(0, 255, 0)"
                />
              )}
            </>
          ) : null}
          {/* Circle shape - no arrows */}
        </>
      )}
    </>
  );
};

export default Edge;
