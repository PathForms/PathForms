"use client";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import styles from "./components.module.css";

type Direction = "up" | "down" | "left" | "right";

interface PathterminalProps {
  // States
  pathIndex: number[];
  nodePaths: string[][];
  edgePaths: string[][];
  moveRecords: Direction[][];
  operationMode: string;
  // Set states
  setPathIndex: React.Dispatch<React.SetStateAction<number[]>>;
  setNodePaths: React.Dispatch<React.SetStateAction<string[][]>>;
  setEdgePaths: React.Dispatch<React.SetStateAction<string[][]>>;
  setMoveRecords: React.Dispatch<React.SetStateAction<Direction[][]>>;
  setOperationMode: React.Dispatch<React.SetStateAction<string>>;
  // Operations
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
  // Terminal state references
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const commandHandlerRef = useRef<any>(null);
  const currentModeRef = useRef<string>("default");
  const currentStepRef = useRef(0);

  // UI states
  const [minimized, setMinimized] = useState(false);
  const [gameMode, setGameMode] = useState<string>("real");
  const [backup, setBackup] = useState<BackupState | null>(null);

  // Initialize terminal once
  useEffect(() => {
    if (terminalRef.current && !terminalInstanceRef.current) {
      const term = new Terminal({
        windowsMode: true,
        cursorBlink: true,
        rows: 17,
        cols: 90,
        theme: {
          background: "rgba(29, 29, 29, 0.49)",
          foreground: "#rgba(255, 255, 255, 0.81)",
        },
        fontFamily: '"Ubuntu", monospace',
      });

      terminalInstanceRef.current = term;
      term.open(terminalRef.current);

      // Show welcome message
      term.writeln("Welcome to PathForms!");
      term.writeln(
        "This game aims to visualize Nielsen transformations in combinatorial group theory."
      );
      term.writeln(
        "The game provides a list of words from a free group with generators a, b (the Word List)."
      );
      term.writeln(
        "You are expected to perform Nielsen's transformations to bring this list of words to Nielsen reduced form."
      );
      term.writeln("> To start a tutorial: enter 'guide' in the terminal");
      term.write("> ");
    }

    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
    };
  }, []);

  // Guide steps function
  const guideSteps = (term: Terminal) => {
    switch (currentStepRef.current) {
      case 1:
        term.writeln(
          "> You can control the display of the generated list of words when in mode 'default'."
        );
        term.writeln(
          ">\x1b[33m Enter 'q' to switch to mode 'default'. \x1b[0m"
        );
        term.write("> ");
        break;
      case 2:
        term.writeln(
          "> Great! Now let's start transforming the list of words! There are two things you can do."
        );
        term.writeln("> First, invert a specific word.");
        term.writeln(">\x1b[33m Enter 'i' to go to invert mode\x1b[0m");
        term.write("> ");
        break;
      case 3:
        term.writeln(
          "> The second thing you can do is concatenating two words (Nielsen Transform T2)."
        );
        term.writeln(">\x1b[33m Enter 'c' to go to concatenate mode.\x1b[0m");
        term.write("> ");
        break;
      case 4:
        term.writeln("> You are good to go! ");
        term.writeln(
          "> You can always \x1b[33menter 'h'\x1b[0m if you need any help, and \x1b[33menter 'm'\x1b[0m to check the current mode you're in with the operations you have."
        );
        term.writeln(
          "> If you're still confused about how the terminal works, you can check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
        );
        term.writeln("> Enter quit to exit guide mode, and enjoy the game!");
        term.write("> ");
        break;
      default:
        term.writeln("> Invalid step.");
        term.write("> ");
    }
  };

  // Set up command handler
  useEffect(() => {
    commandHandlerRef.current = (command: string) => {
      const term = terminalInstanceRef.current;
      if (!term) return;

      const currentMode = currentModeRef.current;

      // Handle guide mode entry
      if (command === "guide") {
        term.clear();
        setBackup({
          pathIndex,
          nodePaths,
          edgePaths,
          moveRecords,
          operationMode,
        });

        setPathIndex([]);
        setNodePaths([["0,0"]]);
        setEdgePaths([]);
        setMoveRecords([]);
        setOperationMode("normal");

        currentModeRef.current = "guide";
        setGameMode("guide");

        term.writeln(
          "> In this short guide, we will lead you through operations for this game."
        );
        term.writeln(
          "> First thing to do, you need to generate a list of words to start playing."
        );
        term.writeln(
          ">\x1b[33m Enter 'g' to go to generate mode\x1b[0m or use the buttons we provided."
        );
        term.writeln("> Enter 'ok' when you are done.");
        term.write("> ");
        return;
      }

      // Global mode commands
      if (command === "g") {
        setOperationMode("gen");
        currentModeRef.current = "generate";
        term.writeln("> Generate word vector with size:");
        term.write("> ");
        return;
      } else if (command === "i") {
        currentModeRef.current = "invert";
        setOperationMode("invert");
        term.writeln("> Invert mode.");
        term.write("> ");
        return;
      } else if (command === "c") {
        currentModeRef.current = "concat";
        setOperationMode("concat");
        term.writeln("> Concatenate mode.");
        term.write("> ");
        return;
      } else if (command === "q") {
        currentModeRef.current = "default";
        setOperationMode("normal");
        term.writeln("> Default mode.");
        term.write("> ");
        return;
      } else if (command === "h") {
        term.writeln("> g: go to generate mode;");
        term.writeln("> q: go to Default mode;");
        term.writeln("> i: go to Invert mode;");
        term.writeln("> c: go to Concatenate mode;");
        term.writeln("> m: check current mode & operations");
        term.writeln("> h: help");
        term.writeln("> guide: short guidance game");
        term.writeln(
          "> Check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
        );
        term.writeln(
          "> Check game description \u001B]8;;https://mineyev.web.illinois.edu/PathForms/\u0007here\u001B]8;;\u0007"
        );
        term.write("> ");
        return;
      }

      // Guide mode specific logic
      if (gameMode === "guide") {
        if (currentStepRef.current === 1 && command === "q") {
          term.writeln(
            "> Enter the word index (integer) to show/hide a specific word."
          );
          term.writeln(
            "> Enter \x1b[33m'a'\x1b[0m to show/hide the all words."
          );
          term.writeln("> Enter ok when you are done.");
          term.write("> ");
          return;
        }

        if (currentStepRef.current === 2 && command === "i") {
          term.writeln("> Enter the word index to invert a specific word.");
          term.writeln("> Enter ok when you are done.");
          term.write("> ");
          return;
        }

        if (currentStepRef.current === 3 && command === "c") {
          term.writeln("> Enter two word indices \x1b[33m'n m'\x1b[0m.");
          term.writeln("> n ---> n + m");
          term.writeln("> Enter ok when you are done.");
          term.write("> ");
          return;
        }

        if (command === "quit") {
          currentStepRef.current = 0;
          if (backup) {
            setPathIndex(backup.pathIndex);
            setNodePaths(backup.nodePaths);
            setEdgePaths(backup.edgePaths);
            setMoveRecords(backup.moveRecords);
            setOperationMode(backup.operationMode);
          }

          currentModeRef.current = "default";
          setGameMode("real");
          term.clear();
          term.write("> ");
          return;
        }

        if (command === "ok") {
          if (currentStepRef.current <= 4) {
            currentStepRef.current++;
            guideSteps(term);
          } else {
            term.writeln("Guide completed!\n");
            term.write("> ");
          }
          return;
        }
      }

      // Guide-specific operations in default mode
      if (currentMode === "default") {
        if (
          gameMode === "guide" &&
          currentStepRef.current === 1 &&
          command === "ok"
        ) {
          currentStepRef.current++;
          guideSteps(term);
          return;
        }

        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          demonstratePath(index - 1);
          term.write("> ");
          return;
        }

        if (command === "m") {
          term.writeln("> You are in default mode.");
          term.writeln("> To show/hide path: n (n: word index)");
          term.writeln("> To show/hide all path: a");
          term.write("> ");
          return;
        }

        if (command === "a") {
          if (pathIndex.length !== 0) {
            setPathIndex([]);
          } else {
            setPathIndex(
              Array.from({ length: nodePaths.length }, (_, index) => index)
            );
          }
          term.write("> ");
          return;
        }

        term.write("> ");
        return;
      }

      // Generate mode
      if (currentMode === "generate") {
        const numValue = parseInt(command, 10);
        if (!isNaN(numValue)) {
          generate(numValue);
          term.write("> ");
          return;
        }

        if (command === "m") {
          term.writeln("> You are in generate mode.");
          term.writeln("> To generate new word vector: n (n: word size)");
          term.write("> ");
          return;
        }

        term.write("> ");
        return;
      }

      // Invert mode
      if (currentMode === "invert") {
        if (
          gameMode === "guide" &&
          currentStepRef.current === 2 &&
          command === "ok"
        ) {
          currentStepRef.current++;
          guideSteps(term);
          return;
        }

        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          invert(index - 1);
          term.write("> ");
          return;
        }

        if (command === "m") {
          term.writeln("> You are in invert mode.");
          term.writeln("> To invert path: n (n: integer, word index)");
          term.write("> ");
          return;
        }

        term.write("> ");
        return;
      }

      // Concatenate mode
      if (currentMode === "concat") {
        if (
          gameMode === "guide" &&
          currentStepRef.current === 3 &&
          command === "ok"
        ) {
          currentStepRef.current++;
          guideSteps(term);
          return;
        }

        const p: string[] = command.split(" ");
        const index1 = parseInt(p[0], 10);
        const index2 = parseInt(p[1], 10);
        if (!isNaN(index1) && !isNaN(index2)) {
          concatenate(index1 - 1, index2 - 1);
          term.write("> ");
          return;
        }

        if (command === "m") {
          term.writeln("> You are in Concatenate mode.");
          term.writeln(
            "> To concatenate paths: n m (n: integer, word index 1; m: integer, word index 2.)"
          );
          term.write("> ");
          return;
        }

        term.write("> ");
        return;
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
    gameMode,
    pathIndex,
    setPathIndex,
    setNodePaths,
    setEdgePaths,
    setMoveRecords,
  ]);

  // Set up data listener for terminal input
  useEffect(() => {
    const term = terminalInstanceRef.current;
    if (!term) return;

    let command = "";

    const dataHandler = (data: string) => {
      // Handle Ctrl+R (Reset terminal)
      if (data === "\x12") {
        term.clear();
        term.writeln("Welcome to PathForms!");
        term.writeln(
          "This game aims to visualize Nielsen transformations in combinatorial group theory."
        );
        term.writeln(
          "The game provides a list of words from a free group with generators a, b (the Word List)."
        );
        term.writeln(
          "You are expected to perform Nielsen's transformations to bring this list of words to Nielsen reduced form."
        );
        term.writeln("> To start a tutorial: enter 'guide' in the terminal");
        term.write("> ");
        currentModeRef.current = "default";
        setOperationMode("normal");
        return;
      }

      const COLOR_COMMAND = "\x1b[96m"; // Cyan for command text
      const COLOR_RESET = "\x1b[0m"; // Reset color

      // Handle Enter key
      if (data === "\r") {
        term.writeln(""); // New line
        if (commandHandlerRef.current) {
          commandHandlerRef.current(command);
        }
        command = ""; // Reset command after processing
        return;
      }

      // Handle backspace
      if (data === "\u007F") {
        if (command.length > 0) {
          command = command.slice(0, -1);
          term.write("\b \b"); // Move cursor back, erase character
        }
        return;
      }

      // Collect command and display with color
      command += data;
      term.write(COLOR_COMMAND + data + COLOR_RESET);
    };

    term.onData(dataHandler);
  }, [setOperationMode]);

  return (
    <div className={styles["terminal-container"]}>
      <button
        className={styles["terminal-button"]}
        style={{
          right: minimized ? "0" : "auto",
          left: minimized ? "auto" : "-14px",
        }}
        onClick={() => setMinimized(!minimized)}
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
