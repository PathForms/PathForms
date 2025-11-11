"use client";
import React, { useEffect, useState } from "react";
import "./components.module.css";
import styles from "./components.module.css";
import {
 initializeSynths,
 initializeAudio,
 playButtonSound,
 playAddSound,
 playClearSound,
 playGenerateSound,
 playPathSound,
 setSoundEnabled,
 cleanupSynths,
} from "../utils/soundManager";
import { formatExponent } from "../utils/formatExponent";


type Direction = "up" | "down" | "left" | "right";
const translation: Record<Direction, string> = {
 up: "a",
 down: "a\u207B\u00B9", // a^-1
 right: "b",
 left: "b\u207B\u00B9",
};


// Sound related constants are now imported from soundManager


interface ButtonBarProps {
 bases: Direction[][];
 generate: (size: number) => void;
 generate_rand: (size: number) => void;
 generate_base: (size: number, b: Direction[][]) => void;
 addbase: (input: string) => void;
 clearbase: () => void;
 removebase?: (index: number) => void;
 setGen: () => void;
 tutorialStep?: number;
 //sound button:
 soundEnabled: boolean;
 // Custom path generation:
 generate_custom?: (exponents: number[]) => void;
 // Default generators text (for rank 3)
 defaultGeneratorsText?: string;
}


const ButtonBar: React.FC<ButtonBarProps> = ({
 bases,
 generate,
 generate_rand,
 generate_base,
 addbase,
 clearbase,
 removebase,
 setGen,
 tutorialStep,
 //sound button:
 soundEnabled,
 // Custom path generation:
 generate_custom,
 // Default generators text
 defaultGeneratorsText = "No specified bases, default generators a,b.",
}) => {
 //input config
 const [inputSize, setInputSize] = useState<string>("");
 const [currBase, setCurrBase] = useState<string>("");
 const [removeIndex, setRemoveIndex] = useState<string>("");

 // Custom path exponents (for rank 1)
 const [customExponents, setCustomExponents] = useState<number[]>([]);


 // Initialize synths and set sound enabled state
 useEffect(() => {
   const initSound = async () => {
     await initializeSynths();
     setSoundEnabled(soundEnabled);
   };
   initSound();
 }, [soundEnabled]);


 // Cleanup on unmount
 useEffect(() => {
   return () => {
     cleanupSynths();
   };
 }, []);


 // Sound functions are now imported from soundManager


 // Function to handle input change
 const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   const value = event.target.value;
   // Allow empty string or limit to max 10
   if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
     setInputSize(value);
   }
 };


 // Function to handle input change
 const handleBaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   setCurrBase(event.target.value);
 };

 // Function to handle remove index change
 const handleRemoveIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   setRemoveIndex(event.target.value);
 };

 const handleRemoveBase = async (index?: number) => {
   //sound button:
   if (soundEnabled) await playButtonSound();
   await initializeAudio();
   if (soundEnabled) await playClearSound();
   
   // Use provided index or the one from input
   let targetIndex = index;
   if (targetIndex === undefined && removebase) {
     const inputNumber = Number(removeIndex);
     if (isNaN(inputNumber) || inputNumber < 1 || inputNumber > bases.length) {
       alert(`Please enter a valid generator number (1-${bases.length})`);
       return;
     }
     targetIndex = inputNumber - 1; // Convert to 0-based index
   }
   
   if (removebase && targetIndex !== undefined) {
     removebase(targetIndex);
     setRemoveIndex(""); // Clear the input after successful removal
   }
 };


 const handlebaseClick = async () => {
  if (tutorialStep === 1) {
     if (soundEnabled) await playButtonSound();
     await initializeAudio();
     if (soundEnabled) await playGenerateSound();
     generate(0); 
     return; 
   }
   //sound button:
   if (soundEnabled) await playButtonSound();
   await initializeAudio();
   if (soundEnabled) await playGenerateSound();

   // If in rank 1 mode with custom exponents, generate custom paths
   if (generate_custom && customExponents.length > 0) {
     generate_custom(customExponents);
     return;
   }

   let inputNumber = 2; // Make sure to convert the input to a number
   if (inputSize != "") {
     inputNumber = Number(inputSize);
   }
   if (!isNaN(inputNumber)) {
     // Clamp the value to max 10
     inputNumber = Math.min(Math.max(inputNumber, 0), 10);
     generate_base(inputNumber, bases); // Pass the number to the generate function
   } else {
     generate_base(2, bases); // Handle invalid number input
   }


   // Play sounds for each path
   setTimeout(() => {
     bases.forEach((path, i) => {
       setTimeout(() => {
         if (soundEnabled) playPathSound(path);
       }, i * 300);
     });
   }, 500);
 };


 const handlebaseremove = async () => {
   //sound button:
   if (soundEnabled) await playButtonSound();
   await initializeAudio();
   if (soundEnabled) await playClearSound();

   // Clear custom exponents if in rank 1 mode
   if (generate_custom) {
     setCustomExponents([]);
   }

   clearbase();
 };


 // Function to handle the submit (not being used here, but left for context)
 const handleSubmit = async (event: React.FormEvent) => {
   //sound button:
   if (soundEnabled) await playButtonSound();
   event.preventDefault();
 };


 const handleAddBase = async () => {
   //sound button:
   if (soundEnabled) await playButtonSound();
   await initializeAudio();
   if (soundEnabled) await playAddSound();

   // Check if we're in rank 1 mode (generate_custom exists) and input is a number
   if (generate_custom) {
     const exponent = parseInt(currBase);
     if (!isNaN(exponent)) {
       if (customExponents.length >= 10) {
         alert("Maximum of 10 custom paths allowed");
         return;
       }
       setCustomExponents([...customExponents, exponent]);
       setCurrBase("");
       return;
     }
   }

   // Check if we've reached the limit for rank 2 custom generators
   if (bases.length >= 10) {
     alert("Maximum of 10 custom generators allowed");
     return;
   }

   // Otherwise, use the original addbase functionality
   addbase(currBase);
 };


 // Function to be called when the button is clicked
 const handleClick = async () => {
   //sound button:
   if (soundEnabled) await playButtonSound();
   await initializeAudio();


   // Convert inputValue to a number and pass it to generate
   let inputNumber = 5; // Make sure to convert the input to a number
   if (inputSize != "") {
     inputNumber = Number(inputSize);
   }
   if (!isNaN(inputNumber)) {
     // Clamp the value to max 10
     inputNumber = Math.min(Math.max(inputNumber, 0), 10);
     generate(inputNumber); // Pass the number to the generate function
     // Play generate sound after paths are generated
     setTimeout(() => {
       if (soundEnabled) playGenerateSound();
     }, 100);
   } else {
     generate(5); // Handle invalid number input
     // Play generate sound after paths are generated
     setTimeout(() => {
       if (soundEnabled) playGenerateSound();
     }, 100);
   }
 };


 // Function to be called when the button is clicked
 const handleClickRand = async () => {
   //sound button:
   if (soundEnabled) await playButtonSound();
   await initializeAudio();
   if (soundEnabled) await playGenerateSound();


   // Convert inputValue to a number and pass it to generate
   let inputNumber = 5; // Make sure to convert the input to a number
   if (inputSize != "") {
     inputNumber = Number(inputSize);
   }
   if (!isNaN(inputNumber)) {
     // Clamp the value to max 10
     inputNumber = Math.min(Math.max(inputNumber, 0), 10);
     generate_rand(inputNumber); // Pass the number to the generate function
   } else {
     generate_rand(5); // Handle invalid number input
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
           type="number"
           min="0"
           max="10"
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

       {/* Row 3: Remove Input and Remove Button */}
       {removebase && (
         <div style={{ display: "flex", gap: 8 }}>
           <input
             size={10}
             value={removeIndex}
             onChange={handleRemoveIndexChange}
             placeholder="Remove G#"
           />
           <button
             style={{
               width: 70,
               height: 28,
               fontSize: 13,
               backgroundColor: "transparent",
               border: "2px solid rgb(255, 100, 100)",
               color: "rgb(255, 100, 100)",
               cursor: "pointer",
               borderRadius: 4,
               transition: "0.3s",
             }}
             onClick={() => handleRemoveBase()}
           >
             Remove
           </button>
         </div>
       )}

       {/* Row 4: Generate Buttons */}
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


     {/* Word List Display / Custom Paths Display */}
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
       {generate_custom ? (
         <>
           <div style={{ fontWeight: "bold", color: "white", marginBottom: 4 }}>
             Custom Paths (Rank 1) <div></div>
             Press on a path to remove it.
           </div>
           {customExponents.length === 0 ? (
             <div>No paths added yet. Enter exponents and click Add.</div>
           ) : (
             customExponents.map((exp, i) => (
               <div
                 key={i}
                 style={{
                   whiteSpace: "nowrap",
                   overflowX: "auto",
                   marginBottom: 2,
                   cursor: "pointer",
                   transition: "opacity 0.2s",
                 }}
                 onClick={async () => {
                   if (soundEnabled) await playButtonSound();
                   setCustomExponents(customExponents.filter((_, idx) => idx !== i));
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.opacity = "0.6";
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.opacity = "1";
                 }}
               >
                 <strong>[Path {i + 1}]:</strong> {formatExponent(exp)}{" "}
                 {exp === 1 ? "(a)" : exp === -1 ? "(a⁻¹)" : exp === 0 ? "(identity)" : ""}
               </div>
             ))
           )}
         </>
       ) : (
         <>
           <div style={{ fontWeight: "bold", color: "white", marginBottom: 4 }}>
             Generators
           </div>
           {bases.length === 0 ? (
             <div>{defaultGeneratorsText}</div>
           ) : (
             bases.map((path, i) => (
               <div
                 key={i}
                 style={{
                   whiteSpace: "nowrap",
                   overflowX: "auto",
                   marginBottom: 2,
                   cursor: removebase ? "pointer" : "default",
                 }}
                 onClick={() => {
                   if (soundEnabled) {
                     playPathSound(path);
                   }
                 }}
                 onDoubleClick={() => {
                   if (removebase) {
                     handleRemoveBase(i);
                   }
                 }}
                 title={removebase ? "Click to play sound, double-click to remove" : undefined}
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
         </>
       )}
     </div>
   </>
 );
};


export default ButtonBar;


