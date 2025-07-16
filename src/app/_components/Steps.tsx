"use client";

import React from "react";
import styles from "./components.module.css";

interface StepsProps {
  /** 最优的贪心步数 */
  optimalSteps: number;
  /** 用户当前已使用的拼接步数 */
  usedSteps: number;
}

/**
 * 右侧固定显示：
 * Try to reduce to Nielsen within {optimalSteps} steps, you’ve used {usedSteps}.
 */
const Steps: React.FC<StepsProps> = ({ optimalSteps, usedSteps }) => {
  return (
    <div className={styles.stepCounter}>
      Try to reduce to Nielsen within {optimalSteps} steps, you’ve used {usedSteps}.
    </div>
  );
};

export default Steps;
