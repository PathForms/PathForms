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
  onRedo?: () => void;
  soundEnabled: boolean;
  steps?: string[]; //Rank1Tutorial
}

const defaultTutorialSteps = [ //Rank1Tutorial
  "Click the 'Generate Rand' button to generate paths.",
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
  onRedo,
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

  const handleRedo = async () => {
    await playClickSound();
    if (onRedo) onRedo();
  };

  if (!isActive || step < 1 || step > tutorialSteps.length) return null;

  // Check if we're on the final step (step 5 for rank1)
  const isFinalStep = step === tutorialSteps.length;

  return (
    <div className={styles.tutorialOverlay}>
      <div className={styles.tutorialBox} style={isFinalStep ? { maxWidth: "800px", maxHeight: "80vh", overflowY: "auto" } : {}}>
        <p style={{ color: "black", margin: 0, lineHeight: "1.6" }}>{tutorialSteps[step - 1]}</p>
        <div
          style={{
            display: "flex",
            justifyContent: isFinalStep ? "space-between" : "flex-end",
            marginTop: "15px",
            gap: "10px",
          }}
        >
          {isFinalStep && onRedo && (
            <button 
              onClick={handleRedo}
              onMouseEnter={playHoverSound}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              Redo Tutorial
            </button>
          )}
          <button 
            onClick={handleSkip}
            onMouseEnter={playHoverSound}
            style={isFinalStep ? {
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
            } : {}}
          >
            {isFinalStep ? "Start Playing!" : "Skip Tutorial"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
