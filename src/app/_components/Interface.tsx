"use client";

import React, { useState, useEffect } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";
import Pathbar from "./Pathbar";

type Direction = "up" | "down" | "left" | "right";

const oppositeMoves: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const Interface = () => {
  // Initialize the starting coordinate

  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);
  const [moveRecords, setMoveRecords] = useState<Direction[][]>([]);

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
        next_Node_raw = [x, y - 100.0 / 2 ** (nodes.length - 1)];
        break;
      case "left":
        next_Node_raw = [x - 100.0 / 2 ** (nodes.length - 1), y];
        break;
      case "right":
        next_Node_raw = [x + 100.0 / 2 ** (nodes.length - 1), y];
        break;
      default:
        return;
    }

    const next_Node = `${next_Node_raw[0]},${next_Node_raw[1]}`;
    //add move
    setMoves((prevMoves) => [...prevMoves, direction]);
    //add node
    setNodes((prevPath) => [...prevPath, next_Node]);

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

  ///// Debug Session for handleMove /////
  useEffect(() => {
    console.log(moves.length);
    console.log(moves);
  }, [moves]); // This will run after moves has been updated

  useEffect(() => {
    console.log(nodes);
  }, [nodes]); // This will run after nodes has been updated

  //function for store button in Pathsbar
  // Stores the path and demonstrate that in pathbar
  const Store = () => {
    //store current path
    setNodePaths((prev) => [...prev, nodes]);
    setEdgePaths((prev) => [...prev, edges]);
    setMoveRecords((prev) => [...prev, moves]);
    // //empty the paths
    // setNodes(["0,0"]);
    // setEdges([]);
    // setMoves([]);
  };

  ///// Debug Session for moveRecords /////
  useEffect(() => {
    console.log(moveRecords);
  }, [moveRecords]); // This will run after nodes has been updated

  //function for demonstrate buttons in Pathbar
  //Demonstrate a specific path onto Caylay tree
  const demonstratePath = (index: number) => {
    setNodes([...nodePaths[index]]);
    setEdges([...edgePaths[index]]);
    setMoves([...moveRecords[index]]);
  };

  // function for concatenate button in Pathbar
  // Concatenate two paths and demonstrate the result onto caylaytree
  const concatenate = () => {
    // Combine the first two data paths.
    // Future implementation: Let the player choose which two paths to concatenate.
    // up: A; right: B;
    // set up, shallow copies of data to be concatenated.

    const path_1_moves = [...moveRecords[0]];
    const path_2_moves = [...moveRecords[1]];

    // construct new nodePath and edgePath

    let new_moves: Direction[] = [];

    //recursively check and update the nodes and edges;
    //default: append th head of path 2 to the tail of path 1;

    while (path_1_moves.length != 0 && path_2_moves.length != 0) {
      //get head and tail
      const tail = path_1_moves.at(-1);
      const head = path_2_moves.at(0);

      // Ensure that head and tail are not undefined
      if (tail !== undefined && head !== undefined) {
        // Check for concatenation condition
        if (head === oppositeMoves[tail]) {
          //remove the first element of path 2 and last element if path 1
          path_1_moves.pop(); // Removes and returns the last element of path_1_moves
          path_2_moves.shift(); // Removes and returns the first element of path_2_moves
        } else {
          break;
        }
      } else {
        // Handle the case where head or tail is undefined
        console.log("One of the elements is undefined");
        break; // Exit or handle the error gracefully
      }
    }

    //after this, get the final concatenated graph;
    new_moves = path_1_moves;
    new_moves.push(...path_2_moves);

    //draw the path
    let nodes_result: string[] = ["0,0"];
    let edges_result: string[] = [];

    //nodes setup

    for (const direction of new_moves) {
      let prev_node = nodes_result[nodes_result.length - 1];
      const [x, y] = prev_node.split(",").map(Number);
      let next_Node_raw: [number, number] | null = null;
      switch (direction) {
        case "up":
          next_Node_raw = [x, y + 100.0 / 2 ** (nodes_result.length - 1)];
          break;
        case "down":
          next_Node_raw = [x, y - 100.0 / 2 ** (nodes_result.length - 1)];
          break;
        case "left":
          next_Node_raw = [x - 100.0 / 2 ** (nodes_result.length - 1), y];
          break;
        case "right":
          next_Node_raw = [x + 100.0 / 2 ** (nodes_result.length - 1), y];
          break;
        default:
          return;
      }
      const next_Node = `${next_Node_raw[0]},${next_Node_raw[1]}`;
      nodes_result.push(next_Node);

      //edge setup
      //x,y: start point
      //x2,y2: end point
      const x2 = next_Node_raw[0];
      const y2 = next_Node_raw[1];
      //make id
      const edge_id = `${x},${y}->${x2},${y2}`;
      edges_result.push(edge_id);
    }

    //draw concatennation result;
    //do not need to do anything else;
    setNodes(nodes_result);
    setEdges(edges_result);
  };

  // Reset function
  // Reset only the unstored user input
  const reset = () => {
    setNodes(["0,0"]);
    setEdges([]);
    setMoves([]);
  };
  // clear function
  // clear all data stored
  const clear = () => {
    setNodes(["0,0"]);
    setEdges([]);
    setEdgePaths([]);
    setNodePaths([]);
    setMoveRecords([]);
  };

  // Invert paths
  const Invert = (index: number) => {
    // Get current path moves
    if (moveRecords[index]) {
      let curr_moves = [...moveRecords[index]];

      let inverted_nodes: string[] = ["0,0"];
      let inverted_edges: string[] = [];
      let inverted_moves: Direction[] = [];

      for (let i = curr_moves.length - 1; i >= 0; i--) {
        let oppositeMove = oppositeMoves[curr_moves[i]];

        inverted_moves.push(oppositeMove);

        let prev_node = inverted_nodes[inverted_nodes.length - 1];
        const [x, y] = prev_node.split(",").map(Number);

        let next_Node_raw: [number, number] | null = null;

        switch (oppositeMove) {
          case "up":
            next_Node_raw = [x, y + 100.0 / 2 ** (inverted_nodes.length - 1)];
            break;
          case "down":
            next_Node_raw = [x, y - 100.0 / 2 ** (inverted_nodes.length - 1)];
            break;
          case "left":
            next_Node_raw = [x - 100.0 / 2 ** (inverted_nodes.length - 1), y];
            break;
          case "right":
            next_Node_raw = [x + 100.0 / 2 ** (inverted_nodes.length - 1), y];
            break;
          default:
            return;
        }

        const next_Node = `${next_Node_raw[0]},${next_Node_raw[1]}`;
        inverted_nodes.push(next_Node);

        const [x2, y2] = next_Node_raw;
        const edge_id = `${x},${y}->${x2},${y2}`;
        inverted_edges.push(edge_id);
      }

      setNodes(inverted_nodes);
      setEdges(inverted_edges);
      setMoves(inverted_moves);

      // I think invert will actually change not only the current path, but also the records that are going to be displayed.
      setNodePaths((prevArray) => {
        if (prevArray.length === 0) return prevArray; // Handle empty array case
        return [
          ...prevArray.slice(0, index),
          inverted_nodes,
          ...prevArray.slice(index + 1),
        ];
      });
      setEdgePaths((prevArray) => {
        if (prevArray.length === 0) return prevArray; // Handle empty array case
        return [
          ...prevArray.slice(0, index),
          inverted_edges,
          ...prevArray.slice(index + 1),
        ];
      });
      setMoveRecords((prevArray) => {
        if (prevArray.length === 0) return prevArray; // Handle empty array case
        return [
          ...prevArray.slice(0, index),
          inverted_moves,
          ...prevArray.slice(index + 1),
        ];
      });
    } else {
      console.error(`moveRecords[${index}] is undefined or does not exist.`);
    }
  };

  return (
    <div>
      <ButtonBar onMove={handleMove} />
      <CayleyTree path={nodes} edgePath={edges} />
      <Pathbar
        nodePath={nodePaths}
        edgePath={edgePaths}
        movePath={moveRecords}
        reset={reset}
        clear={clear}
        store={Store}
        demonstratePath={demonstratePath}
        concatenate={concatenate}
        invert={Invert}
      />
    </div>
  );
};

export default Interface;
