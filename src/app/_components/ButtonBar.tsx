"use client";
import React from "react";

type Direction = "up" | "down" | "left" | "right";

interface ButtonBarProps {
  onMove: (direction: Direction) => void;
}

const ButtonBar: React.FC<ButtonBarProps> = ({ onMove }) => {
  // onclick function
  const handleClick = (direction: Direction) => {
    // You can add additional logic here if needed
    onMove(direction);
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 10,
        display: "flex",
        gap: "8px",
      }}
    >
      {(["up", "down", "right", "left"] as Direction[]).map((dir, i) => (
        <button
          key={i}
          style={{
            width: "50px",
            height: "30px",
            fontSize: "16px",
            backgroundColor: "transparent",
            border: "2px solid",
            borderColor: "rgb(13, 255, 0)",
            color: "rgb(13, 255, 0)",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "0.3s",
          }}
          onClick={() => handleClick(dir)}
        >
          {dir === "up"
            ? "a"
            : dir === "down"
            ? "a-"
            : dir === "right"
            ? "b"
            : "b-"}
        </button>
      ))}
    </div>
  );
};

export default ButtonBar;
