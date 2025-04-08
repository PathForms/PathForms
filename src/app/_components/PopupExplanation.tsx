"use client";
import React, { useEffect, useState } from "react";

/** 
 * 你可以把下面这两个操作类型和说明改成自己的需求 
 */
type ActionType = "invert" | "concatenate";

const EXPLANATIONS: Record<ActionType, string> = {
  invert: "Inverting a word means reversing its order and also inverting each generator.",
  concatenate: "Concatenating merges two words into one, possibly reducing length if they cancel."
};

interface PopupExplanationProps {
  /** 是否要显示弹窗？ */
  show: boolean;
  /** 当前操作类型，用于选定显示文本 */
  actionType: ActionType | "";
  /** 停留时长（毫秒），默认 3000 */
  duration?: number;
  /** 弹窗淡出动画时长（毫秒），默认 500 */
  fadeDuration?: number;
  /** 弹窗关闭时的回调函数 */
  onClose?: () => void;
}

/**
 * PopupExplanation 带渐隐动画：
 * - 当 show=true, actionType!= "" 时显示
 * - 等到 duration 结束后 -> 开始淡出
 * - 等到淡出动画完 -> 不再渲染(visible=false) & onClose
 */
const PopupExplanation: React.FC<PopupExplanationProps> = ({
  show,
  actionType,
  duration = 3000,
  fadeDuration = 500,
  onClose
}) => {
  // 是否在 DOM 中渲染
  const [visible, setVisible] = useState<boolean>(false);
  // 透明度(0~1) 用于做渐隐渐显动画
  const [opacity, setOpacity] = useState<number>(0);

  useEffect(() => {
    if (show && actionType) {
      // 进入可见状态
      setVisible(true);
      setOpacity(1); // 先让它立刻变为不透明
      // 过了 duration 后开始淡出
      const fadeOutTimer = setTimeout(() => {
        setOpacity(0); // 触发CSS transition动画
      }, duration);

      // 再等 fadeDuration 后彻底移除
      const removeTimer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration + fadeDuration);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    } else {
      // show = false 或 actionType = "" -> 直接隐藏
      setVisible(false);
      setOpacity(0);
    }
  }, [show, actionType, duration, fadeDuration, onClose]);

  if (!visible || !actionType) {
    return null;
  }

  const explanationText = EXPLANATIONS[actionType] || "";

  return (
    <div
      style={{
        position: "fixed",
        top: "250px",
        right: "20px",
        maxWidth: "300px",
        backgroundColor: "#fff",
        color: "#000",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(74, 255, 58, 0.3)",
        fontSize: "14px",
        lineHeight: "1.4",
        zIndex: 9999,
        // transition + opacity
        opacity: opacity,
        transition: `opacity ${fadeDuration}ms ease-in-out`
      }}
    >
      <strong style={{ textTransform: "capitalize" }}>{actionType}:</strong>
      <p style={{ margin: "4px 0 0" }}>{explanationText}</p>
    </div>
  );
};

export default PopupExplanation;
