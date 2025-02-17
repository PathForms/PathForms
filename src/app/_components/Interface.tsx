"use client";

import React, { useState } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";

type Direction = "up" | "down" | "left" | "right";

const Interface = () => {
  // Initialize the starting coordinate
  const [path, setPath] = useState<string[]>(["0,0"]); // Node path
  const [moves, setMoves] = useState<Direction[]>([]); // Persist moves across renders
  const [edges, setEdges] = useState<string[]>([]); // Edge path, start with an empty list;

  const handleMove = (direction: Direction) => {
    ////////////////// Node /////////////////
    if (path.length === 0) return; // ? Useful ?

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
      setEdges((edges) => edges.slice(0, -1));
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

    /////////////////Edge///////////////////
    //x,y: start point
    //x2,y2: end point
    const x2 = next_Node_raw[0];
    const y2 = next_Node_raw[1];
    console.log(y2);
    //make id
    const edge_id = `${x},${y}->${x2},${y2}`;
    console.log(edge_id);
    //push into edge
    setEdges((edges) => [...edges, edge_id]);
  };

  return (
    <div>
      <ButtonBar onMove={handleMove} />
      <CayleyTree path={path} edgePath={edges} />
    </div>
  );
};

export default Interface;
