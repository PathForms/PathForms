//game interface
"use client";

import React, { useState } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";

type Direction = "up" | "down" | "left" | "right";

const Interface = () => {
  // Initialize the starting coordinate (e.g., (0, 0))
  const [path, setPath] = useState<string[]>(["0,0"]);

  // Function to handle movement
  const handleMove = (direction: Direction) => {
    const current_Node = path[path.length - 1];
    //split the id
    const [x, y] = current_Node.split(",").map(Number);
    let next_Node_raw;
    // Determine the new coordinate based on the direction
    switch (direction) {
      case "up":
        next_Node_raw = [x, y - 100.0 / 2 ** (path.length - 1)]; // Move up (y decreases)
        break;
      case "down":
        next_Node_raw = [x, y + 100.0 / 2 ** (path.length - 1)]; // Move down (y increases)
        break;
      case "left":
        next_Node_raw = [x - 100.0 / 2 ** (path.length - 1), y]; // Move left (x decreases)
        break;
      case "right":
        next_Node_raw = [x + 100.0 / 2 ** (path.length - 1), y]; // Move right (x increases)
        break;
      default:
        return;
    }
    const next_Node = String(`${next_Node_raw[0]},${next_Node_raw[1]}`);
    // Update the stack with the new coordinate
    setPath([...path, next_Node]);
  };

  return (
    <div>
      <ButtonBar onMove={handleMove} />
      <CayleyTree path={path} />
    </div>
  );
};

export default Interface;
