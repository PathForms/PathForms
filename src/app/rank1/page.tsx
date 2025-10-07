// export default function Rank1() {
//     return (
//         <div className="flex items-center justify-center h-screen bg-white">
//             <h1 className="text-4xl font-bold">Rank 1</h1>
//         </div>
//     );
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ButtonBar from "../_components/ButtonBar";
import NumberLine from "../_components/NumberLine";
import Pathbar from "../_components/Pathbar";
import Headbar from "../_components/Headbar";
import Pathlist from "../_components/Pathlist";
import Pathterminal from "../_components/Pathterminal";
import styles from "../_components/components.module.css";
import CheckNielsen from "../_components/CheckNielsen";
import Tutorial from "../_components/Tutorial";
import WelcomeScreen from "../_components/WelcomeScreen";
import buildNodesEdgesFromMoves from "../utils/buildNodesEdgesFromMoves";
import next from "next";
import Steps from "../_components/Steps";
import { greedyNielsenSteps } from "../utils/greedyNielsen";

type Direction = "up" | "down" | "left" | "right";

// Define opposite moves for backtracking
const oppositeMoves: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
};

const Rank1 = () => {
    const router = useRouter();
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


    // Settings state: edge thickness, vertex size, theme and settings panel visibility
    const [edgeThickness, setEdgeThickness] = useState<number>(0.7);
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [showSettings, setShowSettings] = useState<boolean>(false);

    //Welcome screen state
    const [showWelcome, setShowWelcome] = useState(true);

    // Tutorial state
    const [tutorialStep, setTutorialStep] = useState<number>(1);
    const [tutorialActive, setTutorialActive] = useState<boolean>(false);
    const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);

    // Steps state
    const [targetSteps, setTargetSteps] = useState(0);
    const [usedConcatSteps, setUsedConcatSteps] = useState<number>(0);


    ////////////// GeneratePath for Game //////////////////////
    const moveRecordsRef = useRef<Direction[][]>([["up"], ["right"]]);
    const nodePathsRef = useRef<string[][]>([]);
    const edgePathsRef = useRef<string[][]>([]);

    

    const toggleSettings = () => {
        setShowSettings((prev) => !prev);
    };


    // Handle theme change
    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTheme = e.target.value as "dark" | "light";
        setTheme(selectedTheme);
    };

    // Handle edge thickness change
    const handleEdgeThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEdgeThickness(Number(e.target.value));
    };

    // Handle shape change (kept as function with no params to match Headbar interface)
    const handleshape = () => {
        // This function signature matches Headbar's expectation
        // Shape changes are handled via the select element directly
    };

  //
  //
  //
  //
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

            <NumberLine
            theme={theme}
            currentPosition={0}
            />

            <button
            className={styles.button}
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 100,
                padding: "12px 28px",
                fontSize: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
            onClick={() => router.push("/")}
            >
            Go to Rank 2
            </button>
        
            <Steps optimalSteps={targetSteps} usedSteps={usedConcatSteps} />
        </div>
        </>
    );
    };

export default Rank1;
