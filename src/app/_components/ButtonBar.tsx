"use client";
import React, { useEffect, useState } from "react";
import "./components.module.css";
import styles from "./components.module.css";
import * as Tone from "tone";

type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
  up: "a",
  down: "a\u207B\u00B9", // a^-1
  right: "b",
  left: "b\u207B\u00B9",
};

// Sound related constants
const NOTES = ["C4", "D4", "E4", "G4", "A4"]; // Pentatonic scale notes
const DIRECTION_NOTES = {
  up: "C5",
  down: "G4",
  left: "E4",
  right: "A4",
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
  //input config
  const [inputSize, setInputSize] = useState<string>("");
  const [currBase, setCurrBase] = useState<string>("");
  const [isSoundInitialized, setSoundInitialized] = useState<boolean>(false);

  // Initialize Tone.js on first user interaction
  useEffect(() => {
    // Create the sound objects but don't start audio context yet
    setupSynths();
  }, []);

  // Sound related functions
  const setupSynths = () => {
    // We'll set up our synths when needed
  };

  const initializeAudio = async () => {
    if (!isSoundInitialized) {
      await Tone.start();
      setSoundInitialized(true);
      console.log("Audio is ready");
    }
  };

  const playButtonSound = () => {
    if (!isSoundInitialized) return;

    const synth = new Tone.Synth({
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
    }).toDestination();

    synth.triggerAttackRelease("C5", "16n");
  };

  const playAddSound = () => {
    if (!isSoundInitialized) return;

    const synth = new Tone.Synth({
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.4,
      },
    }).toDestination();

    synth.triggerAttackRelease("E5", "16n");
  };

  const playClearSound = () => {
    if (!isSoundInitialized) return;

    const synth = new Tone.Synth({
      oscillator: {
        type: "square",
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.2,
        release: 0.3,
      },
    }).toDestination();

    synth.triggerAttackRelease("A3", "8n");
  };

  const playGenerateSound = () => {
    if (!isSoundInitialized) return;

    // Create a polyphonic synth
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    // Play a chord
    synth.triggerAttackRelease(["C4", "E4", "G4"], "8n");

    // Play an arpeggio after generating
    setTimeout(() => {
      const notes = ["C4", "E4", "G4", "C5"];
      notes.forEach((note, i) => {
        setTimeout(() => {
          synth.triggerAttackRelease(note, "16n");
        }, i * 100);
      });
    }, 200);
  };

  // Play a unique sound for each path generated
  const playPathSound = (path: Direction[]) => {
    if (!isSoundInitialized || path.length === 0) return;

    const synth = new Tone.Synth({
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.4,
      },
    }).toDestination();

    // Play notes sequentially based on the path
    path.forEach((direction, i) => {
      const note = DIRECTION_NOTES[direction] || "C4";
      setTimeout(() => {
        synth.triggerAttackRelease(note, "16n");
      }, i * 150);
    });
  };

  // Function to handle input change
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSize(event.target.value);
  };

  // Function to handle input change
  const handleBaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrBase(event.target.value);
  };

  const handlebaseClick = async () => {
    await initializeAudio();
    playGenerateSound();

    let inputNumber = 2; // Make sure to convert the input to a number
    if (inputSize != "") {
      inputNumber = Number(inputSize);
    }
    if (!isNaN(inputNumber)) {
      generate_base(inputNumber, bases); // Pass the number to the generate function
    } else {
      generate_base(2, bases); // Handle invalid number input
    }

    // Play sounds for each path
    setTimeout(() => {
      bases.forEach((path, i) => {
        setTimeout(() => {
          playPathSound(path);
        }, i * 300);
      });
    }, 500);
  };

  const handlebaseremove = async () => {
    await initializeAudio();
    playClearSound();
    clearbase();
  };

  // Function to handle the submit (not being used here, but left for context)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleAddBase = async () => {
    await initializeAudio();
    playAddSound();
    addbase(currBase);
  };

  // Function to be called when the button is clicked
  const handleClick = async () => {
    await initializeAudio();
    playButtonSound();

    // Convert inputValue to a number and pass it to generate
    let inputNumber = 2; // Make sure to convert the input to a number
    if (inputSize != "") {
      inputNumber = Number(inputSize);
    }
    if (!isNaN(inputNumber)) {
      generate(inputNumber); // Pass the number to the generate function
      // Play generate sound after paths are generated
      setTimeout(() => {
        playGenerateSound();
      }, 100);
    } else {
      generate(2); // Handle invalid number input
      // Play generate sound after paths are generated
      setTimeout(() => {
        playGenerateSound();
      }, 100);
    }
  };

  // Function to be called when the button is clicked
  const handleClickRand = async () => {
    await initializeAudio();
    playGenerateSound();

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
            placeholder="Add Generator"
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
          Generators
        </div>
        {bases.length === 0 ? (
          <div>No specified bases, default generators a,b. </div>
        ) : (
          bases.map((path, i) => (
            <div
              key={i}
              style={{
                whiteSpace: "nowrap",
                overflowX: "auto",
                marginBottom: 2,
              }}
              onClick={() => {
                if (isSoundInitialized) {
                  playPathSound(path);
                }
              }}
            >
              <strong>[G{i + 1}]:</strong>{" "}
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
