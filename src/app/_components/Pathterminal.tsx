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
  //current mode that our conversation is in, triggered by specific inputs;

  //check every enter: which mode, and then which command
  const [convMode, setConvMode] = useState<string>("default");
  //temp data stored for conversation.
  const [tempData, setTempData] = useState({}); // use a dictionary to store the data, with keys and inputs;
  useEffect(() => {
    if (terminalRef.current && !terminalInstanceRef.current) {
      // Create the terminal only if it doesn't exist yet
      const term = new Terminal({
        cursorBlink: true,
        rows: 15,
        cols: 90,
      });

      terminalInstanceRef.current = term;
      term.open(terminalRef.current);
      // Introduction
      term.writeln("Welcome to PathForms!");
      term.writeln(
        "This game aims to introduce Nielsen transformation in combinatorial group theory."
      );
      term.writeln(
        "The game provides a subgroup of a rank-2 free group with generators a, b (the Word Vector)."
      );
      term.writeln(
        "You are expected to perform Nielsen's transformation to bring this subgroup to Nielsen reduced form. "
      );

      //line heading
      term.write("> ");

      // To inplement:
      //
      // Interactions:
      // g
      // inv wx
      // concat wx wy
      // i
      // c
      //
      // Data Demo
      //
      // action records (auto)
      // wx : check nodesPath - demo paths
      //
      //
      // Game interface
      // help

      // user input data, STATE SPACE MACHINE
      let command = "";
      // data: user keyboard behaviros
      term.onData((data) => {
        // Enter, deal with current command
        if (data === "\r") {
          term.writeln(""); // New line
          if (convMode == "default") {
            // default mode, waiting for first-level command
            if (command == "g") {
              //go to generate mode
              command = "";
              term.write("> Generate word vector with size: ");
              setConvMode("generate");
            } else if (command == "i") {
              setConvMode("invert");
              setOperationMode("invert");
              command = "";
              term.writeln("> Invert mode.");
              term.write("> ");
            } else if (command == "c") {
              setConvMode("concat");
              setOperationMode("concat");
              command = "";
              term.writeln("> Concatenate mode.");
              term.write("> ");
            } else if (command == "mode") {
              command = "";
              term.writeln("> You are in default mode. ");
              term.write("> ");
            }
          } else if (convMode == "generate") {
            //generate mode, expecting vector size
            //check number
            const numValue = parseInt(command, 10);
            if (!isNaN(numValue)) {
              generate(numValue);
              command = "";
              term.write("> ");
            } else {
              //check for other operations
              if (command == "mode") {
                command = "";
                term.writeln("> You are in generate mode. ");
                term.write("> ");
              } else if (command == "q") {
                setConvMode("default");
                setOperationMode("normal");
                command = "";
                term.writeln("> default  mode.");
                term.write("> ");
              } else {
                // command is not a valid number
                command = "";
                term.writeln("> Not valid integer.");
                term.write("> ");
              }
            }
          } else if (convMode == "invert") {
            if (command.startsWith("w")) {
              const index: number = parseInt(command.substring(1), 10);
              if (!isNaN(index)) {
                invert(index - 1); //invert the correct path
              } else {
                command = "";
                term.writeln("> Not valid path.");
                term.write("> ");
              }
            }
          }
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
      });
    }

    // Cleanup function
    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
    };
  }, [
    terminalRef,
    terminalInstanceRef,
    convMode,
    setConvMode,
    // setOperationMode,
    // generate,
    // invert,
  ]);

  useEffect(() => {
    if (convMode === "generate") {
      terminalInstanceRef.current?.writeln("Generate word vector with size: ");
      terminalInstanceRef.current?.write("> ");
    }
  }, [convMode]);

  return (
    <div
      className={styles["terminal-container"]}
      style={{
        position: "fixed",
        right: "0px",
        bottom: "0",
        zIndex: 0,
        width: "60%",
        height: "300px",
      }}
    >
      <div ref={terminalRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Pathterminal;
