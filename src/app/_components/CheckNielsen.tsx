"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Direction,
  Direction3,
  reduceMoves,
  concatenate,
  invert,
} from "../utils/NielsenTrans";
// ========== RANK3 TUTORIAL: reduceMoves is already imported ==========
import {
  initializeSynths,
  setSoundEnabled,
  cleanupSynths,
  getSoundEnabled,
  playSuccessSound,
  playFailSound,
  playPoofSound,
} from "../utils/soundManager";

type MoveDirection = Direction | Direction3;
type MovePath = MoveDirection[];

interface CheckNielsenProps {
  movePaths: MovePath[];
  tutorialActive?: boolean;
  tutorialStep?: number;
  onTutorialCheck?: (step: number) => void;
  soundEnabled?: boolean;
  isRank3?: boolean; // ========== RANK3 TUTORIAL: Add isRank3 prop ==========
  theme?: "dark" | "light"; // Add theme prop
}

const CheckNielsen: React.FC<CheckNielsenProps> = ({
  movePaths,
  tutorialActive = false,
  tutorialStep = 0,
  onTutorialCheck = () => {},
  soundEnabled = true,
  isRank3 = false, // ========== RANK3 TUTORIAL: Add isRank3 prop ==========
  theme = "dark", // Default to dark theme
}) => {
  // Define success color based on theme
  const successColor = theme === "light" ? "#0891b2" : "limegreen";
  const [nStatus, setNStatus] = useState<boolean[]>([false, false, false]);
  const [result, setResult] = useState<string>("");
  const [emptyCnt, setEmptyCnt] = useState<number>(0);
  const [totalLen, setTotalLen] = useState<number>(0);
  const [isSoundInitialized, setSoundInitialized] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const previousPathsRef = useRef<MovePath[]>([]);
  const confettiCanvas = useRef<HTMLCanvasElement>(null);
  const confettiAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    setEmptyCnt(movePaths.filter((path) => path.length === 0).length);
    setTotalLen(movePaths.reduce((acc, path) => acc + path.length, 0));
    const status = checkNielsenReduced(movePaths);
    setNStatus(status);

    if (movePaths.length > 0 && status.every((x) => x) && !showConfetti) {
      if (soundEnabled) {
        playSuccessSound();
      }
      setShowConfetti(true);
    }

    // ========== RANK3 TUTORIAL: Auto-check for tutorial completion ==========
    // For rank 3, check completion at step 6 (free play)
    // For rank 2, check completion at steps 7 or 8
    const shouldCheckCompletion = isRank3
      ? tutorialStep === 6
      : tutorialStep === 7 || tutorialStep === 8;

    if (tutorialActive && shouldCheckCompletion) {
      const isSuccess = status.every((cond) => cond === true);
      // ========== RANK3 TUTORIAL: Debug log for completion check ==========
      // Debug: log status for rank3
      if (isRank3) {
        const reducedPaths = movePaths.map((p) =>
          reduceMoves(p as MoveDirection[])
        );
        console.log("RANK3 Tutorial Step 6 - Check completion:", {
          status,
          isSuccess,
          N0: status[0],
          N1: status[1],
          N2: status[2],
          movePaths: movePaths.map((p) => p.join(",")),
          reducedPaths: reducedPaths.map((p) => p.join(",")),
          pathLengths: reducedPaths.map((p) => p.length),
          tutorialStep,
        });
      }
      // ========== END RANK3 TUTORIAL: Debug log ==========
      if (isSuccess && onTutorialCheck) {
        playSuccessSound();
        setShowConfetti(true);
        onTutorialCheck(0); // Tutorial completed
      }
    }
    // ========== END RANK3 TUTORIAL: Completion check ==========
  }, [
    movePaths,
    tutorialActive,
    tutorialStep,
    onTutorialCheck,
    soundEnabled,
    isRank3,
  ]);

  useEffect(() => {
    // Initialize synths and set sound enabled state
    const initSound = async () => {
      await initializeSynths();
      setSoundEnabled(soundEnabled);
    };
    initSound();

    // Clean up function to dispose synths when component unmounts
    return () => {
      cleanupSynths();
    };
  }, [soundEnabled]);

  // Watch for paths that disappear (become 1)
  useEffect(() => {
    // Skip if it's the first render
    if (previousPathsRef.current.length === 0) {
      previousPathsRef.current = [...movePaths];
      return;
    }

    // Check if any path disappeared
    const prevPaths = previousPathsRef.current.map((path) => [...path]);
    const currentPaths = movePaths.map((path) => [...path]);

    // Detect paths that were reduced to empty (became 1)
    prevPaths.forEach((prevPath, index) => {
      // If there was a path before that now is empty
      if (
        prevPath.length > 0 &&
        (index >= currentPaths.length || currentPaths[index].length === 0) &&
        soundEnabled
      ) {
        playPoofSound();
      }
    });

    // Update ref for next comparison
    previousPathsRef.current = [...movePaths];
  }, [movePaths, soundEnabled]);

  // Confetti animation setup and cleanup
  useEffect(() => {
    if (showConfetti && confettiCanvas.current) {
      const canvas = confettiCanvas.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Set canvas to full screen
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Create confetti particles
      const confettiCount = 300;
      const particles: Particle[] = [];

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

      const colors = [
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4CAF50",
        "#8BC34A",
        "#CDDC39",
        "#FFEB3B",
        "#FFC107",
        "#FF9800",
        "#FF5722",
      ];

      // Initialize particles
      for (let i = 0; i < confettiCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 100, // Start above screen
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 2,
          angle: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        });
      }

      // Animation function
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let particlesActive = false;

        particles.forEach((p) => {
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

      // Start animation
      confettiAnimationRef.current = requestAnimationFrame(animate);

      // Add resize handler
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        if (confettiAnimationRef.current) {
          cancelAnimationFrame(confettiAnimationRef.current);
        }
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [showConfetti]);

  // Sound functions are now imported from soundManager

  function checkNielsenReduced(paths: MovePath[]): boolean[] {
    const reducePath = (path: MovePath): MovePath =>
      reduceMoves(path as MoveDirection[]) as MovePath;

    const concatenatePaths = (pathA: MovePath, pathB: MovePath): MovePath =>
      concatenate(
        pathA as MoveDirection[],
        pathB as MoveDirection[]
      ) as MovePath;

    const invertPath = (path: MovePath): MovePath =>
      invert(path as MoveDirection[]) as MovePath;

    const reducedPaths = paths.map((p) => reducePath(p));
    const result: boolean[] = [true, true, true];

    if (reducedPaths.some((path) => path.length === 0)) {
      result[0] = false;
    }

    const variants = reducedPaths.map((path) => {
      const inverted = invertPath(path);
      return [path, inverted] as MovePath[];
    });

    if (result[1]) {
      outerN1: for (let i = 0; i < reducedPaths.length; i++) {
        for (let j = 0; j < reducedPaths.length; j++) {
          if (i === j) continue;
          for (const v1 of variants[i]) {
            const lenV1 = v1.length;
            for (const v2 of variants[j]) {
              const lenV2 = v2.length;
              const product = concatenatePaths(v1, v2);
              if (product.length === 0) continue;
              if (product.length < lenV1 || product.length < lenV2) {
                result[1] = false;
                break outerN1;
              }
            }
          }
        }
      }
    }

    if (result[2]) {
      outerN2: for (let i = 0; i < reducedPaths.length; i++) {
        for (let j = 0; j < reducedPaths.length; j++) {
          if (i === j) continue;
          for (let k = 0; k < reducedPaths.length; k++) {
            if (k === i || k === j) continue;
            for (const v1 of variants[i]) {
              const lenV1 = v1.length;
              for (const v2 of variants[j]) {
                const lenV2 = v2.length;
                const v1v2 = concatenatePaths(v1, v2);
                if (v1v2.length === 0) continue;
                for (const v3 of variants[k]) {
                  const lenV3 = v3.length;
                  const v2v3 = concatenatePaths(v2, v3);
                  if (v2v3.length === 0) continue;
                  const v1v2v3 = concatenatePaths(v1v2, v3);
                  if (v1v2v3.length <= lenV1 - lenV2 + lenV3) {
                    result[2] = false;
                    break outerN2;
                  }
                }
              }
            }
          }
        }
      }
    }

    return result;
  }

  const handleCheck = async () => {
    await check();
    if (tutorialStep === 7 && onTutorialCheck) {
      onTutorialCheck(8);
    }

    if (tutorialStep === 8 && onTutorialCheck) {
      const reducedConditionStatus = checkNielsenReduced(movePaths);
      const isSuccess = reducedConditionStatus.every((cond) => cond === true);
      if (isSuccess) {
        if (soundEnabled) {
          await playSuccessSound();
        }
        setShowConfetti(true);
        alert("🎉 Congrats! You have successfully reduced the paths!");
        onTutorialCheck(0);
      } else {
        if (soundEnabled) {
          await playFailSound();
        }
      }
      return;
    }
  };

  async function check() {
    const reducedConditionStatus = checkNielsenReduced(movePaths);
    const isSuccess = reducedConditionStatus.every(
      (condition) => condition === true
    );

    if (isSuccess) {
      setResult("Success: The word list satisfies Nielsen Reduced Form!");
      if (soundEnabled) {
        await playSuccessSound();
      }
      setShowConfetti(true);
    } else {
      let resultstatements = "Failure: ";
      if (reducedConditionStatus[0] === false) {
        resultstatements += " The word list does not satisfy N0. ";
      }
      if (reducedConditionStatus[1] === false) {
        resultstatements +=
          " The word list does not satisfy Nielsen condition N1. The words can be further shortened. ";
      }
      if (reducedConditionStatus[2] === false) {
        resultstatements += " The word list does not satisfy N2.";
      }
      setResult(resultstatements);
      if (soundEnabled) {
        await playFailSound();
      }
    }
  }

  return (
    <>
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
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "90%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "8px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          fontSize: "1.2rem",
        }}
      >
        {/* N0: Number of empty paths & color */}
        <div
          className="tip-row"
          title="Condition (N0) is : All paths must be non-empty."
          style={{
            color: nStatus[0] ? successColor : "red",
          }}
        >
          Nelisen-reduced conditions
          (N0)&nbsp;number&nbsp;of&nbsp;empty&nbsp;paths:&nbsp;{emptyCnt}
        </div>

        {/* N1: Total length & color */}
        <div
          className="tip-row"
          title="Condition (N1) is : For any two distinct paths u and v, the concatenations uv, u v⁻¹, u⁻¹v must not be shorter than either u or v."
          style={{ color: nStatus[1] ? successColor : "red" }}
        >
          (N1)&nbsp;{nStatus[1] ? "satisfied" : "not satisfied"}
          ;total&nbsp;path&nbsp;length:&nbsp;{totalLen}
        </div>

        {/* N2: Displayed on a separate line */}
        <div
          className="tip-row"
          title="Condition (N2) is : For any three pairwise distinct paths u, v, w, every concatenation of the form u± v± w± must not be shorter than u."
          style={{ color: nStatus[2] ? successColor : "red" }}
        >
          (N2)&nbsp;{nStatus[2] ? "satisfied" : "not satisfied"}
        </div>
      </div>
    </>
  );
};

export default CheckNielsen;
