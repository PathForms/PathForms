"use client";

import React, { useState, useEffect, useRef } from "react";
import ButtonBar from "./ButtonBar";
import CayleyTree from "./CayleyTree";
import Pathbar from "./Pathbar";
import Headbar from "./Headbar";
import Pathlist from "./Pathlist";
import Pathterminal from "./Pathterminal";
import styles from "./components.module.css";
import CheckNielsen from "./CheckNielsen";
import Tutorial from "./Tutorial";
import WelcomeScreen from "./WelcomeScreen";
import buildNodesEdgesFromMoves from "../utils/buildNodesEdgesFromMoves";
import next from "next";
import Steps from "./Steps";
import { greedyNielsenSteps } from "../utils/greedyNielsen";

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

  // states for bases;
  const [bases, setBases] = useState<Direction[][]>([]);
  // State for action modes
  // normal (default)
  // insert
  // concatenate
  const [operationMode, setOperationMode] = useState<string>("normal");

  //States for Cayley graph visualization;
  const [shape, setShape] = useState<string>("circle");
  // // State for the current path showing on the screen (nodes, moves, and edges)
  // const [nodes, setNodes] = useState<string[]>(["0,0"]);
  // const [moves, setMoves] = useState<Direction[]>([]);
  // const [edges, setEdges] = useState<string[]>([]);

  // Settings state: edge thickness, vertex size, theme and settings panel visibility
  const [edgeThickness, setEdgeThickness] = useState<number>(0.7);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  //Welcome screen state
  const [showWelcome, setShowWelcome] = useState(true);

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [tutorialActive, setTutorialActive] = useState<boolean>(false);

  // Steps state
  const [targetSteps, setTargetSteps] = useState(0);
  const [usedConcatSteps, setUsedConcatSteps] = useState<number>(0);

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

  useEffect(() => {
    console.log("tutorialStep:", tutorialStep);
  });
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

  ///////////////////////////////////concatenate helpers//////////////////////////////

  function doConcat(pathA: Direction[], pathB: Direction[]): Direction[] {
    let a = [...pathA];
    let b = [...pathB];
    // Canceling moves at the junction
    while (a.length && b.length) {
      if (b[0] === oppositeMoves[a[a.length - 1]]) {
        a.pop();
        b.shift();
      } else {
        break;
      }
    }
    return [...a, ...b];
  }

  ////////////////////////////////////////
  // 可选：回退操作 (若你想要真正回退到之前的 moves)
  ////////////////////////////////////////
  function revertConcat(
    originalA: Direction[],
    originalB: Direction[],
    indexA: number,
    indexB: number
  ) {
    alert("Concat failed. Reverting to previous state!");
    // 你需要恢复 moveRecords[indexA], moveRecords[indexB]
    // 这里演示将 moveRecords 重置为 original
    setMoveRecords((prev) => {
      const newRec = [...prev];
      newRec[indexA] = originalA;
      newRec[indexB] = originalB;
      return newRec;
    });
    const { newNodes: nodesA, newEdges: edgesA } =
      buildNodesEdgesFromMoves(originalA);
    const { newNodes: nodesB, newEdges: edgesB } =
      buildNodesEdgesFromMoves(originalB);

    setNodePaths((prev) => {
      const newPaths = [...prev];
      newPaths[indexA] = nodesA;
      newPaths[indexB] = nodesB;
      return newPaths;
    });

    setEdgePaths((prev) => {
      const newEdgesArr = [...prev];
      newEdgesArr[indexA] = edgesA;
      newEdgesArr[indexB] = edgesB;
      return newEdgesArr;
    });
  }

  // Concatenate two stored paths (for example, the first two paths)
  const concatenate = (index1: number, index2: number) => {
    if (index1 === index2) {
      // alert("Cannot concatenate the same path with itself!");
      return;
    }
    if (
      index1 < 0 ||
      index2 < 0 ||
      index1 >= moveRecords.length ||
      index2 >= moveRecords.length
    ) {
      alert("Invalid path indices for concatenation!");
      return;
    }

    // 备份：以便失败时 revert
    const originalA = [...moveRecords[index1]];
    const originalB = [...moveRecords[index2]];

    // ========== Step5: path0 => a, path1 => a^-1b^-1 ==========
    if (tutorialActive && tutorialStep === 5) {
      const originalA = [...moveRecords[index1]];
      const originalB = [...moveRecords[index2]];
      const newMoves = doConcat(originalA, originalB);

      const moves0 = newMoves;
      const moves1 = originalB;
      if (
        JSON.stringify(moves0) === JSON.stringify(["up"]) &&
        JSON.stringify(moves1) === JSON.stringify(["down", "left"])
      ) {
        setTutorialStep(6);
      } else {
        alert("Try again! The result isn't right!");
        revertConcat(originalA, originalB, index1, index2);
        return;
      }

      setMoveRecords((prev) => {
        const newRec = [...prev];
        newRec[index1] = newMoves;
        return newRec;
      });
      setUsedConcatSteps(prev => prev + 1);

      const { newNodes, newEdges } = buildNodesEdgesFromMoves(newMoves);
      setNodePaths((prev) => {
        const nextPaths = [...prev];
        nextPaths[index1] = newNodes;
        return nextPaths;
      });
      setEdgePaths((prev) => {
        const nextEdges = [...prev];
        nextEdges[index1] = newEdges;
        return nextEdges;
      });
    }

    // ========== Step6: path0 => b^-1, path1 => a^-1b^-1 ==========
    if (tutorialActive && tutorialStep === 6) {
      if (index1 !== 0 || index2 !== 1) {
        alert("In this step, you must select path1 then path2 again!");
        return;
      }

      const originalA = [...moveRecords[index1]];
      const originalB = [...moveRecords[index2]];

      const newMoves = doConcat(originalA, originalB);

      const moves0 = newMoves;
      const moves1 = originalB;

      if (
        JSON.stringify(moves0) === JSON.stringify(["left"]) &&
        JSON.stringify(moves1) === JSON.stringify(["down", "left"])
      ) {
        setTutorialStep(7);
      } else {
        alert("Try again! The result isn't right!");
        revertConcat(originalA, originalB, index1, index2);
        return;
      }

      setMoveRecords((prev) => {
        const newRec = [...prev];
        newRec[index1] = newMoves;
        return newRec;
      });
      setUsedConcatSteps(prev => prev + 1);

      const { newNodes, newEdges } = buildNodesEdgesFromMoves(newMoves);
      setNodePaths((prev) => {
        const newPaths = [...prev];
        newPaths[index1] = newNodes;
        return newPaths;
      });
      setEdgePaths((prev) => {
        const newEdgesArr = [...prev];
        newEdgesArr[index1] = newEdges;
        return newEdgesArr;
      });

      return;
    }

    // ---------- 如果在 tutorial 模式但 step != 5,6,8 => 提示并撤销 ----------
    else if (tutorialActive && ![5, 6, 8].includes(tutorialStep)) {
      alert(` Concatenate isn't expected right now!`);
      // 不做任何更新就行，撤销操作
      return;
    }

    // ---------- 非 tutorial 模式 或 tutorialStep=8 正常 concat ----------
    const newMoves = doConcat(originalA, originalB);
    setMoveRecords((prev) => {
      const newRec = [...prev];
      newRec[index1] = newMoves;
      return newRec;
    });
    setUsedConcatSteps(prev => prev + 1);
    const { newNodes, newEdges } = buildNodesEdgesFromMoves(newMoves);
    setNodePaths((prev) => {
      const nextPaths = [...prev];
      nextPaths[index1] = newNodes;
      return nextPaths;
    });
    setEdgePaths((prev) => {
      const nextEdges = [...prev];
      nextEdges[index1] = newEdges;
      return nextEdges;
    });
  };

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
    setUsedConcatSteps(0);
    setTargetSteps(0);
  };

  // Invert a stored path at a given index
  const invertPath = (index: number) => {
    if (!moveRecords[index]) {
      console.error(`moveRecords[${index}] is undefined or does not exist.`);
      return;
    }

    if (tutorialActive && tutorialStep !== 4 && tutorialStep !== 8) {
      alert("you cannot invert the path right now!");
      return;
    }

    if (tutorialActive && tutorialStep === 4) {
      if (index !== 1) {
        alert("You must double-click the SECOND path (index=1) to invert it");
        return;
      }
      let currentMoves = [...moveRecords[index]];
      const invertedMoves: Direction[] = [];
      for (let i = currentMoves.length - 1; i >= 0; i--) {
        invertedMoves.push(oppositeMoves[currentMoves[i]]);
      }

      setMoveRecords((prev) => {
        const newRec = [...prev];
        newRec[index] = invertedMoves;
        return newRec;
      });

      const { newNodes, newEdges } = buildNodesEdgesFromMoves(invertedMoves);
      setNodePaths((prev) => {
        const newPaths = [...prev];
        newPaths[index] = newNodes;
        return newPaths;
      });
      setEdgePaths((prev) => {
        const newEdgesList = [...prev];
        newEdgesList[index] = newEdges;
        return newEdgesList;
      });

      if (JSON.stringify(invertedMoves) === JSON.stringify(["down", "left"])) {
        setTutorialStep(5);
      } else {
        alert(
          "It's inverted, but not exactly a^-1 b^-1. Let's proceed anyway."
        );
      }
      return;
    }
    let currentMoves = [...moveRecords[index]];
    const invertedMoves: Direction[] = [];
    for (let i = currentMoves.length - 1; i >= 0; i--) {
      invertedMoves.push(oppositeMoves[currentMoves[i]]);
    }

    setMoveRecords((prev) => {
      const newRec = [...prev];
      newRec[index] = invertedMoves;
      return newRec;
    });

    const { newNodes, newEdges } = buildNodesEdgesFromMoves(invertedMoves);
    setNodePaths((prev) => {
      const newPaths = [...prev];
      newPaths[index] = newNodes;
      return newPaths;
    });
    setEdgePaths((prev) => {
      const newEdgesList = [...prev];
      newEdgesList[index] = newEdges;
      return newEdgesList;
    });
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
    if (tutorialActive && tutorialStep === 1) {
      const newMoveRecords: Direction[][] = [
        ["up", "right", "up"], // aba
        ["right", "up"], // ba
      ];

      setEdgePaths([]);
      setNodePaths([]);
      setMoveRecords(newMoveRecords);
      setTargetSteps(greedyNielsenSteps(newMoveRecords));
      setUsedConcatSteps(0);
      setOperationMode("normal");
      setPathIndex([0, 1]);

      const newNodePaths: string[][] = [];
      const newEdgePaths: string[][] = [];

      newMoveRecords.forEach((pathMoves) => {
        let nodes = ["0,0"];
        let edges: string[] = [];
        for (let i = 0; i < pathMoves.length; i++) {
          const dir = pathMoves[i];
          const [x, y] = nodes[nodes.length - 1].split(",").map(Number);
          let next: [number, number] = [x, y];
          switch (dir) {
            case "up":
              next = [x, y + 100.0 / 2 ** (nodes.length - 1)];
              break;
            case "down":
              next = [x, y - 100.0 / 2 ** (nodes.length - 1)];
              break;
            case "left":
              next = [x - 100.0 / 2 ** (nodes.length - 1), y];
              break;
            case "right":
              next = [x + 100.0 / 2 ** (nodes.length - 1), y];
              break;
          }
          const nextNode = `${next[0]},${next[1]}`;
          nodes.push(nextNode);
          edges.push(`${x},${y}->${next[0]},${next[1]}`);
        }
        newNodePaths.push(nodes);
        newEdgePaths.push(edges);
      });

      setNodePaths(newNodePaths);
      setEdgePaths(newEdgePaths);

      setTutorialStep(2);
      return;
    }

    if (tutorialActive && tutorialStep !== 1) {
      alert("You cannot generate paths right now!");
      return;
    }
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
    setTargetSteps(greedyNielsenSteps(moveRecordsRef.current));
    setUsedConcatSteps(0);
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

  const GenerateRandomPath = (n: number) => {
    if (tutorialActive) {
      alert("You cannot generate paths with random bases right now!");
      return;
    }
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
    //here, after everything is set, we give something to the pathlist.
    //set Move Records;
    //let's start with trying 20 things;
    //this should do it, add a button to test;
    for (let i = 0; i < 4 * n; i++) {
      //random path index;
      let index = Math.floor(Math.random() * n);
      //random move;
      let move = Math.floor(Math.random() * 4);

      switch (move) {
        case 0:
          moveRecordsRef.current[index].push("up");
          break;
        case 1:
          moveRecordsRef.current[index].push("down");
          break;
        case 2:
          moveRecordsRef.current[index].push("left");
          break;
        case 3:
          moveRecordsRef.current[index].push("right");
          break;
      }
      const tail = moveRecordsRef.current[index].at(-1);
      const head = moveRecordsRef.current[index].at(-2);

      if (tail && head && head === oppositeMoves[tail]) {
        moveRecordsRef.current[index].pop();
        moveRecordsRef.current[index].pop();
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
    setTargetSteps(greedyNielsenSteps(moveRecordsRef.current));
    setUsedConcatSteps(0);
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
  //
  ///
  //

  //
  //
  //
  //

  // function for generating path based on given bases;
  const GenerateBasedPath = (n: number, bases: Direction[][]) => {
    if (tutorialActive && tutorialStep === 1) {
      const newMoveRecords: Direction[][] = [
        ["up", "right", "up"], // aba
        ["right", "up"], // ba
      ];

      setEdgePaths([]);
      setNodePaths([]);
      setMoveRecords(newMoveRecords);
      setTargetSteps(greedyNielsenSteps(newMoveRecords));
      setUsedConcatSteps(0);
      setOperationMode("normal");
      setPathIndex([0, 1]);

      const newNodePaths: string[][] = [];
      const newEdgePaths: string[][] = [];

      newMoveRecords.forEach((pathMoves) => {
        let nodes = ["0,0"];
        let edges: string[] = [];
        for (let i = 0; i < pathMoves.length; i++) {
          const dir = pathMoves[i];
          const [x, y] = nodes[nodes.length - 1].split(",").map(Number);
          let next: [number, number] = [x, y];
          switch (dir) {
            case "up":
              next = [x, y + 100.0 / 2 ** (nodes.length - 1)];
              break;
            case "down":
              next = [x, y - 100.0 / 2 ** (nodes.length - 1)];
              break;
            case "left":
              next = [x - 100.0 / 2 ** (nodes.length - 1), y];
              break;
            case "right":
              next = [x + 100.0 / 2 ** (nodes.length - 1), y];
              break;
          }
          const nextNode = `${next[0]},${next[1]}`;
          nodes.push(nextNode);
          edges.push(`${x},${y}->${next[0]},${next[1]}`);
        }
        newNodePaths.push(nodes);
        newEdgePaths.push(edges);
      });

      setNodePaths(newNodePaths);
      setEdgePaths(newEdgePaths);

      setTutorialStep(2);
      return;
    }

    if (tutorialActive && tutorialStep !== 1) {
      alert("You cannot generate paths right now!");
      return;
    }

    setEdgePaths([]);
    setNodePaths([]);
    setMoveRecords([]);
    setOperationMode("normal");

    // Reset refs
    //check: if n is smaller than bases: do the first n bases;
    //else: fill the first n words with bases;

    //default bases;
    if (bases.length == 0) {
      //if emptuy, generate default words
      bases = [["up"], ["right"]];
    }

    if (n < bases.length) {
      moveRecordsRef.current = bases.slice(0, n).map((path) => [...path]);
    } else {
      moveRecordsRef.current = bases.map((path) => [...path]);
    }
    nodePathsRef.current = [];
    edgePathsRef.current = [];
    //generate additional
    //I think this should work;
    if (n == 1) {
      n = 2;
    }
    if (n >= 2) {
      let k = n - (moveRecordsRef.current.length + 1);
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
    setTargetSteps(greedyNielsenSteps(moveRecordsRef.current));
    setUsedConcatSteps(0);
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

  // To accompany the previous function, we need both demonstratebases and setbase (set and clear) :a input bar,
  // and another list window;
  //all functions are for buttonsbar;
  const Addbase = (b: string) => {
    //the input is a string like aba, a , a, a-, b-, a-b, a-b-aba, ...
    //we need to translate them into directions and store them in bases;
    const newbase: Direction[] = [];
    let i = 0;
    while (i < b.length) {
      const c = b[i];
      if (i + 1 < b.length && b[i + 1] === "-") {
        if (c === "a") newbase.push("down");
        else if (c === "b") newbase.push("left");
        i += 2;
      } else {
        if (c === "a") newbase.push("up");
        else if (c === "b") newbase.push("right");
        i += 1;
      }
      //automatically cancel;
      const tail = newbase.at(-1);
      const head = newbase.at(-2);

      if (tail && head && head === oppositeMoves[tail]) {
        newbase.pop();
        newbase.pop();
      }
    }
    if (newbase.length != 0) {
      setBases((prev) => [...prev, newbase]);
    }
  };

  const clearBase = () => {
    setBases([]);
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
    if (!tutorialActive) {
      setPathIndex(
        (prevIndexes) =>
          prevIndexes.includes(index)
            ? prevIndexes.filter((i) => i !== index) // Remove if exists
            : [...prevIndexes, index] // Add if not present
      );
      return;
    }

    if (tutorialStep === 2) {
      if (index === 0) {
        // hide path0
        if (pathIndex.includes(0)) {
          setPathIndex((prev) => prev.filter((i) => i !== 0));
          setTutorialStep(3);
        } else {
          alert("Path1 is already hidden? Try again.");
        }
      } else {
        alert("Wrong action! You must long press Path1 to hide it!");
      }
    } else if (tutorialStep === 3) {
      if (index === 0) {
        if (!pathIndex.includes(0)) {
          setPathIndex((prev) => [...prev, 0]);
          setTutorialStep(4);
        } else {
          alert("Path1 is already shown? Try again!");
        }
      } else {
        alert("Wrong action! You must long press Path1 to show it again!");
      }
    } else {
      setPathIndex((prevIndexes) =>
        prevIndexes.includes(index)
          ? prevIndexes.filter((i) => i !== index)
          : [...prevIndexes, index]
      );
    }
  };

  const removePath = (idx: number) => {
    setMoveRecords((prev) => prev.filter((_, i) => i !== idx));
    setNodePaths((prev) => prev.filter((_, i) => i !== idx));
    setEdgePaths((prev) => prev.filter((_, i) => i !== idx));
    setPathIndex((prev) =>
      prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))
    );
  };

  ///////////////// CayleyGraph shape config ///////////////////
  const handleshape = () => {
    if (shape == "circle") {
      setShape("rect");
    } else {
      setShape("circle");
    }
  };
  return (
    <>
      {showWelcome && (
        <WelcomeScreen
          onStartTutorial={() => {
            setShowWelcome(false);
            setTutorialStep(1);
            setTutorialActive(true);
          }}
          onSkipTutorial={() => {
            setTutorialActive(false);
            setTutorialStep(0);
            setShowWelcome(false);
          }}
        />
      )}

      <div className={`${styles.container} ${theme}`}>
        <Headbar
          theme={theme}
          toggleSettings={toggleSettings}
          showSettings={showSettings}
          edgeThickness={edgeThickness}
          handleEdgeThicknessChange={handleEdgeThicknessChange}
          handleThemeChange={handleThemeChange}
          shape={shape}
          handleshape={handleshape}
        />

        <ButtonBar
          bases={bases}
          generate={GeneratePath}
          generate_rand={GenerateRandomPath}
          setGen={setGen}
          tutorialStep={tutorialStep}
          generate_base={GenerateBasedPath}
          addbase={Addbase}
          clearbase={clearBase}
        />
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
          shape={shape}
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
          removePath={removePath}
          tutorialStep={tutorialStep}
        />
        <CheckNielsen
          movePaths={moveRecords}
          tutorialActive={tutorialActive}
          tutorialStep={tutorialStep}
          onTutorialCheck={(nextStep) => {
            if (nextStep === 0) {
              setTutorialActive(false);
              setTutorialStep(0);
            } else {
              setTutorialStep(nextStep);
            }
          }}
        />
        {/*         
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
        /> */}
        <Tutorial
          step={tutorialStep}
          isActive={tutorialActive}
          onNext={() => setTutorialStep((s) => s + 1)}
          onSkip={() => {
            setTutorialActive(false);
            setTutorialStep(0);
          }}
        />
        <Steps optimalSteps={targetSteps} usedSteps={usedConcatSteps} />
      </div>
    </>
  );
};

export default Interface;
