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

  // gameMode is a different dimension of settings apart from the operation modes;
  // The high level game setting should appear to be different in the game mode;
  const [gameMode, setGameMode] = useState<string>("actual");
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
        "This game aims to visualize Nielsen transformations in combinatorial group theory."
      );
      term.writeln(
        "The game provides a list of words from a free group with generators a, b (the Word List)."
      );
      term.writeln(
        "You are expected to perform Nielsen's transformations to bring this list of words to Nielsen reduced form. "
      );
      term.writeln("> To start a tutorial: enter 'guide' in the terminal");
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

  // useEffect(() => {
  //   const term = terminalInstanceRef.current;
  //   if (!term) return;
  //   term.writeln("\x1b[2K\r"); // Clear the line
  //   term.write(`\x1b[1;34m-- ${operationMode.toUpperCase()} --\x1b[0m`);
  //   term.scrollToBottom();
  // }, [operationMode]);

  useEffect(() => {
    commandHandlerRef.current = (command: string) => {
      const term = terminalInstanceRef.current;
      if (!term) return;

      const currentMode = currentModeRef.current;
      //no matter which game mode, should be able to switch
      //reset terminal

      //guide mode command;
      if (command === "guide") {
        term.clear();
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
        setGameMode("guide");
        //write in the terminal;
        // Initial step call if we are just entering guide mode

        term.writeln(
          "> In this short guide, we will lead you through operations for this game. "
        );
        term.writeln(
          "> First thing to do, you need to generate a list of words to start playing. "
        );
        term.writeln(
          ">\x1b[33m Enter 'g' to go to generate mode\x1b[0m or use the buttons we provided."
        );
        term.writeln("> Enter 'ok' when you are done. ");
        // term.write("> ");
      }

      //general operation logic (ok in any mode)
      //should include:
      //h, q, i, c, m, g;

      if (command === "g") {
        //go to generate mode
        setOperationMode("gen");
        currentModeRef.current = "generate";
        term.writeln("> Generate word vector with size: ");
      } else if (command === "i") {
        currentModeRef.current = "invert";
        setOperationMode("invert");
        term.writeln("> Invert mode.");
      } else if (command === "c") {
        currentModeRef.current = "concat";
        setOperationMode("concat");
        term.writeln("> Concatenate mode.");
      } else if (command === "q") {
        currentModeRef.current = "default";
        setOperationMode("normal");
        term.writeln("> Default mode.");
      } else if (command === "h") {
        term.writeln("> g: go to generate mode; ");
        term.writeln("> q: go to Default mode; ");
        term.writeln("> i: go to Invert mode; ");
        term.writeln("> c: go to Concatenate mode; ");
        term.writeln("> m: check current mode & operations");
        term.writeln("> h: help ");
        term.writeln("> guide: short guidence game");
        term.writeln(
          "> Check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
        );
        term.writeln(
          "> Check game description \u001B]8;;https://mineyev.web.illinois.edu/PathForms/\u0007here\u001B]8;;\u0007"
        );
      }

      // Function for guide mode
      const guideSteps = () => {
        switch (currentStepRef.current) {
          case 1:
            term.writeln(
              "> You can control the display of the generated list of words when in mode 'default'."
            );
            term.writeln(
              ">\x1b[33m Enter 'q' to switch to mode 'default'. \x1b[0m"
            );

            // term.writeln(
            //   ">\x1b[33m enter the word index to show/hide that word\x1b[0m."
            // );

            // term.writeln("> Enter ok when you are done. ");
            term.write("> ");
            break;
          case 2:
            term.writeln(
              "> Great! Now let's start transforming the list of words! There are two things you can do."
            );
            term.writeln("> First, invert a specific word.");
            term.writeln(">\x1b[33m Enter 'i' to go to invert mode\x1b[0m");
            // term.writeln(
            //   ">\x1b[33m To use the buttons, click on the Invert Mode and then click on the target word in word list.\x1b[0m"
            // );

            // term.writeln("> Enter ok when you are done. ");
            term.write("> ");
            break;
          case 3:
            term.writeln(
              "> The second thing you can do is concatenating two words (Nielsen Transform T2)."
            );
            term.writeln(
              ">\x1b[33m Enter 'c' to go to concatenate mode.\x1b[0m"
            );
            // term.writeln(
            //   "> To use the buttons, click on the Concatenate Mode and then click on two words in word list. "
            // );
            // term.writeln("> First_Word ----> First_Word + Second_Word");
            // term.writeln("> Enter ok when you are done. ");
            term.write("> ");
            break;
          case 4:
            term.writeln("> You are good to go! ");
            term.writeln(
              "> You can always \x1b[33menter 'h'\x1b[0m if you need any help, and \x1b[33menter 'm'\x1b[0m to check the current mode you're in with the operations you have. "
            );
            term.writeln(
              "> If you're still confused about how the terminal works, you can check terminal FSM diagram \u001B]8;;https://pathforms.vercel.app/fsm\u0007here\u001B]8;;\u0007"
            );
            term.writeln(
              "> Enter quit to exit guide mode, and enjoy the game! "
            );
            term.write("> ");
            break;
          default:
            term.writeln("> Invalid step.");
            term.write("> ");
        }
      };
      //guide mode logic;
      // these are specific for gameMode;
      // The operations should be global, right?
      if (gameMode === "guide") {
        // currentStepRef.current = 0;
        // Handle quitting the guide mode

        if (currentStepRef.current == 1) {
          if (command === "q") {
            term.writeln(
              "> Enter the word index (integer) to show/hide a specific word."
            );
            term.writeln(
              "> Enter \x1b[33m'a'\x1b[0m to show/hide the all words."
            );
            term.writeln("> Enter ok when you are done. ");
            term.write("> ");
          }
        }
        if (currentStepRef.current == 2) {
          if (command === "i") {
            term.writeln("> Enter the word index to invert a specific word.");
            term.writeln("> Enter ok when you are done. ");
            term.write("> ");
          }
        }
        if (currentStepRef.current == 3) {
          if (command === "c") {
            term.writeln("> Enter two word indices \x1b[33m'n m'\x1b[0m.");
            term.writeln("> n ---> n + m");
            term.writeln("> Enter ok when you are done. ");
            term.write("> ");
          }
        }
        if (command === "quit") {
          currentStepRef.current = 0;
          // Reset other states to backup values
          setPathIndex(backup.pathIndex);
          setNodePaths(backup.nodePaths);
          setEdgePaths(backup.edgePaths);
          setMoveRecords(backup.moveRecords);
          setOperationMode(backup.operationMode);

          // Reset the currentModeRef correctly
          //this might be a mistake; notice for bug;
          currentModeRef.current = "default";

          setGameMode("real"); //this should trick re-rendering;
          console.log(`Current mode after exiting: ${currentModeRef.current}`);
          term.clear();
          term.write("> ");
        }
        // Handle moving to the next step
        else if (command === "ok") {
          // If it's not the last step, go to the next step
          if (currentStepRef.current <= 4) {
            currentStepRef.current++; // Increment the step
            guideSteps(); // Show the next step
          } else {
            term.writeln("Guide completed!\n"); // If finished, show "Guide complete"
            // currentStepRef.current = 0;
            term.write("> ");
          }
        } else {
          term.write("> ");
        }
      }

      // Everything below should be in real mode;
      // Or, let's just add a if statement for specific "quit option".
      if (currentMode === "default") {
        // guide-specific command
        //guide-specific operation
        if (gameMode == "guide" && currentStepRef.current == 1) {
          if (command == "ok") {
            currentStepRef.current++;
            guideSteps();
          }
        }
        // default mode, waiting for first-level command
        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          demonstratePath(index - 1); //invert the correct path
          term.write("> ");
        } else if (command === "m") {
          term.writeln("> You are in default mode. ");
          term.writeln("> To show/hide path: n (n: word index) ");
          term.writeln("> To show/hide all path: a ");
          term.write("> ");
        } else if (command === "a") {
          if (pathIndex.length != 0) {
            setPathIndex([]);
            term.write("> ");
          } else {
            setPathIndex(
              Array.from({ length: nodePaths.length }, (_, index) => index)
            );
            term.writeln("> ");
          }
        } else {
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
          } else {
            term.writeln("> ");
          }
        }
      } else if (currentMode === "invert") {
        if (gameMode == "guide" && currentStepRef.current == 2) {
          if (command == "ok") {
            currentStepRef.current++;
            guideSteps();
          }
        }
        const index: number = parseInt(command, 10);
        if (!isNaN(index)) {
          invert(index - 1); //invert the correct path
          term.write("> ");
        } else if (command === "m") {
          term.writeln("> You are in invert mode. ");
          term.writeln("> To invert path: n (n: integer, word index) ");
        } else {
          term.writeln("> ");
        }
      } else if (currentMode === "concat") {
        // Implement concat mode handling

        const p: string[] = command.split(" ");
        const index1 = parseInt(p[0], 10);
        const index2 = parseInt(p[1], 10);
        if (!isNaN(index1) && !isNaN(index2)) {
          concatenate(index1 - 1, index2 - 1);
          term.write("> ");
        } else if (command === "m") {
          term.writeln("> You are in Concatenate mode. ");
          term.writeln(
            "> To concatenate paths: n m (n: integer, word index 1; m: integer, word index 2. ) "
          );
        } else {
          term.writeln("> ");
        }
        // else {
        //   term.writeln("> Invalid.");
        //   term.write("> ");
        // }
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
  ]); // Include all dependencies that the handlers use

  // Set up the data listener only once but use the latest command handler
  useEffect(() => {
    const term = terminalInstanceRef.current;
    if (!term) return;

    let command = "";

    const dataHandler = (data: string) => {
      if (data === "\x12") {
        term.clear();

        // Introduction
        term.writeln("Welcome to PathForms!");
        term.writeln(
          "This game aims to visualize Nielsen transformations in combinatorial group theory."
        );
        term.writeln(
          "The game provides a list of words from a free group with generators a, b (the Word List)."
        );
        term.writeln(
          "You are expected to perform Nielsen's transformations to bring this list of words to Nielsen reduced form. "
        );
        term.writeln("> To start a tutorial: enter 'guide' in the terminal");
        //line heading
        term.write("> ");
        currentModeRef.current = "default";
        setOperationMode("normal");
        return;
      }

      const COLOR_COMMAND = "\x1b[96m"; // Cyan, for example
      const COLOR_RESET = "\x1b[0m"; // Reset to default
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
        term.write(COLOR_COMMAND + data + COLOR_RESET);
      }
    };
    // Attach the data handler to onData
    term.onData(dataHandler);

    // Attach another onData to show the operation mode at the bottom
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
