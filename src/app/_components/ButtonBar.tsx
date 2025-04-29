"use client";
import React, { useEffect, useState } from "react";
import "./components.module.css";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1
  right: "b",
  left: "b\u207B\u00B9",
};

interface ButtonBarProps {
  bases: Direction[][];
  generate: (size: number) => void;
  generate_rand: (size: number) => void;
  generate_base: (size: number, b: Direction[][]) => void;
  addbase: (input: string) => void;
  clearbase: () => void;
  setGen: () => void;
  tutorialStep?: number;
}

const ButtonBar: React.FC<ButtonBarProps> = ({
  bases,
  generate,
  generate_rand,
  generate_base,
  addbase,
  clearbase,
  setGen,
  tutorialStep,
}) => {
  // onclick function
  // const handleClick = () => {
  //   // You can add additional logic here if needed
  //   generate();
  // };

  //input config
  const [inputSize, setInputSize] = useState<string>("");
  const [currBase, setCurrBase] = useState<string>("");

  // Function to handle input change
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSize(event.target.value);
  };
  // Function to handle input change
  const handleBaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrBase(event.target.value);
  };
  const handlebaseClick = () => {
    let inputNumber = 2; // Make sure to convert the input to a number
    if (inputSize != "") {
      inputNumber = Number(inputSize);
    }
    if (!isNaN(inputNumber)) {
      generate_base(inputNumber, bases); // Pass the number to the generate function
    } else {
      generate_base(2, bases); // Handle invalid number input
    }
  };
  const handlebaseremove = () => {
    clearbase();
  };

  // Function to handle the submit (not being used here, but left for context)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };
  const handleAddBase = () => {
    addbase(currBase);
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

  // Function to be called when the button is clicked
  const handleClickRand = () => {
    // Convert inputValue to a number and pass it to generate
    let inputNumber = 2; // Make sure to convert the input to a number
    if (inputSize != "") {
      inputNumber = Number(inputSize);
    }
    if (!isNaN(inputNumber)) {
      generate_rand(inputNumber); // Pass the number to the generate function
    } else {
      generate_rand(2); // Handle invalid number input
    }
  };
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 140,
          left: 10,
          // transform: "translateX(-50%)",
          background: "rgba(47,47,47,0.5)",
          padding: 12,
          borderRadius: 10,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "left",
        }}
      >
        {/* Row 1: Size Input */}
        <div style={{ display: "flex", gap: 8 }}>
          <label>Number of Paths:</label>
          <input
            size={10}
            value={inputSize}
            onChange={handleSizeChange}
            placeholder="2"
          />
        </div>

        {/* Row 2: Base Input and Add Base Button */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            size={10}
            value={currBase}
            onChange={handleBaseChange}
            placeholder="Add Base"
          />
          <button
            style={{
              width: 70,
              height: 28,
              fontSize: 13,
              backgroundColor: "transparent",
              border: "2px solid rgb(13, 255, 0)",
              color: "rgb(13, 255, 0)",
              cursor: "pointer",
              borderRadius: 4,
              transition: "0.3s",
            }}
            onClick={handleAddBase}
          >
            Add
          </button>
          <button
            style={{
              width: 70,
              height: 28,
              fontSize: 13,
              backgroundColor: "transparent",
              border: "2px solid rgb(13, 255, 0)",
              color: "rgb(13, 255, 0)",
              cursor: "pointer",
              borderRadius: 4,
              transition: "0.3s",
            }}
            onClick={handlebaseremove}
          >
            Clear
          </button>
        </div>

        {/* Row 3: Generate Buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "left",
          }}
        >
          {/* <button
            className={tutorialStep === 1 ? styles.highlight : ""}
            style={{
              width: 140,
              height: 28,
              fontSize: 13,
              backgroundColor: "transparent",
              border: "2px solid rgb(13, 255, 0)",
              color: "rgb(13, 255, 0)",
              cursor: "pointer",
              borderRadius: 4,
              transition: "0.3s",
            }}
            onClick={handleClick}
          >
            Generate Words
          </button> */}
          <button
            style={{
              width: 140,
              height: 28,
              fontSize: 13,
              backgroundColor: "transparent",
              border: "2px solid rgb(13, 255, 0)",
              color: "rgb(13, 255, 0)",
              cursor: "pointer",
              borderRadius: 4,
              transition: "0.3s",
            }}
            onClick={handleClickRand}
          >
            Generate Rand
          </button>
          <button
            className={`${tutorialStep === 1 ? styles.highlight : ""}`}
            style={{
              width: 140,
              height: 28,
              fontSize: 13,
              backgroundColor: "transparent",
              border: "2px solid rgb(13, 255, 0)",
              color: "rgb(13, 255, 0)",
              cursor: "pointer",
              borderRadius: 4,
              transition: "0.3s",
            }}
            onClick={handlebaseClick} 
            //onClick={handleClick}
          >
            Generate Paths
          </button>
        </div>
      </div>

      {/* Word List Display */}
      <div
        style={{
          position: "fixed",
          bottom: 5,
          left: 10,
          // transform: "translateX(-50%)",
          background: "rgba(47,47,47,0.5)",
          color: "yellow",
          fontSize: 12,
          padding: 10,
          borderRadius: 8,
          height: 105, // <- fixed height
          overflowY: "scroll", // scroll when overflow
          zIndex: 10,
          width: "90%",
          maxWidth: 360,
          scrollbarWidth: "none", // for Firefox
          msOverflowStyle: "none", // for IE/Edge
        }}
      >
        <div style={{ fontWeight: "bold", color: "white", marginBottom: 4 }}>
          Bases
        </div>
        {bases.length === 0 ? (
          <div>No specified bases, default bases a,b. </div>
        ) : (
          bases.map((path, i) => (
            <div
              key={i}
              style={{
                whiteSpace: "nowrap",
                overflowX: "auto",
                marginBottom: 2,
              }}
            >
              <strong>[B{i + 1}]:</strong>{" "}
              {path.length === 0
                ? "1"
                : path
                    .map(
                      (node) => translation[node as keyof typeof translation]
                    )
                    .join(" ")}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ButtonBar;
