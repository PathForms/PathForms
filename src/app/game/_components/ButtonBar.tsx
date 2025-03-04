"use client";
import React from "react";
import "./components.module.css";

type Direction = "up" | "down" | "left" | "right";

interface ButtonBarProps {
  generate: () => void;
}

const ButtonBar: React.FC<ButtonBarProps> = ({ generate }) => {
  // onclick function
  const handleClick = () => {
    // You can add additional logic here if needed
    generate();
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
      <button
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
        onClick={handleClick}
      >
        Generate Paths
      </button>
    </div>
  );
};

export default ButtonBar;
