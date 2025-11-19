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
import buildNodesEdgesFromMoves3, {
  Direction3,
} from "../utils/buildNodesEdgesFromMoves3";
import next from "next";
import Steps from "./Steps";
import { greedyNielsenSteps } from "../utils/greedyNielsen";
import { greedyNielsenSteps3 } from "../utils/greedyNielsen3";
import { useRouter } from "next/navigation";
import { setSoundEnabled as setSoundEnabledGlobal } from "../utils/soundManager";

// Support both rank 2 and rank 3
type Direction2 = "up" | "down" | "left" | "right";
type Direction = Direction2 | Direction3;

// Determine rank based on defaultShape
const getRank = (shape: string): 2 | 3 => {
  return shape === "hexagon" ? 3 : 2;
};

// Define opposite moves for rank 2
const oppositeMoves2: Record<Direction2, Direction2> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

// Define opposite moves for rank 3
const oppositeMoves3: Record<Direction3, Direction3> = {
  up: "down",
  down: "up",
  "right-up": "left-down",
  "left-down": "right-up",
  "right-down": "left-up",
  "left-up": "right-down",
};

interface InterfaceProps {
  defaultShape?: string;
}

const Interface = ({ defaultShape = "circle" }: InterfaceProps = {}) => {
  const rank = getRank(defaultShape);
  const isRank3 = rank === 3;

  // Type-safe direction handling based on rank
  type CurrentDirection = typeof isRank3 extends true ? Direction3 : Direction2;
  // Helper functions based on rank
  const oppositeMoves: Record<string, string> = isRank3
    ? oppositeMoves3
    : oppositeMoves2;
  const buildNodesEdges = isRank3
    ? buildNodesEdgesFromMoves3
    : buildNodesEdgesFromMoves;
  const greedyNielsenStepsFunc = isRank3
    ? greedyNielsenSteps3
    : greedyNielsenSteps;

  // State for storing historical paths & cayley graph rendering
  const [pathIndex, setPathIndex] = useState<number[]>([]); // index of paths to show on the Cayley graph;
  const [nodePaths, setNodePaths] = useState<string[][]>([]);
  const [edgePaths, setEdgePaths] = useState<string[][]>([]);
  const [moveRecords, setMoveRecords] = useState<Direction[][]>([]);
  const router = useRouter();

  // states for bases;
  const [bases, setBases] = useState<Direction[][]>([]);
  // State for action modes
  // normal (default)
  // insert
  // concatenate
  const [operationMode, setOperationMode] = useState<string>("normal");

  //States for Cayley graph visualization;
  const [shape, setShape] = useState<string>(defaultShape);
  // // State for the current path showing on the screen (nodes, moves, and edges)
  // const [nodes, setNodes] = useState<string[]>(["0,0"]);
  // const [moves, setMoves] = useState<Direction[]>([]);
  // const [edges, setEdges] = useState<string[]>([]);

  // Settings state: edge thickness, vertex size, theme and settings panel visibility
  const [edgeThickness, setEdgeThickness] = useState<number>(0.7);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  //Welcome screen state
  const [showWelcome, setShowWelcome] = useState(true);

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [tutorialActive, setTutorialActive] = useState<boolean>(false);
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);

  // ========== RANK3 TUTORIAL: Define tutorial steps for Rank 3 ==========
  // Rank 3 Tutorial Steps (6 steps total)
  const rank3TutorialSteps = [
    "Click the 'Generate Paths' button to create 3 paths.",
    "Long press Path 1 in the Word List to hide it.",
    "Long press Path 1 again to show it back.",
    "Double-click Path 3 to invert it.",
    "Drag Path 3 and put it on Path 2 to concatenate Path 3 after Path 2.",
    "Now try to reduce all paths to their simplest form using invert and concatenate operations!",
  ];
  // ========== END RANK3 TUTORIAL STEPS ==========

  // Steps state
  const [targetSteps, setTargetSteps] = useState(0);
  const [usedConcatSteps, setUsedConcatSteps] = useState<number>(0);

  // Drag preview state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragFromIndex, setDragFromIndex] = useState<number>(-1);
  const [dragHoverIndex, setDragHoverIndex] = useState<number>(-1);
  const [previewPath, setPreviewPath] = useState<{
    finalResult: {
      nodes: string[];
      edges: string[];
      moves: Direction[];
    };
    cancelledParts: {
      nodes: string[];
      edges: string[];
      moves: Direction[];
    };
  } | null>(null);

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
  // Optional: Revert operation (if you want to truly revert to previous moves)
  ////////////////////////////////////////
  function revertConcat(
    originalA: Direction[],
    originalB: Direction[],
    indexA: number,
    indexB: number
  ) {
    alert("Concat failed. Reverting to previous state!");
    // You need to restore moveRecords[indexA], moveRecords[indexB]
    // Here we demonstrate resetting moveRecords to original
    setMoveRecords((prev) => {
      const newRec = [...prev];
      newRec[indexA] = originalA;
      newRec[indexB] = originalB;
      return newRec;
    });
    const { newNodes: nodesA, newEdges: edgesA } = buildNodesEdges(
      originalA as any
    );
    const { newNodes: nodesB, newEdges: edgesB } = buildNodesEdges(
      originalB as any
    );

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

    // Backup: for reverting on failure
    const originalA = [...moveRecords[index1]];
    const originalB = [...moveRecords[index2]];

    // ========== RANK3 TUTORIAL: Step 5 - Concatenate path3 onto path2 ==========
    if (isRank3 && tutorialActive && tutorialStep === 5) {
      // For rank 3, allow concatenating path 3 (index 2) onto path 2 (index 1)
      if (index1 !== 1 || index2 !== 2) {
        alert("In this step, you must drag Path 3 onto Path 2!");
        return;
      }

      const originalA = [...moveRecords[index1]];
      const originalB = [...moveRecords[index2]];
      const newMoves = doConcat(originalA, originalB);

      setMoveRecords((prev) => {
        const newRec = [...prev];
        newRec[index1] = newMoves;
        return newRec;
      });
      setUsedConcatSteps((prev) => prev + 1);

      const { newNodes, newEdges } = buildNodesEdges(newMoves as any);
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

      // ========== RANK3 TUTORIAL: Clear drag state immediately after concatenate ==========
      // Clear drag state to stop flashing animation
      // This must happen BEFORE setTutorialStep to prevent state conflicts
      setIsDragging(false);
      setDragFromIndex(-1);
      setDragHoverIndex(-1);
      setPreviewPath(null);
      // ========== END RANK3 TUTORIAL: Clear drag state ==========

      // Move to step 6 (free play)
      setTutorialStep(6);
      return;
    }
    // ========== END RANK3 TUTORIAL: Step 5 ==========

    // ========== Rank 2 Step5: path0 => a, path1 => a^-1b^-1 ==========
    if (!isRank3 && tutorialActive && tutorialStep === 5) {
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
      setUsedConcatSteps((prev) => prev + 1);

      const { newNodes, newEdges } = buildNodesEdges(newMoves as any);
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

    // ========== Rank 2 Step6: path0 => b^-1, path1 => a^-1b^-1 ==========
    if (!isRank3 && tutorialActive && tutorialStep === 6) {
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
      setUsedConcatSteps((prev) => prev + 1);

      const { newNodes, newEdges } = buildNodesEdges(newMoves as any);
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

    // ========== RANK3 TUTORIAL: Block concatenate for other tutorial steps ==========
    // For rank 3, allow concatenate in steps 5 and 6 (free play)
    // For rank 2, allow concatenate in steps 5, 6, 7, 8
    const allowedSteps = isRank3 ? [5, 6] : [5, 6, 7, 8];
    if (tutorialActive && !allowedSteps.includes(tutorialStep)) {
      alert(` Concatenate isn't expected right now!`);
      // No update needed, just cancel the operation
      return;
    }
    // ========== END RANK3 TUTORIAL: Concatenate blocking ==========

    // ---------- Normal concat mode (non-tutorial or tutorialStep=8) ----------
    const newMoves = doConcat(originalA, originalB);
    setMoveRecords((prev) => {
      const newRec = [...prev];
      newRec[index1] = newMoves;
      return newRec;
    });
    setUsedConcatSteps((prev) => prev + 1);
    const { newNodes, newEdges } = buildNodesEdges(newMoves as any);
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

  // Calculate preview path for drag operation with dual preview (final result + cancelled parts)
  const calculatePreviewPath = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= moveRecords.length ||
      toIndex >= moveRecords.length
    ) {
      return null;
    }

    // When dragging fromIndex to toIndex, we want to concatenate fromIndex to the end of toIndex
    // So it should be: toIndex + fromIndex (path2 + path1)
    const pathA = [...moveRecords[toIndex]]; // target path (path2)
    const pathB = [...moveRecords[fromIndex]]; // dragged path (path1)

    // Calculate final result after cancellation
    const finalMoves = doConcat(pathA, pathB);
    const { newNodes: finalNodes, newEdges: finalEdges } = buildNodesEdges(
      finalMoves as any
    );

    // Calculate cancelled parts
    const cancelledParts = calculateCancelledParts(pathA, pathB);

    return {
      // Final result (normal preview)
      finalResult: {
        nodes: finalNodes,
        edges: finalEdges,
        moves: finalMoves,
      },
      // Cancelled parts (dimmed preview)
      cancelledParts: cancelledParts,
    };
  };

  // Calculate cancelled parts that will be removed during concatenation
  const calculateCancelledParts = (
    pathA: Direction[],
    pathB: Direction[]
  ): {
    nodes: string[];
    edges: string[];
    moves: Direction[];
  } => {
    // Now simulate the concatenation and find what gets cancelled
    const concatenated = [...pathA, ...pathB];
    const finalResult = doConcat(pathA, pathB);

    // Find which parts of the concatenated path are not in the final result
    // by building both paths and comparing their edges
    const { newNodes: concatNodes, newEdges: concatEdges } = buildNodesEdges(
      concatenated as any
    );
    const { newNodes: finalNodes, newEdges: finalEdges } = buildNodesEdges(
      finalResult as any
    );

    // Find edges that are in concatenated but not in final
    const cancelledEdges = concatEdges.filter(
      (edge) => !finalEdges.includes(edge)
    );

    // Find nodes that are in concatenated but not in final (excluding the start node)
    const cancelledNodes = concatNodes.filter(
      (node) => node !== "0,0" && !finalNodes.includes(node)
    );

    // For the moves, we need to find which moves from the concatenated path
    // correspond to the cancelled edges
    const cancelledMoves: Direction[] = [];
    let currentPos = "0,0";

    for (let i = 0; i < concatenated.length; i++) {
      const move = concatenated[i];
      const { newNodes: stepNodes } = buildNodesEdges(
        [move] as any,
        currentPos
      );
      const nextPos = stepNodes[1] || currentPos;
      const [x, y] = currentPos.split(",").map(Number);
      const [nextX, nextY] = nextPos.split(",").map(Number);
      const edgeId = `${x},${y}->${nextX},${nextY}`;

      if (cancelledEdges.includes(edgeId)) {
        cancelledMoves.push(move);
      }

      currentPos = nextPos;
    }

    return {
      nodes: cancelledNodes,
      edges: cancelledEdges,
      moves: cancelledMoves,
    };
  };

  // Calculate which parts of the concatenated path will be cancelled
  const calculateCancellationInfo = (
    pathA: Direction[],
    pathB: Direction[]
  ): {
    cancelledEdges: string[];
    cancelledNodes: string[];
  } => {
    const concatenated = [...pathA, ...pathB];
    const cancelledEdges: string[] = [];
    const cancelledNodes: string[] = [];

    // Build nodes and edges for the concatenated path
    let nodes = ["0,0"];
    let edges: string[] = [];

    for (let i = 0; i < concatenated.length; i++) {
      const dir = concatenated[i];
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
      const edgeId = `${x},${y}->${next[0]},${next[1]}`;

      nodes.push(nextNode);
      edges.push(edgeId);
    }

    // Now find which parts will be cancelled by applying cancellation step by step
    let currentPath = [...concatenated];
    let currentNodes = [...nodes];
    let currentEdges = [...edges];

    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;
      const newPath: Direction[] = [];
      const newNodes: string[] = ["0,0"];
      const newEdges: string[] = [];

      for (let i = 0; i < currentPath.length; i++) {
        if (i < currentPath.length - 1) {
          const current = currentPath[i];
          const next = currentPath[i + 1];

          // Check if current and next are opposite moves
          if (next === oppositeMoves[current]) {
            // These two moves will be cancelled
            // Mark the corresponding edge and node as cancelled
            if (i < currentEdges.length) {
              cancelledEdges.push(currentEdges[i]);
            }
            if (i + 1 < currentNodes.length) {
              cancelledNodes.push(currentNodes[i + 1]);
            }

            i++; // Skip the next move too
            hasChanges = true;
          } else {
            newPath.push(current);
            // Rebuild nodes and edges for the remaining path
            if (i < currentEdges.length) {
              newEdges.push(currentEdges[i]);
            }
            if (i + 1 < currentNodes.length) {
              newNodes.push(currentNodes[i + 1]);
            }
          }
        } else {
          newPath.push(currentPath[i]);
          if (i < currentEdges.length) {
            newEdges.push(currentEdges[i]);
          }
          if (i + 1 < currentNodes.length) {
            newNodes.push(currentNodes[i + 1]);
          }
        }
      }

      if (hasChanges) {
        currentPath = newPath;
        currentNodes = newNodes;
        currentEdges = newEdges;
      }
    }

    return {
      cancelledEdges: [...new Set(cancelledEdges)], // Remove duplicates
      cancelledNodes: [...new Set(cancelledNodes)],
    };
  };

  // Invert a stored path at a given index
  const invertPath = (index: number) => {
    if (!moveRecords[index]) {
      console.error(`moveRecords[${index}] is undefined or does not exist.`);
      return;
    }

    // ========== RANK3 TUTORIAL: Step 4 - Invert path 3 ==========
    if (isRank3 && tutorialActive && tutorialStep === 4) {
      if (index !== 2) {
        alert("You must double-click Path 3 (index=2) to invert it");
        return;
      }
      let currentMoves = [...moveRecords[index]];
      const invertedMoves: Direction[] = [];
      for (let i = currentMoves.length - 1; i >= 0; i--) {
        invertedMoves.push(
          oppositeMoves[currentMoves[i] as string] as Direction
        );
      }

      setMoveRecords((prev) => {
        const newRec = [...prev];
        newRec[index] = invertedMoves;
        return newRec;
      });

      const { newNodes, newEdges } = buildNodesEdges(invertedMoves as any);
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

      setTutorialStep(5);
      return;
    }
    // ========== END RANK3 TUTORIAL: Step 4 ==========

    // Rank 2 tutorial step 4 (invert)
    if (!isRank3 && tutorialActive && tutorialStep === 4) {
      if (index !== 1) {
        alert("You must double-click the SECOND path (index=1) to invert it");
        return;
      }
      let currentMoves = [...moveRecords[index]];
      const invertedMoves: Direction[] = [];
      for (let i = currentMoves.length - 1; i >= 0; i--) {
        invertedMoves.push(
          oppositeMoves[currentMoves[i] as string] as Direction
        );
      }

      setMoveRecords((prev) => {
        const newRec = [...prev];
        newRec[index] = invertedMoves;
        return newRec;
      });

      const { newNodes, newEdges } = buildNodesEdges(invertedMoves as any);
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

      const expectedInverted = ["down", "left"];
      if (JSON.stringify(invertedMoves) === JSON.stringify(expectedInverted)) {
        setTutorialStep(5);
      } else {
        alert(
          `It's inverted, but not exactly a^-1 b^-1. Let's proceed anyway.`
        );
      }
      return;
    }

    // ========== RANK3 TUTORIAL: Block invert for other tutorial steps ==========
    // For rank 3, allow invert in steps 4, 5, 6 (free play)
    // For rank 2, allow invert in steps 4, 7, 8
    const allowedInvertSteps = isRank3 ? [4, 5, 6] : [4, 7, 8];
    if (tutorialActive && !allowedInvertSteps.includes(tutorialStep)) {
      alert("you cannot invert the path right now!");
      return;
    }
    // ========== END RANK3 TUTORIAL: Invert blocking ==========
    let currentMoves = [...moveRecords[index]];
    const invertedMoves: Direction[] = [];
    for (let i = currentMoves.length - 1; i >= 0; i--) {
      invertedMoves.push(oppositeMoves[currentMoves[i] as string] as Direction);
    }

    setMoveRecords((prev) => {
      const newRec = [...prev];
      newRec[index] = invertedMoves;
      return newRec;
    });

    const { newNodes, newEdges } = buildNodesEdges(invertedMoves as any);
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
  const moveRecordsRef = useRef<Direction[][]>(
    isRank3 ? [["up"], ["right-up"], ["right-down"]] : [["up"], ["right"]]
  );
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
      let oppositeMove = oppositeMoves[currentMoves[i]] as Direction;
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
    // ========== RANK3 TUTORIAL: Step 1 - Generate 3 paths ==========
    if (tutorialActive && tutorialStep === 1) {
      const newMoveRecords: Direction[][] = isRank3
        ? [
            ["up", "right-up", "up"], // Path 1: aba
            ["right-up", "up", "right-down"], // Path 2: bac
            ["right-down"], // Path 3: c
          ]
        : [
            ["up", "right", "up"], // aba
            ["right", "up"], // ba
          ];

      setEdgePaths([]);
      setNodePaths([]);
      setMoveRecords(newMoveRecords);
      setTargetSteps(greedyNielsenStepsFunc(newMoveRecords as any));
      setUsedConcatSteps(0);
      setOperationMode("normal");
      // For rank 3, show all 3 paths initially
      setPathIndex(isRank3 ? [0, 1, 2] : [0, 1]);

      const newNodePaths: string[][] = [];
      const newEdgePaths: string[][] = [];

      newMoveRecords.forEach((pathMoves) => {
        const { newNodes, newEdges } = buildNodesEdges(pathMoves as any);
        newNodePaths.push(newNodes);
        newEdgePaths.push(newEdges);
      });

      setNodePaths(newNodePaths);
      setEdgePaths(newEdgePaths);

      setTutorialStep(2);
      return;
    }
    // ========== END RANK3 TUTORIAL: Step 1 ==========

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

    // Reset refs - start with default generators based on rank
    moveRecordsRef.current = isRank3
      ? [["up"], ["right-up"], ["right-down"]]
      : [["up"], ["right"]];
    nodePathsRef.current = [];
    edgePathsRef.current = [];
    //generate additional
    //might need debug
    if (n == 1) {
      n = 2;
    }
    if (n >= 2) {
      const defaultGenCount = isRank3 ? 3 : 2;
      let k = n - defaultGenCount;
      while (k > 0) {
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
    setTargetSteps(greedyNielsenStepsFunc(moveRecordsRef.current as any));
    setUsedConcatSteps(0);
    // Process paths and translate them into coordinates and edges
    const newNodePaths: string[][] = [];
    const newEdgePaths: string[][] = [];

    moveRecordsRef.current.forEach((move) => {
      const { newNodes, newEdges } = buildNodesEdges(move as any);
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

    // Reset refs - start with default generators based on rank
    moveRecordsRef.current = isRank3
      ? [["up"], ["right-up"], ["right-down"]]
      : [["up"], ["right"]];
    nodePathsRef.current = [];
    edgePathsRef.current = [];
    //generate additional
    //might need debug
    if (n == 1) {
      n = 2;
    }
    if (n >= 2) {
      const defaultGenCount = isRank3 ? 3 : 2;
      let k = n - defaultGenCount;
      while (k > 0) {
        moveRecordsRef.current.push([]);
        k--;
      }
    }
    //here, after everything is set, we give something to the pathlist.
    //set Move Records;
    //let's start with trying 20 things;
    //this should do it, add a button to test;
    const numDirections = isRank3 ? 6 : 4;
    const multiplier = isRank3 ? 4 : 4;
    for (let i = 0; i < multiplier * n; i++) {
      //random path index;
      let index = Math.floor(Math.random() * n);
      //random move;
      let move = Math.floor(Math.random() * numDirections);

      if (isRank3) {
        switch (move) {
          case 0:
            moveRecordsRef.current[index].push("up");
            break;
          case 1:
            moveRecordsRef.current[index].push("down");
            break;
          case 2:
            moveRecordsRef.current[index].push("right-up");
            break;
          case 3:
            moveRecordsRef.current[index].push("left-down");
            break;
          case 4:
            moveRecordsRef.current[index].push("right-down");
            break;
          case 5:
            moveRecordsRef.current[index].push("left-up");
            break;
        }
      } else {
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
      }
      const tail = moveRecordsRef.current[index].at(-1);
      const head = moveRecordsRef.current[index].at(-2);

      if (tail && head && head === (oppositeMoves as any)[tail]) {
        moveRecordsRef.current[index].pop();
        moveRecordsRef.current[index].pop();
      }
    }

    // Add a maximum iteration limit to prevent infinite loops
    let maxIterations = 1000;
    let iterations = 0;
    while (
      moveRecordsRef.current.some((path) => path.length < 2) &&
      iterations < maxIterations
    ) {
      iterations++;

      // When paths are too short, we should only concatenate (not invert)
      // because inversion doesn't change path length
      const hasShortPaths = moveRecordsRef.current.some(
        (path) => path.length < 2
      );
      const operation = hasShortPaths ? 1 : Math.random() < 0.5 ? 0 : 1;

      if (operation === 0) {
        // Inversion with weighted random choice
        weightedInversion();
      } else if (operation === 1) {
        // Concatenate as usual (could also be enhanced with weights if desired)
        let [index1, index2] = generateRandomPathPair(n);
        let attempts = 0;
        while (moveRecordsRef.current[index1].length >= 4 && attempts < 100) {
          [index1, index2] = generateRandomPathPair(n);
          attempts++;
        }

        // If we couldn't find a suitable path after 100 attempts, just use any pair
        if (attempts >= 100) {
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

    // If we hit the max iterations, ensure all paths have at least one move
    if (iterations >= maxIterations) {
      moveRecordsRef.current.forEach((path, index) => {
        if (path.length === 0) {
          // Add a random move to empty paths
          const numDirections = isRank3 ? 6 : 4;
          const move = Math.floor(Math.random() * numDirections);
          if (isRank3) {
            const moves: Direction3[] = [
              "up",
              "down",
              "right-up",
              "left-down",
              "right-down",
              "left-up",
            ];
            moveRecordsRef.current[index] = [moves[move]];
          } else {
            const moves: Direction2[] = ["up", "down", "left", "right"];
            moveRecordsRef.current[index] = [moves[move]];
          }
        }
      });
    }

    // After paths are generated, set moveRecordsRef to the state
    setMoveRecords(moveRecordsRef.current);
    setTargetSteps(greedyNielsenStepsFunc(moveRecordsRef.current as any));
    setUsedConcatSteps(0);
    // Process paths and translate them into coordinates and edges
    const newNodePaths: string[][] = [];
    const newEdgePaths: string[][] = [];

    moveRecordsRef.current.forEach((move) => {
      const { newNodes, newEdges } = buildNodesEdges(move as any);
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
      const newMoveRecords: Direction[][] = isRank3
        ? [
            ["up", "right-up", "up"], // aba
            ["right-up", "up"], // ba
          ]
        : [
            ["up", "right", "up"], // aba
            ["right", "up"], // ba
          ];

      setEdgePaths([]);
      setNodePaths([]);
      setMoveRecords(newMoveRecords);
      setTargetSteps(greedyNielsenStepsFunc(newMoveRecords as any));
      setUsedConcatSteps(0);
      setOperationMode("normal");
      setPathIndex([0, 1]);

      const newNodePaths: string[][] = [];
      const newEdgePaths: string[][] = [];

      newMoveRecords.forEach((pathMoves) => {
        const { newNodes, newEdges } = buildNodesEdges(pathMoves as any);
        newNodePaths.push(newNodes);
        newEdgePaths.push(newEdges);
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
      //if empty, generate default words based on rank
      bases = isRank3
        ? [["up"], ["right-up"], ["right-down"]]
        : [["up"], ["right"]];
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
    setTargetSteps(greedyNielsenStepsFunc(moveRecordsRef.current as any));
    setUsedConcatSteps(0);
    // Process paths and translate them into coordinates and edges
    const newNodePaths: string[][] = [];
    const newEdgePaths: string[][] = [];

    moveRecordsRef.current.forEach((move) => {
      const { newNodes, newEdges } = buildNodesEdges(move as any);
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
    //the input is a string like aba, a , a, a-, b-, a-b, a-b-aba, ... (for rank 2)
    //or aba, a, a-, b-, c-, a-b-c, etc. (for rank 3)
    //we need to translate them into directions and store them in bases;
    const newbase: Direction[] = [];
    let i = 0;
    while (i < b.length) {
      const c = b[i];
      if (i + 1 < b.length && b[i + 1] === "-") {
        if (c === "a") newbase.push(isRank3 ? "down" : "down");
        else if (c === "b") newbase.push(isRank3 ? "left-down" : "left");
        else if (c === "c" && isRank3) newbase.push("left-up");
        i += 2;
      } else {
        if (c === "a") newbase.push("up");
        else if (c === "b") newbase.push(isRank3 ? "right-up" : "right");
        else if (c === "c" && isRank3) newbase.push("right-down");
        i += 1;
      }
      //automatically cancel;
      const tail = newbase.at(-1);
      const head = newbase.at(-2);

      if (tail && head && head === (oppositeMoves as any)[tail]) {
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

    // ========== RANK3 TUTORIAL: Step 2 - Hide path ==========
    if (isRank3 && tutorialStep === 2) {
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
      return;
    }
    // ========== END RANK3 TUTORIAL: Step 2 ==========

    // ========== RANK3 TUTORIAL: Step 3 - Show path ==========
    if (isRank3 && tutorialStep === 3) {
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
      return;
    }
    // ========== END RANK3 TUTORIAL: Step 3 ==========

    // Rank 2 tutorial steps 2 and 3 (hide/show)
    if (!isRank3 && tutorialStep === 2) {
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
      return;
    }

    if (!isRank3 && tutorialStep === 3) {
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
      return;
    }

    // For other tutorial steps or non-tutorial mode
    setPathIndex((prevIndexes) =>
      prevIndexes.includes(index)
        ? prevIndexes.filter((i) => i !== index)
        : [...prevIndexes, index]
    );
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

  ///////////////// Drag preview functions ///////////////////
  const handleDragStart = (fromIndex: number) => {
    setIsDragging(true);
    setDragFromIndex(fromIndex);
    setDragHoverIndex(-1);
    setPreviewPath(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragFromIndex(-1);
    setDragHoverIndex(-1);
    setPreviewPath(null);
  };

  const handleDragHover = (toIndex: number) => {
    if (!isDragging || dragFromIndex === -1) return;

    setDragHoverIndex(toIndex);
    const preview = calculatePreviewPath(dragFromIndex, toIndex);
    setPreviewPath(preview);
  };

  const handleDragLeave = () => {
    if (isDragging) {
      setDragHoverIndex(-1);
      setPreviewPath(null);
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
          soundEnabled={soundEnabled}
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
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          hideShape={isRank3}
        />

        <ButtonBar
          bases={bases as any}
          generate={GeneratePath}
          generate_rand={GenerateRandomPath}
          setGen={setGen}
          tutorialStep={tutorialStep}
          generate_base={GenerateBasedPath}
          addbase={Addbase}
          clearbase={clearBase}
          soundEnabled={soundEnabled}
          defaultGeneratorsText={
            isRank3
              ? "No specified bases, default generators a,b,c."
              : "No specified bases, default generators a,b."
          }
          isRank3={isRank3}
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
          previewPath={previewPath}
          isDragging={isDragging}
          dragFromIndex={dragFromIndex}
          dragHoverIndex={dragHoverIndex}
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragHover={handleDragHover}
          onDragLeave={handleDragLeave}
          isDragging={isDragging}
          dragFromIndex={dragFromIndex}
          dragHoverIndex={dragHoverIndex}
        />
        {/* ========== RANK3 TUTORIAL: Pass isRank3 to CheckNielsen ========== */}
        <CheckNielsen
          movePaths={moveRecords as any}
          tutorialActive={tutorialActive}
          tutorialStep={tutorialStep}
          isRank3={isRank3}
          onTutorialCheck={(nextStep) => {
            if (nextStep === 0) {
              setTutorialCompleted(true);
              // Keep tutorial active to show completion message
            } else {
              setTutorialStep(nextStep);
            }
          }}
        />
        {/* ========== END RANK3 TUTORIAL: CheckNielsen ========== */}
        {/*        
 const [pathIndex, setPathIndex] = useState<number[]>([]); // index of paths to show on the Cayley graph;
 const [nodePaths, setNodePaths] = useState<string[][]>([]);
 const [edgePaths, setEdgePaths] = useState<string[][]>([]);
 const [moveRecords, setMoveRecords] = useState<Direction[][]>([]);
 const router = useRouter();
 


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
 const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

 // Sync soundEnabled state with soundManager
 useEffect(() => {
   setSoundEnabledGlobal(soundEnabled);
 }, [soundEnabled]);


 //Welcome screen state
 const [showWelcome, setShowWelcome] = useState(true);


 // Tutorial state
 const [tutorialStep, setTutorialStep] = useState<number>(1);
 const [tutorialActive, setTutorialActive] = useState<boolean>(false);
 const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);


 // Steps state
 const [targetSteps, setTargetSteps] = useState(0);
 const [usedConcatSteps, setUsedConcatSteps] = useState<number>(0);


 // Drag preview state
 const [isDragging, setIsDragging] = useState<boolean>(false);
 const [dragFromIndex, setDragFromIndex] = useState<number>(-1);
 const [dragHoverIndex, setDragHoverIndex] = useState<number>(-1);
 const [previewPath, setPreviewPath] = useState<{
   finalResult: {
     nodes: string[];
     edges: string[];
     moves: Direction[];
   };
   cancelledParts: {
     nodes: string[];
     edges: string[];
     moves: Direction[];
   };
 } | null>(null);


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
 // Optional: Revert operation (if you want to truly revert to previous moves)
 ////////////////////////////////////////
 function revertConcat(
   originalA: Direction[],
   originalB: Direction[],
   indexA: number,
   indexB: number
 ) {
   alert("Concat failed. Reverting to previous state!");
   // You need to restore moveRecords[indexA], moveRecords[indexB]
   // Here we demonstrate resetting moveRecords to original
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


   // Backup: for reverting on failure
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


   // ---------- If in tutorial mode but step != 5,6,7,8 => alert and cancel ----------
   else if (tutorialActive && ![5, 6, 7, 8].includes(tutorialStep)) {
     alert(` Concatenate isn't expected right now!`);
     // No update needed, just cancel the operation
     return;
   }


   // ---------- Normal concat mode (non-tutorial or tutorialStep=8) ----------
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


 // Calculate preview path for drag operation with dual preview (final result + cancelled parts)
 const calculatePreviewPath = (fromIndex: number, toIndex: number) => {
   if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
       fromIndex >= moveRecords.length || toIndex >= moveRecords.length) {
     return null;
   }


   // When dragging fromIndex to toIndex, we want to concatenate fromIndex to the end of toIndex
   // So it should be: toIndex + fromIndex (path2 + path1)
   const pathA = [...moveRecords[toIndex]];  // target path (path2)
   const pathB = [...moveRecords[fromIndex]]; // dragged path (path1)
  
   // Calculate final result after cancellation
   const finalMoves = doConcat(pathA, pathB);
   const { newNodes: finalNodes, newEdges: finalEdges } = buildNodesEdgesFromMoves(finalMoves);
  
   // Calculate cancelled parts
   const cancelledParts = calculateCancelledParts(pathA, pathB);
  
   return {
     // Final result (normal preview)
     finalResult: {
       nodes: finalNodes,
       edges: finalEdges,
       moves: finalMoves
     },
     // Cancelled parts (dimmed preview)
     cancelledParts: cancelledParts
   };
 };


 // Calculate cancelled parts that will be removed during concatenation
 const calculateCancelledParts = (pathA: Direction[], pathB: Direction[]): {
   nodes: string[];
   edges: string[];
   moves: Direction[];
 } => {
   // Calculate the end position of pathA
   let pathAEndNode = "0,0";
   for (let i = 0; i < pathA.length; i++) {
     const [x, y] = pathAEndNode.split(",").map(Number);
     let next: [number, number] = [x, y];
     switch (pathA[i]) {
       case "up":
         next = [x, y + 100.0 / 2 ** i];
         break;
       case "down":
         next = [x, y - 100.0 / 2 ** i];
         break;
       case "left":
         next = [x - 100.0 / 2 ** i, y];
         break;
       case "right":
         next = [x + 100.0 / 2 ** i, y];
         break;
     }
     pathAEndNode = `${next[0]},${next[1]}`;
   }
  
   // Now simulate the concatenation and find what gets cancelled
   const concatenated = [...pathA, ...pathB];
   const finalResult = doConcat(pathA, pathB);
  
   // Find which parts of the concatenated path are not in the final result
   // by building both paths and comparing their edges
   const { newNodes: concatNodes, newEdges: concatEdges } = buildNodesEdgesFromMoves(concatenated);
   const { newNodes: finalNodes, newEdges: finalEdges } = buildNodesEdgesFromMoves(finalResult);
  
   // Find edges that are in concatenated but not in final
   const cancelledEdges = concatEdges.filter(edge => !finalEdges.includes(edge));
  
   // Find nodes that are in concatenated but not in final (excluding the start node)
   const cancelledNodes = concatNodes.filter(node =>
     node !== "0,0" && !finalNodes.includes(node)
   );
  
   // For the moves, we need to find which moves from the concatenated path
   // correspond to the cancelled edges
   const cancelledMoves: Direction[] = [];
   let currentPos = "0,0";
  
   for (let i = 0; i < concatenated.length; i++) {
     const move = concatenated[i];
     const [x, y] = currentPos.split(",").map(Number);
     let next: [number, number] = [x, y];
    
     switch (move) {
       case "up":
         next = [x, y + 100.0 / 2 ** i];
         break;
       case "down":
         next = [x, y - 100.0 / 2 ** i];
         break;
       case "left":
         next = [x - 100.0 / 2 ** i, y];
         break;
       case "right":
         next = [x + 100.0 / 2 ** i, y];
         break;
     }
    
     const nextPos = `${next[0]},${next[1]}`;
     const edgeId = `${x},${y}->${next[0]},${next[1]}`;
    
     if (cancelledEdges.includes(edgeId)) {
       cancelledMoves.push(move);
     }
    
     currentPos = nextPos;
   }
  
   return {
     nodes: cancelledNodes,
     edges: cancelledEdges,
     moves: cancelledMoves
   };
 };


 // Calculate which parts of the concatenated path will be cancelled
 const calculateCancellationInfo = (pathA: Direction[], pathB: Direction[]): {
   cancelledEdges: string[];
   cancelledNodes: string[];
 } => {
   const concatenated = [...pathA, ...pathB];
   const cancelledEdges: string[] = [];
   const cancelledNodes: string[] = [];
  
   // Build nodes and edges for the concatenated path
   let nodes = ["0,0"];
   let edges: string[] = [];
  
   for (let i = 0; i < concatenated.length; i++) {
     const dir = concatenated[i];
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
     const edgeId = `${x},${y}->${next[0]},${next[1]}`;
    
     nodes.push(nextNode);
     edges.push(edgeId);
   }
  
   // Now find which parts will be cancelled by applying cancellation step by step
   let currentPath = [...concatenated];
   let currentNodes = [...nodes];
   let currentEdges = [...edges];
  
   let hasChanges = true;
   while (hasChanges) {
     hasChanges = false;
     const newPath: Direction[] = [];
     const newNodes: string[] = ["0,0"];
     const newEdges: string[] = [];
    
     for (let i = 0; i < currentPath.length; i++) {
       if (i < currentPath.length - 1) {
         const current = currentPath[i];
         const next = currentPath[i + 1];
        
         // Check if current and next are opposite moves
         if (next === oppositeMoves[current]) {
           // These two moves will be cancelled
           // Mark the corresponding edge and node as cancelled
           if (i < currentEdges.length) {
             cancelledEdges.push(currentEdges[i]);
           }
           if (i + 1 < currentNodes.length) {
             cancelledNodes.push(currentNodes[i + 1]);
           }
          
           i++; // Skip the next move too
           hasChanges = true;
         } else {
           newPath.push(current);
           // Rebuild nodes and edges for the remaining path
           if (i < currentEdges.length) {
             newEdges.push(currentEdges[i]);
           }
           if (i + 1 < currentNodes.length) {
             newNodes.push(currentNodes[i + 1]);
           }
         }
       } else {
         newPath.push(currentPath[i]);
         if (i < currentEdges.length) {
           newEdges.push(currentEdges[i]);
         }
         if (i + 1 < currentNodes.length) {
           newNodes.push(currentNodes[i + 1]);
         }
       }
     }
    
     if (hasChanges) {
       currentPath = newPath;
       currentNodes = newNodes;
       currentEdges = newEdges;
     }
   }
  
   return {
     cancelledEdges: [...new Set(cancelledEdges)], // Remove duplicates
     cancelledNodes: [...new Set(cancelledNodes)]
   };
 };


 // Invert a stored path at a given index
 const invertPath = (index: number) => {
   if (!moveRecords[index]) {
     console.error(`moveRecords[${index}] is undefined or does not exist.`);
     return;
   }


   if (tutorialActive && ![4, 7, 8].includes(tutorialStep)) {
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


   // Add a maximum iteration limit to prevent infinite loops
   let maxIterations = 1000;
   let iterations = 0;
   while (moveRecordsRef.current.some((path) => path.length < 2) && iterations < maxIterations) {
     iterations++;
     
     // When paths are too short, we should only concatenate (not invert)
     // because inversion doesn't change path length
     const hasShortPaths = moveRecordsRef.current.some((path) => path.length < 2);
     const operation = hasShortPaths ? 1 : (Math.random() < 0.5 ? 0 : 1);


     if (operation === 0) {
       // Inversion with weighted random choice
       weightedInversion();
     } else if (operation === 1) {
       // Concatenate as usual (could also be enhanced with weights if desired)
       let [index1, index2] = generateRandomPathPair(n);
       let attempts = 0;
       while (moveRecordsRef.current[index1].length >= 4 && attempts < 100) {
         [index1, index2] = generateRandomPathPair(n);
         attempts++;
       }
       
       // If we couldn't find a suitable path after 100 attempts, just use any pair
       if (attempts >= 100) {
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
   
   // If we hit the max iterations, ensure all paths have at least one move
   if (iterations >= maxIterations) {
     moveRecordsRef.current.forEach((path, index) => {
       if (path.length === 0) {
         // Add a random move to empty paths
         const move = Math.floor(Math.random() * 4);
         const moves: Direction2[] = ["up", "down", "left", "right"];
         moveRecordsRef.current[index] = [moves[move]];
       }
     });
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

 const removeBase = (index: number) => {
   if (index >= 0 && index < bases.length) {
     setBases((prev) => prev.filter((_, i) => i !== index));
   }
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


 ///////////////// Drag preview functions ///////////////////
 const handleDragStart = (fromIndex: number) => {
   setIsDragging(true);
   setDragFromIndex(fromIndex);
   setDragHoverIndex(-1);
   setPreviewPath(null);
 };


 const handleDragEnd = () => {
   setIsDragging(false);
   setDragFromIndex(-1);
   setDragHoverIndex(-1);
   setPreviewPath(null);
 };


 const handleDragHover = (toIndex: number) => {
   if (!isDragging || dragFromIndex === -1) return;
  
   setDragHoverIndex(toIndex);
   const preview = calculatePreviewPath(dragFromIndex, toIndex);
   setPreviewPath(preview);
 };


 const handleDragLeave = () => {
   if (isDragging) {
     setDragHoverIndex(-1);
     setPreviewPath(null);
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
         soundEnabled={soundEnabled}
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
         soundEnabled={soundEnabled}
         setSoundEnabled={setSoundEnabled}
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
         removebase={removeBase}
         soundEnabled={soundEnabled}
         isRank3={isRank3}
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
         previewPath={previewPath}
         isDragging={isDragging}
         dragFromIndex={dragFromIndex}
         dragHoverIndex={dragHoverIndex}
         onPathMouseDown={handleDragStart}
         onDragHover={handleDragHover}
         onDragEnd={handleDragEnd}
         concatenate={concatenate}
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
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
         onDragHover={handleDragHover}
         onDragLeave={handleDragLeave}
         isDragging={isDragging}
         dragFromIndex={dragFromIndex}
         dragHoverIndex={dragHoverIndex}
       />
       {/* ========== RANK3 TUTORIAL: Pass isRank3 to CheckNielsen (duplicate component) ========== */}
        <CheckNielsen
          movePaths={moveRecords}
          tutorialActive={tutorialActive}
          tutorialStep={tutorialStep}
          isRank3={isRank3}
          onTutorialCheck={(nextStep) => {
            if (nextStep === 0) {
              setTutorialCompleted(true);
              // Keep tutorial active to show completion message
            } else {
              setTutorialStep(nextStep);
            }
          }}
          soundEnabled={soundEnabled}
        />
        {/* ========== END RANK3 TUTORIAL: CheckNielsen (duplicate) ========== */}
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
        {/* ========== RANK3 TUTORIAL: Pass rank3 tutorial steps to Tutorial component ========== */}
        <Tutorial
          step={tutorialStep}
          isActive={tutorialActive}
          isCompleted={tutorialCompleted}
          onNext={() => setTutorialStep((s) => s + 1)}
          onSkip={() => {
            setTutorialActive(false);
            setTutorialStep(0);
            setTutorialCompleted(false);
          }}
          soundEnabled={soundEnabled}
          steps={isRank3 ? rank3TutorialSteps : undefined}
        />
        {/* ========== END RANK3 TUTORIAL: Tutorial component ========== */}
        <Steps optimalSteps={targetSteps} usedSteps={usedConcatSteps} />
        <button
          className={styles.homeButton}
          onClick={() => router.push("/")}
        >
          Go back to Home
        </button>
      </div>
    </>
  );
};

export default Interface;
