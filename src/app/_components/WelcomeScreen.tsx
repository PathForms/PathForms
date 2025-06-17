"use client";

import React, { useEffect, useRef, useCallback } from "react";
import styles from "./components.module.css";
import * as Tone from "tone";

interface WelcomeScreenProps {
  onStartTutorial: () => void;
  onSkipTutorial: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartTutorial,
  onSkipTutorial,
}) => {
  // Create refs to store synth instances
  const clickSynthRef = useRef<Tone.Synth | null>(null);
  const hoverSynthRef = useRef<Tone.Synth | null>(null);
  const isToneInitialized = useRef<boolean>(false);
  const lastHoverTime = useRef<number>(0);

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
    };
  }, []);

  const initializeTone = async () => {
    if (!isToneInitialized.current) {
      await Tone.start();
      isToneInitialized.current = true;
    }
  };

  const playClickSound = async () => {
    await initializeTone();
    if (clickSynthRef.current) {
      clickSynthRef.current.triggerAttackRelease("C5", "32n");
    }
  };

  const playHoverSound = useCallback(async () => {
    const now = Date.now();
    // Only play hover sound if at least 100ms has passed since last hover
    if (now - lastHoverTime.current < 100) {
      return;
    }
    lastHoverTime.current = now;

    await initializeTone();
    if (hoverSynthRef.current) {
      // Add a small delay to ensure proper timing
      await Tone.Transport.scheduleOnce((time) => {
        hoverSynthRef.current?.triggerAttackRelease("G4", "32n", time);
      }, Tone.now() + 0.01);
    }
  }, []);

  const handleStartTutorial = async () => {
    await playClickSound();
    onStartTutorial();
  };

  const handleSkipTutorial = async () => {
    await playClickSound();
    onSkipTutorial();
  };

  return (
    <div className={styles.welcomeOverlay}>
      <div className={styles.welcomeBox}>
        <h2>TRY TO SHORTEN THE PATHS</h2>
        <p>using Nielsen transformations from combinatorial group theory.</p>
        <div className={styles.buttonRow}>
          <button onClick={handleStartTutorial} onMouseEnter={playHoverSound}>
            First time? Start Tutorial
          </button>
          <button onClick={handleSkipTutorial} onMouseEnter={playHoverSound}>
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
