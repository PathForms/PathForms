"use client";

import React, { useEffect, useRef, useCallback } from "react";
import styles from "./components.module.css";
import {
  initializeSynths,
  playClickSound,
  playHoverSound,
  setSoundEnabled,
  cleanupSynths,
} from "../utils/soundManager";

interface WelcomeScreenProps {
  onStartTutorial: () => void;
  onSkipTutorial: () => void;
  soundEnabled: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartTutorial,
  onSkipTutorial,
  soundEnabled,
}) => {
  const lastHoverTime = useRef<number>(0);

  useEffect(() => {
    // Initialize synths and set sound enabled state based on prop
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

  const playHoverSoundWithThrottle = useCallback(async () => {
    const now = Date.now();
    // Only play hover sound if at least 100ms has passed since last hover
    if (now - lastHoverTime.current < 100) {
      return;
    }
    lastHoverTime.current = now;

    await playHoverSound();
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
          <button onClick={handleStartTutorial} onMouseEnter={playHoverSoundWithThrottle}>
            First time? Start Tutorial
          </button>
          <button onClick={handleSkipTutorial} onMouseEnter={playHoverSoundWithThrottle}>
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
