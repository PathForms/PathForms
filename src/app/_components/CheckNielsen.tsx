"use client";
import React, { useState } from "react";
import {Direction, reduceMoves,concatenate, invert} from "../utils/NielsenTrans";

interface CheckNielsenProps {
  movePaths: Direction[][];
}


const CheckNielsen: React.FC<CheckNielsenProps> = ({ movePaths }) => {
  const [result, setResult] = useState<string>("");

  function checkNielsenReduced(paths: Direction[][]): boolean[] {
    let result: boolean[] = [];
    //N0
    const reducedPaths = paths.map((p) => reduceMoves(p));
    result.push(true)
    for (let i = 0; i < reducedPaths.length; i++) {
      if (reducedPaths[i].length === 0) {
        result[0] = false;
        break;
      }
    }
    //N1

    result.push(true)
    for (let a = 0; a < reducedPaths.length; a++) {
      for (let b = 0 ; b < reducedPaths.length; b++) {
        if (a !== b) {
           let concatPath =concatenate(reducedPaths[a], reducedPaths[b]);
           let concatPath2 =concatenate(reducedPaths[a], invert(reducedPaths[b]));
           if (concatPath.length < reducedPaths[a].length 
            || concatPath.length < reducedPaths[b].length
            || concatPath2.length < reducedPaths[a].length
            || concatPath2.length < reducedPaths[b].length) {
             result[1] = false;
             break;
           }
        }
      }
    }
    //N2
    result.push(true)
    for (let a = 0; a < reducedPaths.length; a++) {
      for (let b = 0 ; b < reducedPaths.length; b++) {
        for (let c = 0 ; c < reducedPaths.length; c++) {
          if (a !== b && a !== c && b !== c) {
             let concatPath =concatenate(concatenate(reducedPaths[a], reducedPaths[b]), reducedPaths[c]);
             let concatPath2 =concatenate(concatenate(reducedPaths[a], reducedPaths[b]), invert(reducedPaths[c]));
             let concatPath3 =concatenate(concatenate(reducedPaths[a], invert(reducedPaths[b])), reducedPaths[c]);
             let concatPath4 =concatenate(concatenate(reducedPaths[a], invert(reducedPaths[b])), invert(reducedPaths[c]));
             if (concatPath.length <= reducedPaths[a].length - reducedPaths[b].length + reducedPaths[c].length
              || concatPath2.length <= reducedPaths[a].length - reducedPaths[b].length + reducedPaths[c].length
              || concatPath3.length <= reducedPaths[a].length - reducedPaths[b].length + reducedPaths[c].length
              || concatPath4.length <= reducedPaths[a].length - reducedPaths[b].length + reducedPaths[c].length
             ) {
               result[2] = false;
               break;
             }
          }
        }
      }
    }


    return result
  }



  const handleCheck = () => {
    const reducedConditionStatus = checkNielsenReduced(movePaths);
    if (reducedConditionStatus.every(condition => condition === true)) {
      setResult("Success: The word list satisfies Nielsen Reduced Form!");
    } else {
      let resultstatements = "Failure: "
      if (reducedConditionStatus[0] === false) {
        resultstatements += " The word list does not satisfy N0. ";
      }  
      if (reducedConditionStatus[1] === false) {
        resultstatements +=" The word list does not satisfy N1.";
      }  
      if (reducedConditionStatus[2] === false) {
        resultstatements +="The word list does not satisfy N2.";
      }
      setResult(resultstatements);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "70%",
        left: "90%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        fontSize: "0.8rem"
      }}
    >
      <button
        id="checkBtn"
        style={{
          height: "35px",
          width: "100%",
          fontSize: "14px",
          cursor: "pointer",
          borderRadius: "4px",
          transition: "0.1s ease-in-out",
          backgroundColor: "transparent",
          color: "rgb(13, 255, 0)",
          borderColor: "rgb(13, 255, 0)",
        }}
        onClick={handleCheck}
      >
        Check
      </button>
      {result && <p style={{ margin: 0, textAlign: "center" }}>{result}</p>}
    </div>
  );
};

export default CheckNielsen;


