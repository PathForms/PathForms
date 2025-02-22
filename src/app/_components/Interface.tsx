"use client";

import React, { useState } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";
import Pathbar from "./Pathbar";

type Direction = "up" | "down" | "left" | "right";

const Interface = () => {
  // Initialize the starting coordinate

  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);

  const [nodes, setNodes] = useState<string[]>(["0,0"]); // Node path
  const [moves, setMoves] = useState<Direction[]>([]); // Persist moves across renders
  const [edges, setEdges] = useState<string[]>([]); // Edge path, start with an empty list;

  // function for move in Buttonsbar;
  //make a move on the current graph;
  const handleMove = (direction: Direction) => {
    ////////////////// Node /////////////////
    if (nodes.length === 0) return; // ? Useful ?

    const current_Node = nodes[nodes.length - 1];

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
      setNodes((prevPath) => prevPath.slice(0, -1)); // Remove last position
      return;
    }

    switch (direction) {
      case "up":
        next_Node_raw = [x, y + 100.0 / 2 ** (nodes.length - 1)];
        break;
      case "down":
        next_Node_raw = [x - 100.0 / 2 ** (nodes.length - 1), y];

        break;
      case "left":
        next_Node_raw = [x, y - 100.0 / 2 ** (nodes.length - 1)];

        break;
      case "right":
        next_Node_raw = [x + 100.0 / 2 ** (nodes.length - 1), y];
        break;
      default:
        return;
    }

    const next_Node = `${next_Node_raw[0]},${next_Node_raw[1]}`;

    setMoves((prevMoves) => [...prevMoves, direction]);
    setNodes((prevPath) => [...prevPath, next_Node]);

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

  //function for store button in Pathsbar
  // Stores the path and demonstrate that in pathbar
  const Store = () => {
    //store current path
    setNodePaths((prev) => [...prev, nodes]);
    setEdgePaths((prev) => [...prev, edges]);
    //empty the paths
    setNodes(["0,0"]);
    setEdges([]);
  };

  //function for demonstrate buttons in Pathbar
  //Demonstrate a specific path onto Caylay tree
  const demonstratePath = (index: number) => {
    setNodes([...nodePaths[index]]);
    setEdges([...edgePaths[index]]);
  };

  // function for concatennate button in Pathbar
  // Concatenate two paths and demonstrate the result onto caylaytree
  const concatennate = (paths: string[][]) => {};

  return (
    <div>
      <ButtonBar onMove={handleMove} />
      <CayleyTree path={nodes} edgePath={edges} />
      <Pathbar
        nodePath={nodePaths}
        edgePath={edgePaths}
        store={Store}
        demonstratePath={demonstratePath}
        concatennate={concatennate}
      />
    </div>
  );
};

export default Interface;
