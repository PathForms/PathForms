import * as Tone from "tone";

// Sound related constants
export const NOTES = ["C4", "D4", "E4", "G4", "A4"]; // Pentatonic scale notes
export const DIRECTION_NOTES = {
  up: "C5",
  down: "G4", 
  left: "E4",
  right: "A4",
};

// Global sound state
let isSoundInitialized = false;
let soundEnabled = false;

// Synth instances
let buttonSynth: Tone.Synth | null = null;
let addSynth: Tone.Synth | null = null;
let clearSynth: Tone.Synth | null = null;
let generateSynth: Tone.PolySynth | null = null;
let pathSynth: Tone.Synth | null = null;
let clickSynth: Tone.Synth | null = null;
let hoverSynth: Tone.Synth | null = null;
let stepTransitionSynth: Tone.Synth | null = null;

// Initialize all synths
export const initializeSynths = async () => {
  // Ensure audio context is ready before creating synths
  await initializeAudio();
  
  // Button click synth
  buttonSynth = new Tone.Synth({
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

  // Add sound synth
  addSynth = new Tone.Synth({
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

  // Clear sound synth
  clearSynth = new Tone.Synth({
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

  // Generate sound synth (polyphonic)
  generateSynth = new Tone.PolySynth(Tone.Synth).toDestination();

  // Path sound synth
  pathSynth = new Tone.Synth({
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

  // Click sound synth
  clickSynth = new Tone.Synth({
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
  }).toDestination();

  // Hover sound synth
  hoverSynth = new Tone.Synth({
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
    volume: -10, // Quieter than the click sound
  }).toDestination();

  // Step transition sound synth
  stepTransitionSynth = new Tone.Synth({
    oscillator: {
      type: "sine8", // More complex oscillator type for distinct sound
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.1,
      release: 0.5,
    },
    volume: -5,
  }).toDestination();
};

// Initialize audio context
export const initializeAudio = async () => {
  if (!isSoundInitialized) {
    await Tone.start();
    isSoundInitialized = true;
    console.log("Audio is ready");
  }
};

// Set sound enabled state
export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

// Get sound enabled state
export const getSoundEnabled = () => {
  return soundEnabled;
};

// Sound playing functions
export const playButtonSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  if (buttonSynth) {
    buttonSynth.triggerAttackRelease("C5", "16n", Tone.now() + 0.01);
  }
};

export const playAddSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  if (addSynth) {
    addSynth.triggerAttackRelease("E5", "16n", Tone.now() + 0.01);
  }
};

export const playClearSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  if (clearSynth) {
    clearSynth.triggerAttackRelease("A3", "8n", Tone.now() + 0.01);
  }
};

export const playGenerateSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  
  // Ensure synths are initialized before playing
  if (!generateSynth) {
    await initializeSynths();
  }
  
  if (generateSynth) {
    // Play a chord
    generateSynth.triggerAttackRelease(["C4", "E4", "G4"], "8n");

    // Play an arpeggio after generating
    setTimeout(() => {
      const notes = ["C4", "E4", "G4", "C5"];
      notes.forEach((note, i) => {
        setTimeout(() => {
          generateSynth?.triggerAttackRelease(note, "16n");
        }, i * 100);
      });
    }, 200);
  }
};

export const playPathSound = async (path: string[]) => {
  if (!soundEnabled || path.length === 0) return;
  await initializeAudio();
  
  if (pathSynth) {
    // Play notes sequentially based on the path
    path.forEach((direction, i) => {
      const note = DIRECTION_NOTES[direction as keyof typeof DIRECTION_NOTES] || "C4";
      setTimeout(() => {
        pathSynth?.triggerAttackRelease(note, "16n");
      }, i * 150);
    });
  }
};

export const playClickSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  if (clickSynth) {
    clickSynth.triggerAttackRelease("C5", "32n", Tone.now() + 0.01);
  }
};

export const playHoverSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  if (hoverSynth) {
    // Use Tone.now() + small offset to ensure unique timing
    hoverSynth.triggerAttackRelease("G4", "32n", Tone.now() + 0.01);
  }
};

export const playStepTransitionSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  if (stepTransitionSynth) {
    // Play a pleasant "ding" sound
    stepTransitionSynth.triggerAttackRelease("E5", "8n", Tone.now() + 0.01);
  }
};

export const playSuccessSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  
  // Create a polyphonic synth for success sound
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  
  // Play a major chord sequence
  synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", Tone.now());
  synth.triggerAttackRelease(["D4", "F#4", "A4"], "8n", Tone.now() + 0.2);
  synth.triggerAttackRelease(["G4", "B4", "D5"], "4n", Tone.now() + 0.4);
};

export const playFailSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  
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

export const playPoofSound = async () => {
  if (!soundEnabled) return;
  await initializeAudio();
  
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

// Cleanup function to dispose all synths
export const cleanupSynths = () => {
  const synths = [buttonSynth, addSynth, clearSynth, generateSynth, pathSynth, clickSynth, hoverSynth, stepTransitionSynth];
  
  synths.forEach(synth => {
    if (synth) {
      synth.dispose();
    }
  });
  
  // Reset references
  buttonSynth = null;
  addSynth = null;
  clearSynth = null;
  generateSynth = null;
  pathSynth = null;
  clickSynth = null;
  hoverSynth = null;
  stepTransitionSynth = null;
  
  isSoundInitialized = false;
};
