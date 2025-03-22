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
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const commandHandlerRef = useRef<any>(null);
  const currentModeRef = useRef<string>("default");

  // Terminal initialization - runs only once
  // In order to make sure that future re-render does not effec the terminal istory
  useEffect(() => {
    if (terminalRef.current && !terminalInstanceRef.current) {
      // Create the terminal only if it doesn't exist yet
      const term = new Terminal({
        cursorBlink: true,
        rows: 15,
        cols: 90,

        theme: {
          background: "rgba(29, 29, 29, 0.49)", // Dark background color
          foreground: "#rgba(255, 255, 255, 0.81)", // Optional: change text color too
        },

        fontFamily: '"Cascadia Mono", monospace',
      });

      terminalInstanceRef.current = term;
      term.open(terminalRef.current);

      // Introduction
      term.writeln("Welcome to PathForms!");
      term.writeln(
        "This game aims to introduce Nielsen transform in combinatorial group theory."
      );
      term.writeln(
        "The game provides a subgroup of a rank-2 free group with generators a, b (the Word Vector)."
      );
      term.writeln(
        "You are expected to perform Nielsen's transformation to bring this subgroup to Nielsen reduced form. "
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

      if (currentMode === "default") {
        // default mode, waiting for first-level command
        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          demonstratePath(index - 1); //invert the correct path
          term.write("> ");
        } else if (command === "g") {
          //go to generate mode
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
          term.write("> ");
        } else if (command === "g") {
          //go to generate mode
          currentModeRef.current = "generate";
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
          term.write("> ");
        } else if (command === "g") {
          //go to generate mode
          currentModeRef.current = "generate";
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

  // // Effect to handle mode-specific UI updates
  // useEffect(() => {
  //   const term = terminalInstanceRef.current;
  //   if (!term) return;

  //   // This can handle any UI updates needed when operationMode changes
  //   // For example, displaying different prompts based on mode
  // }, [operationMode]);

  return (
    <div
      className={styles["terminal-container"]}
      style={{
        position: "fixed",
        right: "0px",
        bottom: "0",
        zIndex: 0,
        width: "60%",
        height: "290px",
      }}
    >
      <div ref={terminalRef} style={{ width: "110%", height: "100%" }} />
    </div>
  );
};

export default Pathterminal;
