"use client";

import React, { useState, useEffect } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";
import Pathbar from "./Pathbar";
import Headbar from "./Headbar";
import Pathlist from "../../game/_components/Pathlist";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";

// Define opposite moves for backtracking
const oppositeMoves: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const Interface = () => {
  // State for storing historical paths
  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);
  const [moveRecords, setMoveRecords] = useState<Direction[][]>([]);

  // State for the current path (nodes, moves, and edges)
  const [nodes, setNodes] = useState<string[]>(["0,0"]);
  const [moves, setMoves] = useState<Direction[]>([]);
  const [edges, setEdges] = useState<string[]>([]);

  // Settings state: edge thickness, vertex size, theme and settings panel visibility
  const [edgeThickness, setEdgeThickness] = useState<number>(2);

  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Handle a move action triggered from the ButtonBar
  const handleMove = (direction: Direction) => {
    if (nodes.length === 0) return;
    const currentNode = nodes[nodes.length - 1];
    const [x, y] = currentNode.split(",").map(Number);
    let nextNodeRaw: [number, number] | null = null;

    // If the new move is the opposite of the previous move, perform backtracking
    if (
      moves.length > 0 &&
      moves[moves.length - 1] === oppositeMoves[direction]
    ) {
      setEdges((prevEdges) => prevEdges.slice(0, -1));
      setMoves((prevMoves) => prevMoves.slice(0, -1));
      setNodes((prevNodes) => prevNodes.slice(0, -1));
      return;
    }

    // Calculate the next node coordinates based on the direction
    switch (direction) {
      case "up":
        nextNodeRaw = [x, y + 100.0 / 2 ** (nodes.length - 1)];
        break;
      case "down":
        nextNodeRaw = [x, y - 100.0 / 2 ** (nodes.length - 1)];
        break;
      case "left":
        nextNodeRaw = [x - 100.0 / 2 ** (nodes.length - 1), y];
        break;
      case "right":
        nextNodeRaw = [x + 100.0 / 2 ** (nodes.length - 1), y];
        break;
      default:
        return;
    }

    const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
    setMoves((prevMoves) => [...prevMoves, direction]);
    setNodes((prevNodes) => [...prevNodes, nextNode]);

    const edgeId = `${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`;
    setEdges((prevEdges) => [...prevEdges, edgeId]);
  };

  // Log moves and nodes for debugging
  useEffect(() => {
    console.log("Moves:", moves);
  }, [moves]);

  useEffect(() => {
    console.log("Nodes:", nodes);
  }, [nodes]);

  // Store the current path into history
  const storePath = () => {
    setNodePaths((prev) => [...prev, nodes]);
    setEdgePaths((prev) => [...prev, edges]);
    setMoveRecords((prev) => [...prev, moves]);
  };

  useEffect(() => {
    console.log("Move Records:", moveRecords);
  }, [moveRecords]);

  // Demonstrate a specific stored path on the Cayley tree
  const demonstratePath = (index: number) => {
    setNodes([...nodePaths[index]]);
    setEdges([...edgePaths[index]]);
    setMoves([...moveRecords[index]]);
  };

  // Concatenate two stored paths (for example, the first two paths)
  const concatenate = () => {
    const path1Moves = [...moveRecords[0]];
    const path2Moves = [...moveRecords[1]];
    let newMoves: Direction[] = [];

    // Remove canceling moves at the junction
    while (path1Moves.length !== 0 && path2Moves.length !== 0) {
      const tail = path1Moves.at(-1);
      const head = path2Moves.at(0);
      if (tail !== undefined && head !== undefined) {
        if (head === oppositeMoves[tail]) {
          path1Moves.pop();
          path2Moves.shift();
        } else {
          break;
        }
      } else {
        console.log("One of the elements is undefined");
        break;
      }
    }
    newMoves = path1Moves;
    newMoves.push(...path2Moves);

    // Reconstruct nodes and edges from the concatenated moves
    let newNodes: string[] = ["0,0"];
    let newEdges: string[] = [];
    for (const direction of newMoves) {
      let prevNode = newNodes[newNodes.length - 1];
      const [x, y] = prevNode.split(",").map(Number);
      let nextNodeRaw: [number, number] | null = null;
      switch (direction) {
        case "up":
          nextNodeRaw = [x, y + 100.0 / 2 ** (newNodes.length - 1)];
          break;
        case "down":
          nextNodeRaw = [x, y - 100.0 / 2 ** (newNodes.length - 1)];
          break;
        case "left":
          nextNodeRaw = [x - 100.0 / 2 ** (newNodes.length - 1), y];
          break;
        case "right":
          nextNodeRaw = [x + 100.0 / 2 ** (newNodes.length - 1), y];
          break;
        default:
          return;
      }
      const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
      newNodes.push(nextNode);
      const edgeId = `${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`;
      newEdges.push(edgeId);
    }
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Reset the current (unsaved) path
  const reset = () => {
    setNodes(["0,0"]);
    setEdges([]);
    setMoves([]);
  };

  // Clear all stored paths and current data
  const clear = () => {
    setNodes(["0,0"]);
    setEdges([]);
    setEdgePaths([]);
    setNodePaths([]);
    setMoveRecords([]);
  };

  // Invert a stored path at a given index
  const invertPath = (index: number) => {
    if (moveRecords[index]) {
      let currentMoves = [...moveRecords[index]];
      let invertedNodes: string[] = ["0,0"];
      let invertedEdges: string[] = [];
      let invertedMoves: Direction[] = [];
      for (let i = currentMoves.length - 1; i >= 0; i--) {
        let oppositeMove = oppositeMoves[currentMoves[i]];
        invertedMoves.push(oppositeMove);
        let prevNode = invertedNodes[invertedNodes.length - 1];
        const [x, y] = prevNode.split(",").map(Number);
        let nextNodeRaw: [number, number] | null = null;
        switch (oppositeMove) {
          case "up":
            nextNodeRaw = [x, y + 100.0 / 2 ** (invertedNodes.length - 1)];
            break;
          case "down":
            nextNodeRaw = [x, y - 100.0 / 2 ** (invertedNodes.length - 1)];
            break;
          case "left":
            nextNodeRaw = [x - 100.0 / 2 ** (invertedNodes.length - 1), y];
            break;
          case "right":
            nextNodeRaw = [x + 100.0 / 2 ** (invertedNodes.length - 1), y];
            break;
          default:
            return;
        }
        const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
        invertedNodes.push(nextNode);
        const edgeId = `${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`;
        invertedEdges.push(edgeId);
      }
      setNodes(invertedNodes);
      setEdges(invertedEdges);
      setMoves(invertedMoves);
      setNodePaths((prev) => {
        if (prev.length === 0) return prev;
        return [
          ...prev.slice(0, index),
          invertedNodes,
          ...prev.slice(index + 1),
        ];
      });
      setEdgePaths((prev) => {
        if (prev.length === 0) return prev;
        return [
          ...prev.slice(0, index),
          invertedEdges,
          ...prev.slice(index + 1),
        ];
      });
      setMoveRecords((prev) => {
        if (prev.length === 0) return prev;
        return [
          ...prev.slice(0, index),
          invertedMoves,
          ...prev.slice(index + 1),
        ];
      });
    } else {
      console.error(`moveRecords[${index}] is undefined or does not exist.`);
    }
  };

  /////////////////////// Headbar Functions ///////////////////////////////
  // Toggle the visibility of the settings panel
  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // Handle change for edge thickness setting
  const handleEdgeThicknessChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEdgeThickness(Number(e.target.value));
  };

  // Handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = e.target.value as "dark" | "light";
    setTheme(selectedTheme);
  };

  return (
    <div className={`${styles.container} ${theme}`}>
      <Headbar
        theme={theme}
        toggleSettings={toggleSettings}
        showSettings={showSettings}
        edgeThickness={edgeThickness}
        handleEdgeThicknessChange={handleEdgeThicknessChange}
        handleThemeChange={handleThemeChange}
      />

      {/* Main components */}
      <ButtonBar onMove={handleMove} />
      {/* Pass edgeThickness and vertexSize to CayleyTree for styling adjustments */}
      <CayleyTree path={nodes} edgePath={edges} edgeThickness={edgeThickness} />
      <Pathlist
        demonstratePath={demonstratePath}
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        movePaths={moveRecords}
      />
      <Pathbar
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        movePaths={moveRecords}
        reset={reset}
        clear={clear}
        store={storePath}
        demonstratePath={demonstratePath}
        concatenate={concatenate}
        invert={invertPath}
      />
    </div>
  );
};

export default Interface;
