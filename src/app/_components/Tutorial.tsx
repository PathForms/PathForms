"use client";

import React, { useEffect, useRef } from "react";
import styles from "./components.module.css";
import * as Tone from "tone";

interface TutorialProps {
  step: number;
  isActive: boolean;
  onNext: () => void;
  onSkip: () => void;
  soundEnabled: boolean;
}

const tutorialSteps = [
  "Click the 'Generate Paths' button to generate paths.",
  "Long press a path in the Word List to hide it.",
  "Long press again to show it back.",
  "Double-click the second path to invert it.",
  "Drag Path 2 and put it on Path 1 to concatenate Path 2 after Path 1.",
  "Again, drag Path 2 and put it on Path 1 to concatenate Path 2 after Path 1.",
  "It seems failed, why?",
  "Try using invert and concatenate to shorten the paths. Then click Check again!",
];

const Tutorial: React.FC<TutorialProps> = ({
  step,
  isActive,
  onNext,
  onSkip,
  soundEnabled,
}) => {
  // Create refs for sound synths
  const clickSynthRef = useRef<Tone.Synth | null>(null);
  const hoverSynthRef = useRef<Tone.Synth | null>(null);
  const isToneInitialized = useRef<boolean>(false);

  // Add ref for step transition sound
  const stepTransitionSynthRef = useRef<Tone.Synth | null>(null);

  // Track previous step to detect transitions
  const prevStepRef = useRef<number>(step);

  useEffect(() => {
    // Initialize Tone.js synths
    clickSynthRef.current = new Tone.Synth({
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();

    hoverSynthRef.current = new Tone.Synth({
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
      volume: -10, // Quieter than the click sound
    }).toDestination();

    // Add synth for step transition sound - different from other sounds
    stepTransitionSynthRef.current = new Tone.Synth({
      oscillator: {
        type: "sine8", // More complex oscillator type for distinct sound
      },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.1,
        release: 0.5,
      },
      volume: -5,
    }).toDestination();

    // Clean up function to dispose synths when component unmounts
    return () => {
      if (clickSynthRef.current) {
        clickSynthRef.current.dispose();
        clickSynthRef.current = null;
      }
      if (hoverSynthRef.current) {
        hoverSynthRef.current.dispose();
        hoverSynthRef.current = null;
      }
      if (stepTransitionSynthRef.current) {
        stepTransitionSynthRef.current.dispose();
        stepTransitionSynthRef.current = null;
      }
    };
  }, []);

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
  }, [step, isActive]);

  const initializeTone = async () => {
    if (!isToneInitialized.current) {
      await Tone.start();
      isToneInitialized.current = true;
    }
  };

  const playClickSound = async () => {
    if (!soundEnabled) return;
    await initializeTone();
    if (clickSynthRef.current) {
      clickSynthRef.current.triggerAttackRelease("C5", "32n");
    }
  };

  const playHoverSound = async () => {
    if (!soundEnabled) return;
    await initializeTone();
    if (hoverSynthRef.current) {
      hoverSynthRef.current.triggerAttackRelease("G4", "32n");
    }
  };

  const playStepTransitionSound = async () => {
    if (!soundEnabled) return;
    await initializeTone();
    if (stepTransitionSynthRef.current) {
      // Play a pleasant "ding" sound
      stepTransitionSynthRef.current.triggerAttackRelease("E5", "8n");
    }
  };

  const handleSkip = async () => {
    await playClickSound();
    onSkip();
  };

  if (!isActive || step < 1 || step > tutorialSteps.length) return null;

  return (
    <div className={styles.tutorialOverlay}>
      <div className={styles.tutorialBox}>
        <p style={{ color: "black", margin: 0 }}>{tutorialSteps[step - 1]}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px",
          }}
        >
          {/* Auto-controlled step progression: no Next button */}
          <button onClick={handleSkip} onMouseEnter={playHoverSound}>
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
