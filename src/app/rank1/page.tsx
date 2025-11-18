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
import NumberLine, { Rank1Path } from "../_components/NumberLine";
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
import { playSuccessSound, playPoofSound, playReductionSound } from "../utils/soundManager";

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

    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const confettiCanvas = useRef<HTMLCanvasElement>(null);
    const confettiAnimationRef = useRef<number | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Explosion effect state
    const [explosionPosition, setExplosionPosition] = useState<{ x: number; y: number; color: string } | null>(null);
    const explosionCanvas = useRef<HTMLCanvasElement>(null);
    const explosionAnimationRef = useRef<number | null>(null);

    // Sparkle effect state (for path reduction)
    const [sparklePosition, setSparklePosition] = useState<{ x: number; y: number; color: string } | null>(null);
    const sparkleCanvas = useRef<HTMLCanvasElement>(null);
    const sparkleAnimationRef = useRef<number | null>(null);

    

    // State for Rank 1 paths
    const [rank1Paths, setRank1Paths] = useState<Rank1Path[]>([]);

    // State for custom path input modal
    const [showCustomPathModal, setShowCustomPathModal] = useState<boolean>(false);

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
    //Rank1Tutorial
    const [tutorialStep, setTutorialStep] = useState(0);
    const [tutorialActive, setTutorialActive] = useState(false);
    const [tutorialCompleted, setTutorialCompleted] = useState(false);

    const rank1TutorialSteps = [
        "Click the 'Generate Paths' button to create some random paths.",
        "Each path is a power of 'a'. Now, double-click any path to invert its exponent (e.g., a³ becomes a⁻³).",
        "Great! Now, drag one path onto another to add their exponents (e.g., dragging a² onto a³ makes a⁵).",
        "Try to make all paths a⁰ (the dot at the center)!"
    ];

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


    //ADD RANK1 TUTORIAL
    useEffect(() => {
        // Only check if we are on the final tutorial step and paths exist
        if (tutorialActive && tutorialStep === 4 && rank1Paths.length > 0) {
            
            // Check if ALL path exponents are 0
            const allReduced = rank1Paths.some(path => path.exponent === 0);
            
            if (allReduced) {
                // This will trigger the "Congratulations" message in Tutorial.tsx
                setTutorialCompleted(true);
            }
        }
        // Run this check every time the paths change
    }, [rank1Paths, tutorialActive, tutorialStep]);


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
    
    // EDIT RANK1 TUTORIAL
    // Generate random paths for Rank 1
    const GenerateRandomPath = (n: number) => {
        if (tutorialActive && tutorialStep !== 1) {
            alert("Please follow the current tutorial step!"); // More helpful message
            return;
        }

        // Reset paths
        setRank1Paths([]);
        setOperationMode("normal");

        // Ensure we have at least 2 paths
        if (n < 2) {
            n = 2;
        }

        // Generate n random paths with different colors
        const colors = [
            "#FF5733", // Red-Orange
            "#33FF57", // Green
            "#3357FF", // Blue
            "#FF33F5", // Pink
            "#F5FF33", // Yellow
            "#33FFF5", // Cyan
            "#FF8C33", // Orange
            "#8C33FF", // Purple
            "#33FF8C", // Mint
            "#FF3333", // Red
        ];

        const newPaths: Rank1Path[] = [];
        const exponentSet = new Set<number>();
        
        for (let i = 0; i < n; i++) {
            // Generate random exponent between -10 and 10 (excluding 0)
            let exponent;
            do {
                exponent = Math.floor(Math.random() * 21) - 10;
                console.log("Generated repeated exponent:", exponent);
            } while (exponentSet.has(exponent));
            exponentSet.add(exponent);
            if (exponent === 0) {
                exponent = 1; // Default to 1 if we get 0
            }

            // Assign color from palette (cycle through if n > colors.length)
            const color = colors[i % colors.length];

            newPaths.push({
                exponent,
                color
            });
        }

        setRank1Paths(newPaths);
    };

    // Generate custom paths from array of exponents
    const GenerateCustomPaths = (exponents: number[]) => {
        if (tutorialActive) {
            alert("You cannot generate paths right now!");
            return;
        }

        setOperationMode("normal");

        // Color palette
        const colors = [
            "#FF5733", // Red-Orange
            "#33FF57", // Green
            "#3357FF", // Blue
            "#FF33F5", // Pink
            "#F5FF33", // Yellow
            "#33FFF5", // Cyan
            "#FF8C33", // Orange
            "#8C33FF", // Purple
            "#33FF8C", // Mint
            "#FF3333", // Red
        ];

        // Get existing exponents to avoid duplicates
        const existingExponents = new Set(rank1Paths.map(p => p.exponent));
        
        // Filter out exponents that already exist and create new paths
        const newPathsToAdd: Rank1Path[] = exponents
            .filter(exp => !existingExponents.has(exp))
            .map((exponent, i) => ({
                exponent,
                color: colors[(rank1Paths.length + i) % colors.length]
            }));

        // Combine existing paths with new unique paths
        const combinedPaths = [...rank1Paths, ...newPathsToAdd];
        
        // Limit to 10 paths total
        if (combinedPaths.length > 10) {
            alert("Maximum of 10 paths can be displayed. Some paths were not added.");
            setRank1Paths(combinedPaths.slice(0, 10));
        } else {
            setRank1Paths(combinedPaths);
        }
    };

    // Dummy functions for ButtonBar compatibility
    //Rank1Tutorial
    const GeneratePath = () => {
        // Block if tutorial is active BUT NOT on step 1
        if (tutorialActive && tutorialStep !== 1) {
            alert("Please follow the current tutorial step!");
            return;
        }

        // Generate two simple paths for the tutorial
        const newPaths = [
            { exponent: 3, color: "green" },
            { exponent: -2, color: "orange" },
        ];
        setRank1Paths(newPaths);

        // If we're on step 1, advance to step 2
        if (tutorialActive && tutorialStep === 1) {
            setTutorialStep(s => s + 1);
        }
    };

    const GenerateBasedPath = (size: number, b: Direction[][]) => {
        // Not used in Rank 1
    };

    const Addbase = (input: string) => {
        // Not used in Rank 1
    };

    const clearBase = () => {
        // Clear all paths from the screen (but keep the list in ButtonBar)
        setRank1Paths([]);
    };

    const setGen = () => {
        // Not used in Rank 1
    };

    // Handle path inversion (double-click)
    //Rank1Tutorial
    const handlePathInvert = (index: number) => {
        // Block if tutorial is active BUT NOT on step 2 (invert) or 4 (free play)
        if (tutorialActive && tutorialStep !== 2 && tutorialStep !== 4) {
            alert("Please follow the current tutorial step!");
            return;
        }

        setRank1Paths(prevPaths => {
            const newPaths = [...prevPaths];
            if (newPaths[index]) {
                newPaths[index] = {
                    ...newPaths[index],
                    exponent: -newPaths[index].exponent
                };
            }
            return newPaths;
        });

        // If we are on step 2, advance to step 3
        if (tutorialActive && tutorialStep === 2) {
            setTutorialStep(s => s + 1);
        }
    };

    //Rank1Tutorial
    useEffect(() => {
        // Check for tutorial completion
        if (tutorialActive && tutorialStep === 4 && rank1Paths.length > 0) {
            // Check if AT LEAST ONE path exponent is 0
            const oneReduced = rank1Paths.some(path => path.exponent === 0);
            
            if (oneReduced) {
                setTutorialCompleted(true);
                playSuccessSound(); // Play sound
            }
        }
    }, [rank1Paths, tutorialActive, tutorialStep]);

    // Handle path concatenation (drag and drop)
    //EDIT RANK1 TUTORIAL
    const handlePathConcatenate = (draggedIndex: number, targetIndex: number) => {
        if (tutorialActive && tutorialStep !== 3 && tutorialStep !== 4) {
            alert("Please follow the current tutorial step!");
            return;
        }
        setRank1Paths(prevPaths => {
            const newPaths = [...prevPaths];
            if (newPaths[draggedIndex] && newPaths[targetIndex]) {
                const draggedExponent = newPaths[draggedIndex].exponent;
                const targetExponent = newPaths[targetIndex].exponent;
                const oldAbsSum = Math.abs(draggedExponent) + Math.abs(targetExponent);

                // Concatenate: a^m * a^n = a^(m+n)
                const newExponent = targetExponent + draggedExponent;
                newPaths[targetIndex] = {
                    ...newPaths[targetIndex],
                    exponent: newExponent
                };

                const newAbsValue = Math.abs(newExponent);

                // Check if path was shortened (reduction occurred)
                const wasShortened = newAbsValue < oldAbsSum;

                // If resulting path is zero (identity), trigger explosion effect
                if (newExponent === 0) {
                    if (soundEnabled) playPoofSound();

                    // Trigger explosion at target path position
                    setExplosionPosition({
                        x: 0, // Will be calculated based on path position
                        y: targetIndex, // Use index to determine y position
                        color: newPaths[targetIndex].color
                    });
                } else if (wasShortened) {
                    // If path was shortened but not zero, trigger sparkle effect
                    if (soundEnabled) playReductionSound();

                    // Trigger sparkle at target path position
                    setSparklePosition({
                        x: 0,
                        y: targetIndex,
                        color: newPaths[targetIndex].color
                    });
                }
            }

            // Remove paths with zero exponent completely
            const filteredPaths = newPaths.filter(path => path.exponent !== 0);

            // Check if we've reached Nielsen reduced form (only 1 non-zero path)
            const success = filteredPaths.length === 1;
            if (success) {
                setShowConfetti(true);
                if (soundEnabled) playSuccessSound();
            }
            return filteredPaths;
        });

        if (tutorialActive && tutorialStep === 3) {
            setTutorialStep(s => s + 1);
            if (soundEnabled) playSuccessSound(); // Play sound for tutorial step
        }
    };

    useEffect(() => {
        if (!showConfetti || !confettiCanvas.current) return;

        const canvas = confettiCanvas.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        interface Particle {
            x: number;
            y: number;
            size: number;
            color: string;
            speed: number;
            angle: number;
            rotation: number;
            rotationSpeed: number;
        }

        const confettiCount = 300;
        const particles: Particle[] = [];
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
                      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        

        for (let i = 0; i < confettiCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 100, // Start above screen
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let particlesActive = false;
            particles.forEach(p => {
            // If particle is still on screen, consider animation active
            if (p.y < canvas.height + 100) {
                particlesActive = true;
            }
            
            // Update particle position
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 1.5;
            p.rotation += p.rotationSpeed;
            p.angle += 0.01;
            
            // Draw particle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
            });
            
            if (particlesActive) {
            confettiAnimationRef.current = requestAnimationFrame(animate);
            } else {
            setShowConfetti(false);
            }
        };

        confettiAnimationRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            if (confettiAnimationRef.current) {
                cancelAnimationFrame(confettiAnimationRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [showConfetti]);

    // Explosion effect
    useEffect(() => {
        if (!explosionPosition || !explosionCanvas.current) return;

        const canvas = explosionCanvas.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Calculate explosion center based on path index
        const pathVerticalSpacing = 35;
        const canvasHeight = 500; // NumberLine max height
        const centerY = canvasHeight / 2;
        const pathStartY = centerY - 175;

        let yOffset;
        if (explosionPosition.y < 5) {
            yOffset = pathStartY + (explosionPosition.y * pathVerticalSpacing);
        } else {
            yOffset = centerY + ((explosionPosition.y - 4) * pathVerticalSpacing);
        }

        // Calculate x position (center of the viewport for the NumberLine)
        const centerX = window.innerWidth / 2;

        interface ExplosionParticle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            life: number;
            maxLife: number;
        }

        const particles: ExplosionParticle[] = [];
        const particleCount = 100;

        // Create particles in all directions
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = Math.random() * 8 + 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            particles.push({
                x: centerX,
                y: yOffset + 100, // Offset for the header
                vx,
                vy,
                size: Math.random() * 6 + 3,
                color: explosionPosition.color,
                life: 1,
                maxLife: Math.random() * 30 + 30
            });
        }

        let frameCount = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let particlesAlive = false;

            particles.forEach(p => {
                if (p.life > 0) {
                    particlesAlive = true;

                    // Update position
                    p.x += p.vx;
                    p.y += p.vy;

                    // Apply gravity
                    p.vy += 0.3;

                    // Slow down
                    p.vx *= 0.98;
                    p.vy *= 0.98;

                    // Decrease life
                    p.life = Math.max(0, 1 - frameCount / p.maxLife);

                    // Draw particle
                    ctx.save();
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            frameCount++;

            if (particlesAlive && frameCount < 120) {
                explosionAnimationRef.current = requestAnimationFrame(animate);
            } else {
                setExplosionPosition(null);
            }
        };

        explosionAnimationRef.current = requestAnimationFrame(animate);

        return () => {
            if (explosionAnimationRef.current) {
                cancelAnimationFrame(explosionAnimationRef.current);
            }
        };
    }, [explosionPosition]);

    // Sparkle effect for path reduction
    useEffect(() => {
        if (!sparklePosition || !sparkleCanvas.current) return;

        const canvas = sparkleCanvas.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Calculate sparkle center based on path index
        const pathVerticalSpacing = 35;
        const canvasHeight = 500; // NumberLine max height
        const centerY = canvasHeight / 2;
        const pathStartY = centerY - 175;

        let yOffset;
        if (sparklePosition.y < 5) {
            yOffset = pathStartY + (sparklePosition.y * pathVerticalSpacing);
        } else {
            yOffset = centerY + ((sparklePosition.y - 4) * pathVerticalSpacing);
        }

        const centerX = window.innerWidth / 2;

        interface SparkleParticle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            life: number;
            maxLife: number;
            alpha: number;
        }

        const particles: SparkleParticle[] = [];
        const particleCount = 30; // Fewer particles than explosion

        // Create particles in a more compact burst
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2; // Slower than explosion
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2; // Slight upward bias

            particles.push({
                x: centerX + (Math.random() - 0.5) * 40, // Start in small area
                y: yOffset + 100 + (Math.random() - 0.5) * 40,
                vx,
                vy,
                size: Math.random() * 4 + 2, // Smaller particles
                color: sparklePosition.color,
                life: 1,
                maxLife: Math.random() * 15 + 15, // Shorter life
                alpha: 1
            });
        }

        let frameCount = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let particlesAlive = false;

            particles.forEach(p => {
                if (p.life > 0) {
                    particlesAlive = true;

                    // Update position
                    p.x += p.vx;
                    p.y += p.vy;

                    // Gentle gravity
                    p.vy += 0.15;

                    // Slow down faster
                    p.vx *= 0.95;
                    p.vy *= 0.95;

                    // Decrease life
                    p.life = Math.max(0, 1 - frameCount / p.maxLife);

                    // Draw star-shaped sparkle
                    ctx.save();
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;

                    // Draw a star
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                        const radius = i % 2 === 0 ? p.size : p.size / 2;
                        const x = p.x + Math.cos(angle) * radius;
                        const y = p.y + Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();

                    // Add a glow effect
                    ctx.globalAlpha = p.life * 0.5;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();

                    ctx.restore();
                }
            });

            frameCount++;

            if (particlesAlive && frameCount < 60) { // Shorter duration than explosion
                sparkleAnimationRef.current = requestAnimationFrame(animate);
            } else {
                setSparklePosition(null);
            }
        };

        sparkleAnimationRef.current = requestAnimationFrame(animate);

        return () => {
            if (sparkleAnimationRef.current) {
                cancelAnimationFrame(sparkleAnimationRef.current);
            }
        };
    }, [sparklePosition]);


    return (
        <>
        {showWelcome && (
            <WelcomeScreen
            soundEnabled={soundEnabled}
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
        {showConfetti && (
            <canvas
                ref={confettiCanvas}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 1000,
                }}
            />
        )}
        {explosionPosition && (
            <canvas
                ref={explosionCanvas}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 999,
                }}
            />
        )}
        {sparklePosition && (
            <canvas
                ref={sparkleCanvas}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 998,
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
            soundEnabled={soundEnabled} 
            setSoundEnabled={setSoundEnabled}
            hideEdgeThickness={true}
            hideShape={true}
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
            generate_custom={GenerateCustomPaths}
            soundEnabled={true}
            />

            <NumberLine
            theme={theme}
            currentPosition={0}
            paths={rank1Paths}
            onPathInvert={handlePathInvert}
            onPathConcatenate={handlePathConcatenate}
            />

            <Tutorial
                step={tutorialStep}
                isActive={tutorialActive}
                isCompleted={tutorialCompleted}
                onNext={() => setTutorialStep(s => s + 1)} 
                onSkip={() => {
                    setTutorialActive(false);
                    setTutorialStep(0);
                }}
                steps={rank1TutorialSteps}
                soundEnabled={soundEnabled}
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
            Go back to Home
            </button>
        
            {/* <Steps optimalSteps={targetSteps} usedSteps={usedConcatSteps} /> */}

            <Tutorial
                step={tutorialStep}
                isActive={tutorialActive}
                isCompleted={tutorialCompleted}
                onNext={() => setTutorialStep(s => s + 1)} 
                onSkip={() => {
                    setTutorialActive(false);
                    setTutorialStep(0);
                }}
                steps={rank1TutorialSteps} // <-- PASS THE NEW STEPS
            />
        </div>
        </>
    );
    };

export default Rank1;
