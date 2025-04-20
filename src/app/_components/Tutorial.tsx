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
  "Long press a path in the Word List to hide it.",
  "Long press again to show it back.",
  "Double-click the second path to invert it.",
  "Click path 1, then path 2 to concatenate them.",
  "Click path 1, then path 2 again to concatenate.",
  "Click the Check button. Did it fail?",
  "Try using invert and concatenate to shorten the paths. Then click Check again!",
];

const Tutorial: React.FC<TutorialProps> = ({
  step,
  isActive,
  onNext,
  onSkip,
}) => {
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
          <button onClick={onSkip}>Skip Tutorial</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
