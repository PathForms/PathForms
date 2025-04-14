"use client";

import React from "react";
import styles from "./components.module.css";

interface TutorialProps {
  step: number;
  isActive: boolean;
  onNext: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  "Click the 'Generate Words' button to generate paths.",
  "Click a path in the Word List to show/hide it on the graph.",
  "Double-click a path to invert it.",
  "Click two different paths to concatenate them.",
  "🎉 Tutorial complete! You're now ready to explore freely!",
];

const Tutorial: React.FC<TutorialProps> = ({ step, isActive, onNext, onSkip }) => {
  if (!isActive || step < 1 || step > tutorialSteps.length) return null;

  return (
    <div className={styles.tutorialOverlay}>
      <div className={styles.tutorialBox}>
        <p>{tutorialSteps[step - 1]}</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={onNext}>Next</button>
          <button onClick={onSkip}>Skip Tutorial</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
