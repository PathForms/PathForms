"use client";

import React, { useEffect, useRef } from "react";
import styles from "./components.module.css";
import {
  initializeSynths,
  playClickSound,
  playHoverSound,
  playStepTransitionSound,
  setSoundEnabled,
  cleanupSynths,
} from "../utils/soundManager";

interface TutorialProps {
  step: number;
  isActive: boolean;
  isCompleted?: boolean;
  onNext: () => void;
  onSkip: () => void;
  soundEnabled: boolean;
  steps?: string[]; //Rank1Tutorial
}

const defaultTutorialSteps = [ //Rank1Tutorial
  "Click the 'Generate Paths' button to generate paths.",
  "Long press a path in the word list to hide it.",
  "Long press again to show it back.",
  "Double-click the second path to invert it.",
  "Drag Path 2 and put it on Path 1 to concatenate Path 2 after Path 1.",
  "Again, drag Path 2 and put it on Path 1 to concatenate Path 2 after Path 1.",
  "The paths are still too long. Try using invert and concatenate operations to shorten them.",
];

const Tutorial: React.FC<TutorialProps> = ({
  step,
  isActive,
  isCompleted = false,
  onNext,
  onSkip,
  soundEnabled,
  steps,//Rank1Tutorial 
}) => {
  // Track previous step to detect transitions
  const prevStepRef = useRef<number>(step);

  const tutorialSteps = steps || defaultTutorialSteps;

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

  // Effect to play sound when step changes
  useEffect(() => {
    if (
      isActive &&
      step !== prevStepRef.current &&
      step > 0 &&
      step <= tutorialSteps.length
    ) {
      playStepTransitionSound();
      prevStepRef.current = step;
    }
  }, [step, isActive, tutorialSteps]);

  const handleSkip = async () => {
    await playClickSound();
    onSkip();
  };

  if (!isActive || step < 1 || step > tutorialSteps.length) return null;

  return (
    <div className={styles.tutorialOverlay}>
      <div className={styles.tutorialBox}>
        {isCompleted ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "#4CAF50", margin: "0 0 10px 0", fontSize: "24px" }}>
              🎉 Congratulations! 🎉
            </h2>
            <p style={{ color: "black", margin: "0 0 10px 0", fontSize: "16px" }}>
              You have successfully completed the tutorial and reduced the paths to satisfy Nielsen conditions!
            </p>
          </div>
        ) : (
          <p style={{ color: "black", margin: 0 }}>{tutorialSteps[step - 1]}</p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px",
          }}
        >
          {/* Auto-controlled step progression: no Next button */}
          <button 
            onClick={handleSkip}
            onMouseEnter={playHoverSound}
          >
            {isCompleted ? "Exit Tutorial" : "Skip Tutorial"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
