"use client";

import React from "react";
import styles from "./components.module.css";

interface StepsProps {
  /** Optimal greedy step count */
  optimalSteps: number;
  /** Number of concatenation steps currently used by the user */
  usedSteps: number;
}

/**
 * Fixed display on the right side:
 * Try to reduce to Nielsen within {optimalSteps} steps, you've used {usedSteps}.
 */
const Steps: React.FC<StepsProps> = ({ optimalSteps, usedSteps }) => {
  return (
    <div className={styles.stepCounter}>
      Try to reduce to Nielsen within {optimalSteps} steps, you’ve used {usedSteps}.
    </div>
  );
};

export default Steps;
