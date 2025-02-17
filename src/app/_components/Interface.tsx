"use client";

import React, { useState } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";

type Direction = "up" | "down" | "left" | "right";

const Interface = () => {
  // Initialize the starting coordinate
  const [path, setPath] = useState<string[]>(["0,0"]);
  const [moves, setMoves] = useState<Direction[]>([]); // Persist moves across renders

  const handleMove = (direction: Direction) => {
    if (path.length === 0) return;

    const current_Node = path[path.length - 1];

    const [x, y] = current_Node.split(",").map(Number);
    let next_Node_raw: [number, number] | null = null;

    // Map of opposite moves
    const oppositeMoves: Record<Direction, Direction> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (
      moves.length > 0 &&
      moves[moves.length - 1] === oppositeMoves[direction]
    ) {
      setMoves((prevMoves) => prevMoves.slice(0, -1)); // Remove last move
      setPath((prevPath) => prevPath.slice(0, -1)); // Remove last position
      return;
    }

    switch (direction) {
      case "up":
        next_Node_raw = [x, y - 100.0 / 2 ** (path.length - 1)];
        break;
      case "down":
        next_Node_raw = [x, y + 100.0 / 2 ** (path.length - 1)];
        break;
      case "left":
        next_Node_raw = [x - 100.0 / 2 ** (path.length - 1), y];
        break;
      case "right":
        next_Node_raw = [x + 100.0 / 2 ** (path.length - 1), y];
        break;
      default:
        return;
    }

    const next_Node = `${next_Node_raw[0]},${next_Node_raw[1]}`;

    setMoves((prevMoves) => [...prevMoves, direction]);
    setPath((prevPath) => [...prevPath, next_Node]);

    console.log(next_Node);
    console.log(moves.length);
    console.log(moves[moves.length - 1]);
  };

  return (
    <div>
      <ButtonBar onMove={handleMove} />
      <CayleyTree path={path} />
    </div>
  );
};

export default Interface;
