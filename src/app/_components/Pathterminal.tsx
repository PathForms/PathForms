"use client";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";

interface PathterminalProps {
  //states
  pathIndex: number[];
  nodePaths: string[][];
  edgePaths: string[][];
  moveRecords: Direction[][];
  operationMode: string;
  //set states
  setPathIndex: React.Dispatch<React.SetStateAction<number[]>>;
  setNodePaths: React.Dispatch<React.SetStateAction<string[][]>>;
  setEdgePaths: React.Dispatch<React.SetStateAction<string[][]>>;
  setMoveRecords: React.Dispatch<React.SetStateAction<Direction[][]>>;
  setOperationMode: React.Dispatch<React.SetStateAction<string>>;
  //operations
  generate: (size: number) => void;
  demonstratePath: (index: number) => void;
  concatenate: (index1: number, index2: number) => void;
  invert: (index: number) => void;
}

interface BackupState {
  pathIndex: number[];
  nodePaths: string[][];
  edgePaths: string[][];
  moveRecords: Direction[][];
  operationMode: string;
}

const Pathterminal: React.FC<PathterminalProps> = ({
  pathIndex,
  nodePaths,
  edgePaths,
  moveRecords,
  operationMode,
  setPathIndex,
  setNodePaths,
  setEdgePaths,
  setMoveRecords,
  setOperationMode,
  generate,
  demonstratePath,
  concatenate,
  invert,
}) => {
  //states for terminal records
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const commandHandlerRef = useRef<any>(null);
  const currentModeRef = useRef<string>("default");

  //states for terminal rendering
  const [minimized, setMinimized] = useState(false);
  // Terminal initialization - runs only once
  // In order to make sure that future re-render does not effec the terminal istory

  //another set of states that hold the backup of the current game; designed for guide mode;
  //anything inside backup will never be used to render the page!
  //when entering guide mode, backup is updated to be current game;
  //when existing guide mode, backup is updated to be null;
  const [backup, setBackup] = useState<any>(null); // Store the game state when entering guide mode
  let currentStepRef = useRef(0); // Keep track of the current step across renders

  useEffect(() => {
    if (terminalRef.current && !terminalInstanceRef.current) {
      // Create the terminal only if it doesn't exist yet
      const term = new Terminal({
        windowsMode: true, // Improves compatibility on Windows
        cursorBlink: true,
        rows: 17,
        cols: 90,

        theme: {
          background: "rgba(29, 29, 29, 0.49)", // Dark background color
          foreground: "#rgba(255, 255, 255, 0.81)", // Optional: change text color too
        },

        fontFamily: '"Ubuntu", monospace',
        //'"SF Mono", Menlo, monospace'
        // '"Cascadia Mono", monospace',
        //'"Menlo monospace",monospace'
        //'"Ubuntu", sans-serif',
      });

      terminalInstanceRef.current = term;
      term.open(terminalRef.current);

      // Introduction
      term.writeln("Welcome to PathForms!");
      term.writeln(
        "This game aims to visualize Nielsen transform in combinatorial group theory."
      );
      term.writeln(
        "The game provides a list of words from a subgroup of a rank-2 free group with generators a, b (the Word Vector)."
      );
      term.writeln(
        "You are expected to perform Nielsen's transformation to bring this list of words to Nielsen reduced form. "
      );
      term.writeln("> h: help ");

      //line heading
      term.write("> ");
    }

    // Cleanup function
    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
    };
  }, [terminalRef]); // Only depend on terminalRef to initialize once

  // Update command handler whenever relevant props change
  useEffect(() => {
    commandHandlerRef.current = (command: string) => {
      const term = terminalInstanceRef.current;
      if (!term) return;

      const currentMode = currentModeRef.current;
      //reset terminal

      //no matter in what mode;

      //guide mode logic;

      if (currentMode === "guide") {
        // Function for guide mode
        const guideSteps = () => {
          switch (currentStepRef.current) {
            // case 0:
            //   term.writeln("Step 1: Do this action.\n");
            //   term.write("> ");
            //   break;
            case 1:
              term.writeln(
                "The first operation you have is invert (Nielsen Transform T1)."
              );
              term.writeln(
                "To use the terminal, enter i to go to invert mode and then enter the word index to invert. "
              );
              term.writeln(
                "To use the buttons, click on the Invert Mode and then click on the target word in word list"
              );
              term.writeln("Enter ok when you are done. ");
              term.write("> ");
              break;
            case 2:
              term.writeln(
                "The second operation you have is concatenate (Nielsen Transform T2)."
              );
              term.writeln(
                "To use the terminal, enter c to go to invert mode and then enter the word indexes to concatenate. "
              );
              term.writeln(
                "Word 1 will be replaced by the combination of the word 1  + word 2"
              );
              term.writeln(
                "To use the buttons, click on the Concatenate Mode and then click on two words in order. "
              );
              term.writeln(
                "Word first clicked will be replaced by the combination of the word 1  + word 2"
              );
              term.writeln("Enter ok when you are done. ");
              term.write("> ");
              break;
            case 3:
              term.writeln("Guide complete!");
              term.write("> ");
              break;
            default:
              term.writeln("Invalid step.");
              term.write("> ");
          }
        };

        // Handle quitting the guide mode
        if (command === "quit") {
          // Reset other states to backup values
          setPathIndex(backup.pathIndex);
          setNodePaths(backup.nodePaths);
          setEdgePaths(backup.edgePaths);
          setMoveRecords(backup.moveRecords);
          setOperationMode(backup.operationMode);

          // Reset the currentModeRef correctly
          currentModeRef.current = "default";
          console.log(`Current mode after exiting: ${currentModeRef.current}`);

          term.write("> ");
        }

        // Handle moving to the next step
        else if (command === "ok") {
          // If it's not the last step, go to the next step
          if (currentStepRef.current < 3) {
            currentStepRef.current++; // Increment the step
            guideSteps(); // Show the next step
          } else {
            term.writeln("Guide complete!\n"); // If finished, show "Guide complete"
            term.write("> ");
          }
        }
      }

      if (currentMode === "default") {
        // default mode, waiting for first-level command
        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          demonstratePath(index - 1); //invert the correct path
          term.write("> ");
        } else if (command === "guide") {
          //before going into guide mode, keep everything a copy and reset everything;
          //set backkup for exit re-rendering;
          setBackup({
            pathIndex,
            nodePaths,
            edgePaths,
            moveRecords,
            operationMode,
          });
          //reset;
          setPathIndex([]);
          setNodePaths([["0,0"]]);
          setEdgePaths([]);
          setMoveRecords([]);
          setOperationMode("normal");
          //set game mode
          currentModeRef.current = "guide";
          //write in the terminal;
          // Initial step call if we are just entering guide mode
          term.writeln(
            "In this guide, we will lead you through how to play this game and the math behind it. "
          );
          term.writeln(
            "To start the game, you need to generate a list of words. "
          );
          term.writeln(
            "Enter g to go to generate mode or use the buttons we provided. "
          );
          term.writeln("Enter ok when you are done. ");
          term.write("> ");
          term.clear();
        } else if (command === "a") {
          if (pathIndex.length != 0) {
            setPathIndex([]);
            term.write("> ");
          } else {
            setPathIndex(
              Array.from({ length: nodePaths.length }, (_, index) => index)
            );
            term.write("> ");
          }
        } else if (command === "g") {
          //go to generate mode
          setOperationMode("gen");
          currentModeRef.current = "generate";
          term.writeln("> Generate word vector with size: ");
          term.write("> ");
        } else if (command === "i") {
          currentModeRef.current = "invert";
          setOperationMode("invert");
          term.writeln("> Invert mode.");
          term.write("> ");
        } else if (command === "c") {
          currentModeRef.current = "concat";
          setOperationMode("concat");
          term.writeln("> Concatenate mode.");
          term.write("> ");
        } else if (command === "m") {
          term.writeln("> You are in default mode. ");
          term.writeln("> To show/hide path: n (n: word index) ");
          term.writeln("> To show/hide all path: a ");
          term.write("> ");
        } else if (command === "q") {
          currentModeRef.current = "default";
          setOperationMode("normal");
          term.writeln("> Default mode.");
          term.write("> ");
        } else if (command === "h") {
          term.writeln("> g: go to generate mode; ");
          term.writeln("> q: go to Default mode; ");
          term.writeln("> i: go to Invert mode; ");
          term.writeln("> c: go to Concatenate mode; ");
          term.writeln("> m: check current mode & operations");
          term.writeln("> h: help ");
          term.writeln(
            "> Check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
          );
          term.writeln(
            "> Check game description \u001B]8;;https://mineyev.web.illinois.edu/PathForms/\u0007here\u001B]8;;\u0007"
          );
          term.write("> ");
        } else {
          term.writeln("> Invalid.");
          term.write("> ");
        }
      } else if (currentMode === "generate") {
        //generate mode, expecting vector size
        //check number

        const numValue = parseInt(command, 10);
        if (!isNaN(numValue)) {
          generate(numValue);
          term.write("> ");
        } else {
          //check for other operations
          if (command === "m") {
            term.writeln("> You are in generate mode. ");
            term.writeln("> To generate new word vector: n (n: word size) ");
            term.write("> ");
          } else if (command === "h") {
            term.writeln("> g: go to generate mode; ");
            term.writeln("> q: go to Default mode; ");
            term.writeln("> i: go to Invert mode; ");
            term.writeln("> c: go to Concatenate mode; ");
            term.writeln("> m: check current mode & operations");
            term.writeln("> h: help ");
            term.writeln(
              "> Check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
            );
            term.writeln(
              "> Check game description \u001B]8;;https://mineyev.web.illinois.edu/PathForms/\u0007here\u001B]8;;\u0007"
            );

            term.write("> ");
          } else if (command === "guide") {
            //before going into guide mode, keep everything a copy and reset everything;
            //set backkup for exit re-rendering;
            setBackup({
              pathIndex,
              nodePaths,
              edgePaths,
              moveRecords,
              operationMode,
            });
            //reset;
            setPathIndex([]);
            setNodePaths([["0,0"]]);
            setEdgePaths([]);
            setMoveRecords([]);
            setOperationMode("normal");
            //set game mode
            currentModeRef.current = "guide";
            term.write("> ");
          } else if (command === "q") {
            currentModeRef.current = "default";
            setOperationMode("normal");
            term.writeln("> Default mode.");
            term.write("> ");
          } else if (command === "i") {
            currentModeRef.current = "invert";
            setOperationMode("invert");
            term.writeln("> invert mode.");
            term.write("> ");
          } else if (command === "c") {
            currentModeRef.current = "concat";
            setOperationMode("concat");
            term.writeln("> Concatenate mode.");
            term.write("> ");
          } else {
            // command is not a valid number
            term.writeln("> Invalid.");
            term.write("> ");
          }
        }
      } else if (currentMode === "invert") {
        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          invert(index - 1); //invert the correct path
          term.write("> ");
        } else if (command === "guide") {
          //before going into guide mode, keep everything a copy and reset everything;
          //set backkup for exit re-rendering;
          setBackup({
            pathIndex,
            nodePaths,
            edgePaths,
            moveRecords,
            operationMode,
          });
          //reset;
          setPathIndex([]);
          setNodePaths([["0,0"]]);
          setEdgePaths([]);
          setMoveRecords([]);
          setOperationMode("normal");
          //set game mode
          currentModeRef.current = "guide";
          term.write("> ");
        } else if (command === "h") {
          term.writeln("> g: go to generate mode; ");
          term.writeln("> q: go to Default mode; ");
          term.writeln("> i: go to Invert mode; ");
          term.writeln("> c: go to Concatenate mode; ");
          term.writeln("> m: check current mode & operations");
          term.writeln("> h: help ");
          term.writeln(
            "> Check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
          );
          term.writeln(
            "> Check game description \u001B]8;;https://mineyev.web.illinois.edu/PathForms/\u0007here\u001B]8;;\u0007"
          );
          term.write("> ");
        } else if (command === "g") {
          //go to generate mode
          currentModeRef.current = "generate";
          setOperationMode("gen");
          term.writeln("> Generate word vector with size: ");
          term.write("> ");
        } else if (command === "q") {
          currentModeRef.current = "default";
          setOperationMode("normal");
          term.writeln("> Default mode.");
          term.write("> ");
        } else if (command === "i") {
          currentModeRef.current = "invert";
          setOperationMode("invert");
          term.writeln("> Invert mode.");
          term.write("> ");
        } else if (command === "c") {
          currentModeRef.current = "concat";
          setOperationMode("concat");
          term.writeln("> Concatenate mode.");
          term.write("> ");
        } else if (command === "m") {
          term.writeln("> You are in invert mode. ");
          term.writeln("> To invert path: n (n: integer, word index) ");
        } else {
          term.writeln("> Invalid.");
          term.write("> ");
        }
      } else if (currentMode === "concat") {
        // Implement concat mode handling

        const p: string[] = command.split(" ");
        const index1 = parseInt(p[0], 10);
        const index2 = parseInt(p[1], 10);
        if (!isNaN(index1) && !isNaN(index2)) {
          concatenate(index1 - 1, index2 - 1);
          term.write("> ");
        } else if (command === "guide") {
          //before going into guide mode, keep everything a copy and reset everything;
          //set backkup for exit re-rendering;
          setBackup({
            pathIndex,
            nodePaths,
            edgePaths,
            moveRecords,
            operationMode,
          });
          //reset;
          setPathIndex([]);
          setNodePaths([["0,0"]]);
          setEdgePaths([]);
          setMoveRecords([]);
          setOperationMode("normal");
          //set game mode
          currentModeRef.current = "guide";
          term.write("> ");
        } else if (command === "q") {
          currentModeRef.current = "default";
          setOperationMode("normal");
          term.writeln("> Default mode.");
          term.write("> ");
        } else if (command === "h") {
          term.writeln("> g: go to generate mode; ");
          term.writeln("> q: go to Default mode; ");
          term.writeln("> i: go to Invert mode; ");
          term.writeln("> c: go to Concatenate mode; ");
          term.writeln("> m: check current mode & operations");
          term.writeln("> h: help ");
          term.writeln(
            "> Check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
          );
          term.writeln(
            "> Check game description \u001B]8;;https://mineyev.web.illinois.edu/PathForms/\u0007here\u001B]8;;\u0007"
          );
          term.write("> ");
        } else if (command === "g") {
          //go to generate mode
          currentModeRef.current = "generate";
          setOperationMode("gen");
          term.writeln("> Generate word vector with size: ");
          term.write("> ");
        } else if (command === "c") {
          currentModeRef.current = "concat";
          setOperationMode("concat");
          term.writeln("> Concatenate mode.");
          term.write("> ");
        } else if (command === "i") {
          currentModeRef.current = "invert";
          setOperationMode("invert");
          term.writeln("> Invert mode.");
          term.write("> ");
        } else if (command === "m") {
          term.writeln("> You are in Concatenate mode. ");
          term.writeln(
            "> To concatenate paths: n m (n: integer, word index 1; m: integer, word index 2. ) "
          );
        } else {
          term.writeln("> Invalid.");
          term.write("> ");
        }
      }
    };
  }, [
    generate,
    invert,
    concatenate,
    demonstratePath,
    setOperationMode,
    moveRecords,
    nodePaths,
    edgePaths,
  ]); // Include all dependencies that the handlers use

  // Set up the data listener only once but use the latest command handler
  useEffect(() => {
    const term = terminalInstanceRef.current;
    if (!term) return;

    let command = "";

    const dataHandler = (data: string) => {
      if (data === "\x12") {
        term.clear();
        term.writeln("Welcome to PathForms!");
        term.writeln(
          "This game aims to visualize Nielsen transform in combinatorial group theory."
        );
        term.writeln(
          "The game provides a list of words from a subgroup of a rank-2 free group with generators a, b (the Word Vector)."
        );
        term.writeln(
          "You are expected to perform Nielsen's transformation to bring this list of words to Nielsen reduced form. "
        );
        term.writeln("> h: help ");
        //line heading
        term.write("> ");
        currentModeRef.current = "default";
        setOperationMode("normal");
        return;
      }
      // Enter, deal with current command
      if (data === "\r") {
        term.writeln(""); // New line
        if (commandHandlerRef.current) {
          commandHandlerRef.current(command);
        }
        command = ""; // Reset command after processing
      } else if (data === "\u007F") {
        // Handle backspace
        if (command.length > 0) {
          command = command.slice(0, -1);
          term.write("\b \b"); // Move cursor back, erase character
        }
      } else {
        // Collect command
        command += data;
        term.write(data);
      }
    };

    term.onData(dataHandler);

    // No cleanup needed for this listener as it's bound to the terminal lifecycle
  }, [terminalInstanceRef]); // Only depend on the terminal instance

  // Handle key press to reset the terminal

  return (
    <div className={styles["terminal-container"]}>
      <button
        className={styles["terminal-button"]}
        style={{
          right: minimized ? "0" : "auto", // Right when minimized, auto (left) when not
          left: minimized ? "auto" : "-14px", // Auto (left) when minimized, left when not
        }}
        onClick={() => {
          setMinimized(!minimized);
        }}
      >
        {minimized ? "+" : "-"}
      </button>

      <div
        ref={terminalRef}
        style={{
          width: minimized ? "0%" : "100%",
          height: "100%",
          bottom: "0px",
          overflow: "auto",
          scrollbarWidth: "none",
        }}
      />
    </div>
  );
};

export default Pathterminal;
