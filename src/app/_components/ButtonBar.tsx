"use client";
import React, { useEffect, useState } from "react";
import "./components.module.css";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";

interface ButtonBarProps {
  generate: (size: number) => void;
  setGen: () => void;
  tutorialStep?: number;
}

const ButtonBar: React.FC<ButtonBarProps> = ({ generate, setGen, tutorialStep }) => {
  // onclick function
  // const handleClick = () => {
  //   // You can add additional logic here if needed
  //   generate();
  // };

  //input config
  const [inputSize, setInputSize] = useState<string>("");

  // Function to handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSize(event.target.value);
  };

  // Function to handle the submit (not being used here, but left for context)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  // Function to be called when the button is clicked
  const handleClick = () => {
    // Convert inputValue to a number and pass it to generate
    let inputNumber = 2; // Make sure to convert the input to a number
    if (inputSize != "") {
      inputNumber = Number(inputSize);
    }
    if (!isNaN(inputNumber)) {
      generate(inputNumber); // Pass the number to the generate function
    } else {
      generate(2); // Handle invalid number input
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 65,
        left: "14%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 10,
        display: "flex",
        gap: "8px",
      }}
    >
      <input
        size={12}
        type="text"
        value={inputSize}
        onChange={handleChange}
        placeholder="Number of Words"
      />
      <button
        className={`${tutorialStep === 1 ? styles.highlight : ""}`}
        style={{
          width: "200px",
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
        Generate Words
      </button>
    </div>
  );
};

export default ButtonBar;
