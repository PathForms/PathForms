"use client";

import React from "react";
import styles from "./components.module.css";

interface WelcomeScreenProps {
  onStartTutorial: () => void;
  onSkipTutorial: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartTutorial, onSkipTutorial }) => {
  return (
    <div className={styles.welcomeOverlay}>
      <div className={styles.welcomeBox}>
        <h2>Welcome to PathForms!</h2>
        <p>
          This game aims to visualize Nielsen transformations in combinatorial group theory.
          The game provides a list of words from a free group with generators <strong>a</strong> and <strong>b</strong> (the Word List).
          You are expected to perform Nielsen transformations to bring this list of words to Nielsen reduced form.
        </p>
        <div className={styles.buttonRow}>
          <button onClick={onStartTutorial}>First time? Start Tutorial</button>
          <button onClick={onSkipTutorial}>Skip Tutorial</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
