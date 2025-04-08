"use client";
import React, { useEffect, useState } from "react";

/**
 * 这行是关键：如果你想在开发/测试阶段每次打开都显示教程，就把它设为 true，
 * 上线正式环境再改回 false。
 */
const ALWAYS_SHOW_TUTORIAL = true;

/**
 * 每个步骤要高亮的元素及提示
 */
interface StepConfig {
  title: string;
  description: string;
  targetId: string;
}

const steps: StepConfig[] = [
  {
    title: "",
    description: "This is a game designed to help you better understand the Nielsen transformation. In this game, you will generate several words and try to reduce the length of the words by using inverse and Concatenate operations.！",
    targetId: "",
  },
  {
    title: "Generate Words",
    description: "You can enter the number of words you want to generate in the input box, and then click 'Generate Words' to generate the words.",
    targetId: "generateWordsBtn",
  },
  {
    title: "Invert mode",
    description: "Click here to enter the invert mode. You can reverse the words in the word list by clicking.  You can also choose to inverse the word directly by double-clicking on it.For example, if you click on 'ab', it will be reversed to 'b-a-'！",
    targetId: "invertBtn",
  },
  {
    title: "Concatenate mode",
    description: "You can merge two words by clicking this button.",
    targetId: "concatBtn",
  },
  {
    title: "check",
    description: "You can determine by checking whether the length you have simplified meets the standard of the Nielsen transformation.",
    targetId: "checkBtn",
  },
  {
    title: "information",
    description: "You can check the tutorial again here.",
    targetId: "infoBtn",
  },
];

const TutorialPage: React.FC = () => {
  /**
   * showTutorial:
   *   - null => 尚未决定要不要显示（用来避免闪烁）
   *   - true => 显示
   *   - false => 不显示
   */
  const [showTutorial, setShowTutorial] = useState<boolean | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  /** 
   * 第一次挂载时：
   * 1. 如果 ALWAYS_SHOW_TUTORIAL === true，则直接 setShowTutorial(true)。
   * 2. 否则走 localStorage 判断。
   */
  useEffect(() => {
    if (ALWAYS_SHOW_TUTORIAL) {
      // 测试模式：每次都显示
      setShowTutorial(true);
      return;
    }
    // 否则，看 localStorage
    const visited = localStorage.getItem("tutorialShown");
    if (visited === "true") {
      setShowTutorial(false);
    } else {
      setShowTutorial(true);
    }
  }, []);

  /**
   * 当 showTutorial === true 并且 currentStep 改变时：
   *  - 如果 currentStep >= steps.length => 教程结束
   *  - 否则高亮相应 targetId 的元素
   */
  useEffect(() => {
    if (showTutorial !== true) return; // null 或 false 时不处理
    if (currentStep >= steps.length) {
      localStorage.setItem("tutorialShown", "true");
      setShowTutorial(false);
      return;
    }

    const { targetId } = steps[currentStep];
    const targetElem = document.getElementById(targetId);
    if (!targetElem) {
      setHighlightRect(null);
      return;
    }
    const rect = targetElem.getBoundingClientRect();
    setHighlightRect(rect);

    const handleClick = () => setCurrentStep((prev) => prev + 1);
    targetElem.addEventListener("click", handleClick);

    return () => {
      targetElem.removeEventListener("click", handleClick);
    };
  }, [showTutorial, currentStep]);

  if (showTutorial === null) {
    return null; // 还没决定好
  }
  if (!showTutorial) {
    return null; // 确定不显示
  }

  // 当前教程的标题、描述
  const { title, description } = steps[currentStep];
  let highlightStyle: React.CSSProperties | undefined;
  if (highlightRect) {
    highlightStyle = {
      position: "absolute",
      top: highlightRect.top + window.scrollY - 5,
      left: highlightRect.left + window.scrollX - 5,
      width: highlightRect.width + 10,
      height: highlightRect.height + 10,
      border: "2px solid gold",
      borderRadius: "4px",
      pointerEvents: "none",
      zIndex: 9999,
    };
  }

  return (
    <>
      {/* 蒙层 */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 9990,
        }}
      />
      {/* 高亮框 */}
      {highlightRect && <div style={highlightStyle} />}
      {/* 教程弹窗 */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "280px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 9999,
          color: "#000" 
        }}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ fontSize: "14px" }}>{description}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={() => {
              localStorage.setItem("tutorialShown", "true");
              setShowTutorial(false);
            }}
            style={{
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            skip
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{
                background: "green",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              next
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.setItem("tutorialShown", "true");
                setShowTutorial(false);
              }}
              style={{
                background: "blue",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              finish
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorialPage;
