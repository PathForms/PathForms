"use client";

import React, { useState, useEffect, useRef } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";
import Pathbar from "./Pathbar";
import Headbar from "./Headbar";
import Pathlist from "./Pathlist";
import Pathterminal from "./Pathterminal";
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
  // State for storing historical paths & cayley graph rendering
  const [pathIndex, setPathIndex] = useState<number[]>([]); // index of paths to show on the Cayley graph;
  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);
  const [moveRecords, setMoveRecords] = useState<Direction[][]>([]);

  // State for action modes
  // normal (default)
  // insert
  // concatenate
  const [operationMode, setOperationMode] = useState<string>("normal");

  // // State for the current path showing on the screen (nodes, moves, and edges)
  // const [nodes, setNodes] = useState<string[]>(["0,0"]);
  // const [moves, setMoves] = useState<Direction[]>([]);
  // const [edges, setEdges] = useState<string[]>([]);

  // Settings state: edge thickness, vertex size, theme and settings panel visibility
  const [edgeThickness, setEdgeThickness] = useState<number>(0.7);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //////////////// functions for Buttons bar /////////////////////
  // // Handle a move action triggered from the ButtonBar
  // const handleMove = (direction: Direction) => {
  //   if (nodes.length === 0) return;
  //   const currentNode = nodes[nodes.length - 1];
  //   const [x, y] = currentNode.split(",").map(Number);
  //   let nextNodeRaw: [number, number] | null = null;

  //   // If the new move is the opposite of the previous move, perform backtracking
  //   if (
  //     moves.length > 0 &&
  //     moves[moves.length - 1] === oppositeMoves[direction]
  //   ) {
  //     setEdges((prevEdges) => prevEdges.slice(0, -1));
  //     setMoves((prevMoves) => prevMoves.slice(0, -1));
  //     setNodes((prevNodes) => prevNodes.slice(0, -1));
  //     return;
  //   }

  //   // Calculate the next node coordinates based on the direction
  //   switch (direction) {
  //     case "up":
  //       nextNodeRaw = [x, y + 100.0 / 2 ** (nodes.length - 1)];
  //       break;
  //     case "down":
  //       nextNodeRaw = [x, y - 100.0 / 2 ** (nodes.length - 1)];
  //       break;
  //     case "left":
  //       nextNodeRaw = [x - 100.0 / 2 ** (nodes.length - 1), y];
  //       break;
  //     case "right":
  //       nextNodeRaw = [x + 100.0 / 2 ** (nodes.length - 1), y];
  //       break;
  //     default:
  //       return;
  //   }

  //   const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
  //   setMoves((prevMoves) => [...prevMoves, direction]);
  //   setNodes((prevNodes) => [...prevNodes, nextNode]);

  //   const edgeId = `${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`;
  //   setEdges((prevEdges) => [...prevEdges, edgeId]);
  // };

  // // Log moves and nodes for debugging
  // useEffect(() => {
  //   console.log("Moves:", moves);
  // }, [moves]);

  // useEffect(() => {
  //   console.log("Nodes:", nodes);
  // }, [nodes]);
  //
  //
  //
  //
  //
  //
  //
  //
  ////////////// functions for PathBar ///////////////////////
  //
  //mode setters
  const setInvert = () => {
    if (operationMode == "invert") {
      setOperationMode("normal");
    } else {
      setOperationMode("invert");
    }
  };

  const setConcat = () => {
    if (operationMode == "concat") {
      setOperationMode("normal");
    } else {
      setOperationMode("concat");
    }
  };
  const setGen = () => {
    if (operationMode == "gen") {
      setOperationMode("normal");
    } else {
      setOperationMode("gen");
    }
  };
  // Store the current path into history
  // const storePath = () => {
  //   setNodePaths((prev) => [...prev, nodes]);
  //   setEdgePaths((prev) => [...prev, edges]);
  //   setMoveRecords((prev) => [...prev, moves]);
  // };

  // useEffect(() => {
  //   console.log("Move Records:", moveRecords);
  // }, [moveRecords]);

  // Concatenate two stored paths (for example, the first two paths)
  const concatenate = (index1: number, index2: number) => {
    // check for valid
    if (
      index1 < 0 ||
      index1 >= moveRecords.length ||
      index2 < 0 ||
      index2 >= moveRecords.length
    ) {
      console.error("Invalid indices:", index1, index2);
      return;
    }

    //fetch data
    const path1Moves = [...moveRecords[index1]];
    const path2Moves = [...moveRecords[index2]];
    let newMoves: Direction[] = [];

    // Remove canceling moves
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

    newMoves = path1Moves; // Combine path1 and path2
    newMoves.push(...path2Moves);

    //moveRecord update for path demonstration
    const updatedMoveRecords = [...moveRecords];
    updatedMoveRecords[index1] = newMoves;
    setMoveRecords(updatedMoveRecords);

    // Reconstruct nodes and edges
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
    //state update
    const updatedNodePath = [...nodePaths];
    const updatedEdgePath = [...edgePaths];
    updatedNodePath[index1] = newNodes;
    updatedEdgePath[index1] = newEdges;
    //since it's still the same number of paths showing, no need to change index;
    setNodePaths(updatedNodePath);
    setEdgePaths(updatedEdgePath);

    // setNodes(newNodes);
    // setEdges(newEdges);
  };

  // // Reset the current (unsaved) path
  // const reset = () => {
  //   setNodes(["0,0"]);
  //   setEdges([]);
  //   setMoves([]);
  // };

  // Clear all stored paths and current data
  const clear = () => {
    // setNodes(["0,0"]);
    // setEdges([]);
    // setMoves([]);
    setEdgePaths([]);
    setNodePaths([]);
    setMoveRecords([]);
    setPathIndex([]);
    setOperationMode("normal");
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
      // setNodes(invertedNodes);
      // setEdges(invertedEdges);
      setMoveRecords((prev) => {
        if (prev.length === 0) return prev;
        return [
          ...prev.slice(0, index),
          invertedMoves,
          ...prev.slice(index + 1),
        ];
      });
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

  ////////////// GeneratePath for Game //////////////////////
  const moveRecordsRef = useRef<Direction[][]>([["up"], ["right"]]);
  const nodePathsRef = useRef<string[][]>([]);
  const edgePathsRef = useRef<string[][]>([]);
  //
  // use user input to decide how many routes to generate, index must be larger or equal to 2 to work;
  //
  // const GeneratePath = () => {
  //   //
  //   //we need two paths, both start with a and b;
  //   //generating phase:
  //   //1. invert the current path
  //   //2. add path 2 to the back of path 1 or path 1 to the back of path 2;
  //   //
  //   //One to notice: the operation better not shorten the length of the path;
  //   // There can be optimization for runtime: check the conditions instead of the length of the sentences;
  //   // Can make animation effect: paths showing up;
  //   //
  //   //For demonstrating 2 paths, try add "0,0" as separations
  //   //
  //   //
  //   //
  //   //reset current states
  //   //

  //   // setNodes(["0,0"]);
  //   // setEdges([]);
  //   // setMoves([]);
  //   setEdgePaths([]);
  //   setNodePaths([]);
  //   setMoveRecords([]);

  //   // Reset refs
  //   moveRecordsRef.current = [["up"], ["right"]];
  //   nodePathsRef.current = [];
  //   edgePathsRef.current = [];

  //   // Check minimum length
  //   // This check can be optimized!
  //   while (
  //     moveRecordsRef.current[0].length <= 2 ||
  //     moveRecordsRef.current[1].length <= 2
  //   ) {
  //     const operation = Math.random() < 0.5 ? 0 : 1;

  //     //operation
  //     if (operation === 0) {
  //       //invert one of them
  //       const index = Math.random() < 0.5 ? 0 : 1;
  //       let currentMoves = [...moveRecordsRef.current[index]];
  //       for (let i = currentMoves.length - 1; i >= 0; i--) {
  //         let oppositeMove = oppositeMoves[currentMoves[i]];
  //         moveRecordsRef.current[index][currentMoves.length - 1 - i] =
  //           oppositeMove;
  //       }
  //     } else if (operation === 1) {
  //       //concatenate
  //       const index = Math.random() < 0.5 ? 0 : 1;
  //       const path1Moves = [...moveRecordsRef.current[index]];
  //       const path2Moves = [...moveRecordsRef.current[1 - index]];
  //       let newMoves: Direction[] = [];

  //       // Remove canceling moves at the junction
  //       while (path1Moves.length && path2Moves.length) {
  //         const tail = path1Moves.at(-1);
  //         const head = path2Moves.at(0);

  //         if (tail && head && head === oppositeMoves[tail]) {
  //           path1Moves.pop();
  //           path2Moves.shift();
  //         } else {
  //           break;
  //         }
  //       }

  //       newMoves = path1Moves;
  //       newMoves.push(...path2Moves);
  //       moveRecordsRef.current[index] = newMoves;
  //     }
  //   }

  //   // After paths are generated, set moveRecordsRef to the state
  //   setMoveRecords(moveRecordsRef.current);

  //   // Process paths and translate them into coordinates and edges
  //   const newNodePaths: string[][] = [];
  //   const newEdgePaths: string[][] = [];

  //   moveRecordsRef.current.forEach((move) => {
  //     let newNodes: string[] = ["0,0"];
  //     let newEdges: string[] = [];

  //     for (const direction of move) {
  //       let prevNode = newNodes[newNodes.length - 1];
  //       const [x, y] = prevNode.split(",").map(Number);
  //       let nextNodeRaw: [number, number] | null = null;

  //       switch (direction) {
  //         case "up":
  //           nextNodeRaw = [x, y + 100.0 / 2 ** (newNodes.length - 1)];
  //           break;
  //         case "down":
  //           nextNodeRaw = [x, y - 100.0 / 2 ** (newNodes.length - 1)];
  //           break;
  //         case "left":
  //           nextNodeRaw = [x - 100.0 / 2 ** (newNodes.length - 1), y];
  //           break;
  //         case "right":
  //           nextNodeRaw = [x + 100.0 / 2 ** (newNodes.length - 1), y];
  //           break;
  //         default:
  //           return;
  //       }

  //       if (nextNodeRaw) {
  //         const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
  //         newNodes.push(nextNode);
  //         const edgeId = `${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`;
  //         newEdges.push(edgeId);
  //       }
  //     }

  //     newNodePaths.push(newNodes);
  //     newEdgePaths.push(newEdges);
  //   });

  //   // Now update the state with all the paths

  //   setNodePaths(newNodePaths);
  //   setEdgePaths(newEdgePaths);
  //   setPathIndex((prevIndexes) => [...prevIndexes, 0, 1]);
  //   // Show the first path initially
  //   // setNodes(newNodePaths[0]);
  //   // setEdges(newEdgePaths[0]);
  // };

  // helper functions for weighted generation
  // Helper function to get a random index based on weighted probabilities
  const weightedRandomChoice = (weights: number[]): number => {
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
    let randomValue = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        return i;
      }
    }
    return weights.length - 1; // Fallback
  };

  // Inversion function with weighted random selection
  const weightedInversion = () => {
    // Calculate weights based on path lengths
    const weights = moveRecordsRef.current.map((path) => path.length);

    // Select a path based on weighted random choice
    const selectedIndex = weightedRandomChoice(weights);
    let currentMoves = [...moveRecordsRef.current[selectedIndex]];

    // Invert the selected path
    for (let i = currentMoves.length - 1; i >= 0; i--) {
      let oppositeMove = oppositeMoves[currentMoves[i]];
      moveRecordsRef.current[selectedIndex][currentMoves.length - 1 - i] =
        oppositeMove;
    }
  };
  const generateRandomPathPair = (n: number): [number, number] => {
    let index1 = Math.floor(Math.random() * n);
    let index2 = Math.floor(Math.random() * n);

    // Ensure that index1 and index2 are different
    while (index1 === index2) {
      index2 = Math.floor(Math.random() * n);
    }

    return [index1, index2];
  };

  const GeneratePath = (n: number) => {
    //
    //we need two paths, both start with a and b;
    //generating phase:
    //1. invert the current path
    //2. add path 2 to the back of path 1 or path 1 to the back of path 2;
    //
    //One to notice: the operation better not shorten the length of the path;
    // There can be optimization for runtime: check the conditions instead of the length of the sentences;
    // Can make animation effect: paths showing up;
    //
    //For demonstrating 2 paths, try add "0,0" as separations
    //
    //
    //
    //reset current states
    //

    // setNodes(["0,0"]);
    // setEdges([]);
    // setMoves([]);
    setEdgePaths([]);
    setNodePaths([]);
    setMoveRecords([]);
    setOperationMode("normal");

    // Reset refs
    moveRecordsRef.current = [["up"], ["right"]];
    nodePathsRef.current = [];
    edgePathsRef.current = [];
    //generate additional
    //might need debug
    if (n == 1) {
      n = 2;
    }
    if (n >= 2) {
      let k = n - 3;
      while (k >= 0) {
        moveRecordsRef.current.push([]);
        k--;
      }
    }

    while (moveRecordsRef.current.some((path) => path.length < 2)) {
      const operation = Math.random() < 0.5 ? 0 : 1;

      if (operation === 0) {
        // Inversion with weighted random choice
        weightedInversion();
      } else if (operation === 1) {
        // Concatenate as usual (could also be enhanced with weights if desired)
        let [index1, index2] = generateRandomPathPair(n);
        while (moveRecordsRef.current[index1].length >= 4) {
          [index1, index2] = generateRandomPathPair(n);
        }
        const path1Moves = [...moveRecordsRef.current[index1]];
        const path2Moves = [...moveRecordsRef.current[index2]];
        let newMoves: Direction[] = [];

        // Remove canceling moves at the junction
        while (path1Moves.length && path2Moves.length) {
          const tail = path1Moves.at(-1);
          const head = path2Moves.at(0);

          if (tail && head && head === oppositeMoves[tail]) {
            path1Moves.pop();
            path2Moves.shift();
          } else {
            break;
          }
        }

        newMoves = path1Moves;
        newMoves.push(...path2Moves);
        moveRecordsRef.current[index1] = newMoves;
      }
    }

    // After paths are generated, set moveRecordsRef to the state
    setMoveRecords(moveRecordsRef.current);

    // Process paths and translate them into coordinates and edges
    const newNodePaths: string[][] = [];
    const newEdgePaths: string[][] = [];

    moveRecordsRef.current.forEach((move) => {
      let newNodes: string[] = ["0,0"];
      let newEdges: string[] = [];

      for (const direction of move) {
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

        if (nextNodeRaw) {
          const nextNode = `${nextNodeRaw[0]},${nextNodeRaw[1]}`;
          newNodes.push(nextNode);
          const edgeId = `${x},${y}->${nextNodeRaw[0]},${nextNodeRaw[1]}`;
          newEdges.push(edgeId);
        }
      }

      newNodePaths.push(newNodes);
      newEdgePaths.push(newEdges);
    });

    // Now update the state with all the paths

    setNodePaths(newNodePaths);
    setEdgePaths(newEdgePaths);
    setPathIndex((prevIndexes) => [
      ...prevIndexes,
      ...Array.from({ length: n }, (_, i) => i), // Creates an array from 0 to n-1
    ]);
    // Show the first path initially
    // setNodes(newNodePaths[0]);
    // setEdges(newEdgePaths[0]);
  };

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
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

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  /////////// Pathlist Functions /////////////
  // Demonstrate paths on Cayley Tree
  // Improve for Pathlist
  //interaction with handle click: when click, an index is pushed into demonstratePath
  const demonstratePath = (index: number) => {
    // setNodes([...nodePaths[index]]);
    // setEdges([...edgePaths[index]]);
    // setMoves([...moveRecords[index]]);
    setPathIndex(
      (prevIndexes) =>
        prevIndexes.includes(index)
          ? prevIndexes.filter((i) => i !== index) // Remove if exists
          : [...prevIndexes, index] // Add if not present
    );
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

      <ButtonBar generate={GeneratePath} setGen={setGen} />
      <Pathterminal
        pathIndex={pathIndex}
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        moveRecords={moveRecords}
        operationMode={operationMode}
        setEdgePaths={setEdgePaths}
        setNodePaths={setNodePaths}
        setMoveRecords={setMoveRecords}
        setPathIndex={setPathIndex}
        setOperationMode={setOperationMode}
        generate={GeneratePath}
        demonstratePath={demonstratePath}
        concatenate={concatenate}
        invert={invertPath}
      />
      <CayleyTree
        pathIndex={pathIndex}
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        edgeThickness={edgeThickness}
      />

      <Pathlist
        mode={operationMode}
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        movePaths={moveRecords}
        pathIndex={pathIndex}
        demonstratePath={demonstratePath}
        concatenate={concatenate}
        invert={invertPath}
      />

      <Pathbar
        mode={operationMode}
        setInvert={setInvert}
        setConcat={setConcat}
        nodePaths={nodePaths}
        edgePaths={edgePaths}
        movePaths={moveRecords}
        clear={clear}
        demonstratePath={demonstratePath}
        concatenate={concatenate}
        invert={invertPath}
      />
    </div>
  );
};

export default Interface;
