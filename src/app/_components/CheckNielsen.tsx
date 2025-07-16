"use client";
import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import {
  Direction,
  reduceMoves,
  concatenate,
  invert,
} from "../utils/NielsenTrans";

interface CheckNielsenProps {
  movePaths: Direction[][];
  tutorialActive?: boolean;
  tutorialStep?: number;
  onTutorialCheck?: (step: number) => void;
}

const CheckNielsen: React.FC<CheckNielsenProps> = ({
  movePaths,
  tutorialActive = false,
  tutorialStep = 0,
  onTutorialCheck = () => {},
}) => {
  const [nStatus, setNStatus] = useState<boolean[]>([false, false, false]);
  const [result, setResult] = useState<string>("");
  const [emptyCnt,setEmptyCnt] = useState<number>(0);
  const [totalLen, setTotalLen] = useState<number>(0);
  const [isSoundInitialized, setSoundInitialized] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const previousPathsRef = useRef<Direction[][]>([]);
  const confettiCanvas = useRef<HTMLCanvasElement>(null);
  const confettiAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    setEmptyCnt(movePaths.filter((path) => path.length === 0).length);
    setTotalLen(movePaths.reduce((acc, path) => acc + path.length, 0));
    const status = checkNielsenReduced(movePaths);
    setNStatus(status);

    if (movePaths.length>0&&status.every((x) => x) && !showConfetti) {
      playSuccessSound();
      setShowConfetti(true);
    }
  }, [movePaths]);
  
  useEffect(() => {
    const initializeAudio = async () => {
      // Only initialize once
      if (!isSoundInitialized) {
        await Tone.start();
        console.log("Tone.js initialized");
        setSoundInitialized(true);
      }
    };

    // Add a one-time click listener to the document for initializing audio
    const handleFirstClick = () => {
      initializeAudio();
      document.removeEventListener("click", handleFirstClick);
    };

    document.addEventListener("click", handleFirstClick);
    
    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, [isSoundInitialized]);

  // Watch for paths that disappear (become 1)
  useEffect(() => {
    // Skip if no sound or if it's the first render
    if (!isSoundInitialized || previousPathsRef.current.length === 0) {
      previousPathsRef.current = [...movePaths];
      return;
    }

    // Check if any path disappeared
    const prevPaths = previousPathsRef.current.map(path => [...path]);
    const currentPaths = movePaths.map(path => [...path]);
    
    // Detect paths that were reduced to empty (became 1)
    prevPaths.forEach((prevPath, index) => {
      // If there was a path before that now is empty
      if (prevPath.length > 0 && 
          (index >= currentPaths.length || currentPaths[index].length === 0)) {
        playPoofSound();
      }
    });

    // Update ref for next comparison
    previousPathsRef.current = [...movePaths];
  }, [movePaths, isSoundInitialized]);

  // Confetti animation setup and cleanup
  useEffect(() => {
    if (showConfetti && confettiCanvas.current) {
      const canvas = confettiCanvas.current;
      const ctx = canvas.getContext('2d');

      
      if (!ctx) return;
      
      // Set canvas to full screen
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Create confetti particles
      const confettiCount = 300;
      const particles: Particle[] = [];
      
      interface Particle {
        x: number;
        y: number;
        size: number;
        color: string;
        speed: number;
        angle: number;
        rotation: number;
        rotationSpeed: number;
      }
      
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
                      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
      
      // Initialize particles
      for (let i = 0; i < confettiCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 100, // Start above screen
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 2,
          angle: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      
      // Animation function
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let particlesActive = false;
        
        particles.forEach(p => {
          // If particle is still on screen, consider animation active
          if (p.y < canvas.height + 100) {
            particlesActive = true;
          }
          
          // Update particle position
          p.y += p.speed;
          p.x += Math.sin(p.angle) * 1.5;
          p.rotation += p.rotationSpeed;
          p.angle += 0.01;
          
          // Draw particle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
        
        if (particlesActive) {
          confettiAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setShowConfetti(false);
        }
      };
      
      // Start animation
      confettiAnimationRef.current = requestAnimationFrame(animate);
      
      // Add resize handler
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        if (confettiAnimationRef.current) {
          cancelAnimationFrame(confettiAnimationRef.current);
        }
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showConfetti]);

  // Function to play success sound
  const playSuccessSound = () => {
    // Create a simple synth with happy sounding parameters
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // Play a major chord sequence
    synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", Tone.now());
    synth.triggerAttackRelease(["D4", "F#4", "A4"], "8n", Tone.now() + 0.2);
    synth.triggerAttackRelease(["G4", "B4", "D5"], "4n", Tone.now() + 0.4);
  };

  // Function to play fail sound
  const playFailSound = () => {
    // Create a simple synth with sad sounding parameters
    const synth = new Tone.Synth({
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();
    
    // Play a descending minor tone
    synth.triggerAttackRelease("C4", "8n", Tone.now());
    synth.triggerAttackRelease("A3", "8n", Tone.now() + 0.2);
  };

  // Function to play poof disappear sound
  const playPoofSound = () => {
    if (!isSoundInitialized) return;
    
    // Create noise + filter for whoosh effect
    const noise = new Tone.Noise("white").start();
    
    // Filter to shape the noise
    const filter = new Tone.Filter({
      type: "bandpass",
      frequency: 800,
      Q: 0.5
    });
    
    // Envelope for the filter frequency
    const filterEnv = new Tone.FrequencyEnvelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
      release: 0.2,
      baseFrequency: 800,
      octaves: 2,
      exponent: 2
    });
    
    // Volume envelope
    const ampEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    });
    
    // Connect everything
    noise.connect(filter);
    filter.connect(ampEnv);
    ampEnv.toDestination();
    filterEnv.connect(filter.frequency);
    
    // Trigger the envelopes
    ampEnv.triggerAttackRelease(0.4);
    filterEnv.triggerAttackRelease(0.4);
    
    // Stop the noise after the sound is done
    setTimeout(() => {
      noise.stop();
    }, 500);
    
    // Add a magical twinkling sound on top
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine"
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0,
        release: 0.3
      }
    }).toDestination();
    
    // Play some random high notes in quick succession
    const notes = ["C6", "E6", "G6", "B6", "D7"];
    for (let i = 0; i < 5; i++) {
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      synth.triggerAttackRelease(randomNote, "32n", Tone.now() + i * 0.05);
    }
  };

  function checkNielsenReduced(paths: Direction[][]): boolean[] {
    let result: boolean[] = [];
    //N0
    const reducedPaths = paths.map((p) => reduceMoves(p));
    result.push(true);
    for (let i = 0; i < reducedPaths.length; i++) {
      if (reducedPaths[i].length === 0) {
        result[0] = false;
        break;
      }
    }
    //N1

    result.push(true);
    for (let a = 0; a < reducedPaths.length; a++) {
      for (let b = 0; b < reducedPaths.length; b++) {
        if (a !== b) {
          let concatPath = concatenate(reducedPaths[a], reducedPaths[b]);
          let concatPath2 = concatenate(
            reducedPaths[a],
            invert(reducedPaths[b])
          );
          let concatPath3 = concatenate(
            invert(reducedPaths[a]),
            reducedPaths[b]
          );
          if (
            concatPath.length < reducedPaths[a].length ||
            concatPath.length < reducedPaths[b].length ||
            concatPath2.length < reducedPaths[a].length ||
            concatPath2.length < reducedPaths[b].length ||
            concatPath3.length < reducedPaths[a].length ||
            concatPath3.length < reducedPaths[b].length
          ) {
            result[1] = false;
            break;
          }
        }
      }
    }
    //N2
    result.push(true);
    for (let a = 0; a < reducedPaths.length; a++) {
      for (let b = 0; b < reducedPaths.length; b++) {
        for (let c = 0; c < reducedPaths.length; c++) {
          if (a !== b && a !== c && b !== c) {
            let concatPath = concatenate(
              concatenate(reducedPaths[a], reducedPaths[b]),
              reducedPaths[c]
            );
            let concatPath2 = concatenate(
              concatenate(reducedPaths[a], reducedPaths[b]),
              invert(reducedPaths[c])
            );
            let concatPath3 = concatenate(
              concatenate(reducedPaths[a], invert(reducedPaths[b])),
              reducedPaths[c]
            );
            let concatPath4 = concatenate(
              concatenate(reducedPaths[a], invert(reducedPaths[b])),
              invert(reducedPaths[c])
            );
            let concatPath5 = concatenate(
              concatenate(invert(reducedPaths[a]), reducedPaths[b]),
              reducedPaths[c]
            );
            let concatPath6 = concatenate(
              concatenate(invert(reducedPaths[a]), reducedPaths[b]),
              invert(reducedPaths[c])
            );
            let concatPath7 = concatenate(
              concatenate(invert(reducedPaths[a]), invert(reducedPaths[b])),
              reducedPaths[c]
            );

            if (
              concatPath.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length ||
              concatPath2.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length ||
              concatPath3.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length ||
              concatPath4.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length ||
              concatPath5.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length ||
              concatPath6.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length ||
              concatPath7.length <=
                reducedPaths[a].length -
                  reducedPaths[b].length +
                  reducedPaths[c].length  
            ) {
              result[2] = false;
              break;
            }
          }
        }
      }
    }
    return result;
  }

  const handleCheck = () => {
    check();
    if (tutorialStep === 7 && onTutorialCheck) {
      onTutorialCheck(8);
    }

    if (tutorialStep === 8 && onTutorialCheck) {
      const reducedConditionStatus = checkNielsenReduced(movePaths);
      const isSuccess = reducedConditionStatus.every((cond) => cond === true);
      if (isSuccess) {
        playSuccessSound();
        setShowConfetti(true);
        alert("🎉 Congrats! You have successfully reduced the paths!");
        onTutorialCheck(0);
      } else {
        playFailSound();
      }
      return;
    }
  };

  function check() {
    const reducedConditionStatus = checkNielsenReduced(movePaths);
    const isSuccess = reducedConditionStatus.every((condition) => condition === true);
    
    if (isSuccess) {
      setResult("Success: The word list satisfies Nielsen Reduced Form!");
      playSuccessSound();
      setShowConfetti(true);
    } else {
      let resultstatements = "Failure: ";
      if (reducedConditionStatus[0] === false) {
        resultstatements += " The word list does not satisfy N0. ";
      }
      if (reducedConditionStatus[1] === false) {
        resultstatements +=
          " The word list does not satisfy Nielsen condition N1. The words can be further shortened. ";
      }
      if (reducedConditionStatus[2] === false) {
        resultstatements += " The word list does not satisfy N2.";
      }
      setResult(resultstatements);
      playFailSound();
    }
  }

  return (
    <>
      {showConfetti && (
        <canvas
          ref={confettiCanvas}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "90%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "8px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          fontSize: "1.2rem",
          
        }}
      >
        {/* N0：空路径数 & 颜色 */}
        <div
        className="tip-row"
        title="Condition (N0) is : All paths must be non-empty."
        style={{
           color: nStatus[0] ? "limegreen" : "red" 
        }}>
          Nelisen Reduced Condition
          (N0)&nbsp;number&nbsp;of&nbsp;empty&nbsp;paths:&nbsp;{emptyCnt}
        </div>

        {/* N1：总长度 & 颜色 */}
        <div
        className="tip-row"
        title="Condition (N1) is : For any two distinct paths u and v, the concatenations uv, u v⁻¹, u⁻¹v must not be shorter than either u or v."
        style={{ color: nStatus[1] ? "limegreen" : "red" }}>
          (N1)&nbsp;{nStatus[1] ? "satisfied" : "not satisfied"};total&nbsp;path&nbsp;length:&nbsp;{totalLen}
        </div>

        {/* N2 单独一行 */}
        <div
        className="tip-row"
        title = "Condition (N2) is : For any three pairwise distinct paths u, v, w, every concatenation of the form u± v± w± must not be shorter than u."
        style={{ color: nStatus[2] ? "limegreen" : "red" }}>
          (N2)&nbsp;{nStatus[2] ? "satisfied" : "not satisfied"}
        </div>
      </div>
    </>
  );
};

export default CheckNielsen;