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
  let moves: Direction[] = [];
  const handleMove = (direction: Direction) => {
    //deal with moves

    const current_Node = path[path.length - 1];

    //split the id
    const [x, y] = current_Node.split(",").map(Number);
    let next_Node_raw;
    let i: number = 0;
    // Determine the new coordinate based on the direction
    switch (direction) {
      case "up":
        if (moves.length == 0 || moves[length - 1] != "down") {
          moves.push("up");
          next_Node_raw = [x, y - 100.0 / 2 ** (path.length - 1)];
          i = 1;
        } else {
          moves.pop();
        }

        break;
      case "down":
        if (moves.length == 0 || moves[length - 1] != "up") {
          moves.push("down");
          i = 1;
          next_Node_raw = [x, y + 100.0 / 2 ** (path.length - 1)];
        } else {
          moves.pop();
        }

        break;
      case "left":
        if (moves.length == 0 || moves[length - 1] != "right") {
          moves.push("left");
          i = 1;
          next_Node_raw = [x - 100.0 / 2 ** (path.length - 1), y];
        } else {
          moves.pop();
        }
        break;
      case "right":
        if (moves.length == 0 || moves[length - 1] != "left") {
          moves.push("right");
          i = 1;
          next_Node_raw = [x + 100.0 / 2 ** (path.length - 1), y];
        } else {
          moves.pop();
        }
        break;
      default:
        return;
    }

    if (i == 1) {
      const next_Node = String(`${next_Node_raw[0]},${next_Node_raw[1]}`);
      // Update the stack with the new coordinate
      setPath([...path, next_Node]);
    } else {
      setPath(path.slice(0, -1));
    }
  };

  return (
    <div>
      <ButtonBar onMove={handleMove} />
      <CayleyTree path={path} />
    </div>
  );
};

export default Interface;
