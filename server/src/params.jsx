// Game Parameters
export const GAME_PARAMS = {
  DRAIN_RATE: 0.5,
  ADD_AMOUNT: 5,
  MAX_LEVEL: 100,
  OPTIMAL_ZONE_MIN: 35,
  OPTIMAL_ZONE_MAX: 50,
  DANGER_UPPER: 90,
  DANGER_LOWER: 10,
  GAME_SPEED: 100,
  ROUND_DURATION: 5,
  MAX_ROUNDS: 36,
  INITIAL_VIAL_LEVEL: 50,
  INITIAL_BUCKET_LEVEL: 0,
  EMPTY_BUCKET_AMOUNT: 15,
  TRANSITION_TIME: 3000,
};

export const getZonePercentages = () => {
  const {
    DANGER_LOWER,
    OPTIMAL_ZONE_MIN,
    OPTIMAL_ZONE_MAX,
    DANGER_UPPER,
    MAX_LEVEL,
  } = GAME_PARAMS;

  return {
    dangerLowerHeight: DANGER_LOWER,
    warningLowerHeight: OPTIMAL_ZONE_MIN - DANGER_LOWER,
    optimalHeight: OPTIMAL_ZONE_MAX - OPTIMAL_ZONE_MIN,
    warningUpperHeight: DANGER_UPPER - OPTIMAL_ZONE_MAX,
    dangerUpperHeight: MAX_LEVEL - DANGER_UPPER,
  };
};

// Drain rate configurations
export const DRAIN_RATES = {
  SLOW: 0.6,
  MEDIUM: 0.8,
  FAST: 1,
};

// Game Version Definitions
export const GAME_VERSIONS = {
  ONE_VIAL_ALTERNATING: "one_vial_alternating",
  ONE_VIAL_ALWAYS_BUCKET: "one_vial_always_bucket",
  TWO_VIALS_SINGLE_BUCKET: "two_vials_single_bucket",
  TWO_VIALS_PHASES: "two_vials_phases",
};

// Version Configuration
export const VERSION_CONFIG = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: {
    name: "One Vial - Alternating Bucket",
    description: "Single vial that alternates between having storage and not",
    numVials: 1,
    hasPhases: false,
    bucketBehavior: "alternating",
    enabled: true,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
    name: "One Vial - Always Bucket",
    description: "Single vial that always has storage",
    numVials: 1,
    hasPhases: true,
    bucketBehavior: "always",
    enabled: true,
  },

  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: {
    name: "Two Vials - Single Bucket",
    description: "Two vials where at most one has storage at a time",
    numVials: 2,
    hasPhases: false,
    bucketBehavior: "single_alternating",
    enabled: true,
  },

  [GAME_VERSIONS.TWO_VIALS_PHASES]: {
    name: "Two Vials - Phases",
    description:
      "Two vials with abundance/deprivation phases and varying storage",
    numVials: 2,
    hasPhases: true,
    bucketBehavior: "dynamic",
    enabled: true,
  },
};

// Version-specific velocity configurations
export const VERSION_VELOCITIES = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: {
    SLOW: 0.5,
    MEDIUM: 0.7,
    FAST: 0.9,
  },
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
    SLOW: 0.6,
    MEDIUM: 0.8,
    FAST: 1.0,
  },
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: {
    SLOW: 0.6,
    MEDIUM: 0.8,
    FAST: 1.0,
  },
  [GAME_VERSIONS.TWO_VIALS_PHASES]: {
    SLOW: 0.6,
    MEDIUM: 0.8,
    FAST: 1.0,
  },
};

// Configuration for ONE_VIAL_ALTERNATING version
export const ONE_VIAL_ALTERNATING_CONFIG = {
  // Set to 'storage', 'no_storage', or null for random
  FORCE_START_PHASE: null, // Change to 'storage' or 'no_storage' to force a starting phase
};
// Configuration for phase-based versions (ONE_VIAL_ALWAYS_BUCKET and TWO_VIALS_PHASES)
export const PHASE_CONFIG = {
  // Set to 'abundance', 'deprivation', or null for random
  FORCE_START_PHASE: null, // Change to 'abundance' or 'deprivation' to force a starting phase
};
// Get list of enabled versions
export const getEnabledVersions = () => {
  return Object.entries(VERSION_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([versionId, _]) => versionId);
};

// Randomly select a version from enabled versions
export const selectRandomVersion = () => {
  const enabledVersions = getEnabledVersions();
  const randomIndex = Math.floor(Math.random() * enabledVersions.length);
  return enabledVersions[randomIndex];
};

// Force a specific version (for testing/debugging)
// export const FORCE_VERSION = GAME_VERSIONS.ONE_VIAL_ALTERNATING;
// export const FORCE_VERSION = GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET;
// export const FORCE_VERSION = GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET;
export const FORCE_VERSION = GAME_VERSIONS.TWO_VIALS_PHASES;
// export const FORCE_VERSION = null; // Set to null for random

// Get the version to use
export const getGameVersion = () => {
  return FORCE_VERSION || selectRandomVersion();
};

/**
 * Generate sequences based on game version
 * Returns: { velocitySequence, bucketSequence, phaseSequence }
 */
export const generateGameSequences = (version, totalRounds = 24) => {
  const versionConfig = VERSION_CONFIG[version];
  const velocities = VERSION_VELOCITIES[version];

  switch (version) {
    case GAME_VERSIONS.ONE_VIAL_ALTERNATING:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateOneVialAlternatingBuckets(totalRounds),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
      };

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET:
      return {
        // velocitySequence: generateVelocitySequence(
        //   totalRounds,
        //   "varied",
        //   velocities
        // ),
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateConstantBuckets(totalRounds, 1),
        phaseSequence: generateAlternatingPhases(totalRounds, null),
      };

    case GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 6),
        bucketSequence: generateTwoVialSingleBucket(totalRounds),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
      };

    case GAME_VERSIONS.TWO_VIALS_PHASES:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateDynamicBuckets(totalRounds, 4),
        phaseSequence: generateAlternatingPhases(totalRounds, "deprivation"),
      };

    default:
      throw new Error(`Unknown game version: ${version}`);
  }
};

/**
 * Generate bucket sequence for one vial alternating (Version 1)
 * 4 phases of 6 rounds each: storage -> no storage -> storage -> no storage
 * Can randomize or force starting phase
 */
const generateOneVialAlternatingBuckets = (totalRounds) => {
  const buckets = [];
  const roundsPerPhase = Math.floor(totalRounds / 4);

  // Determine starting phase (randomize or force)
  let startWithStorage;
  if (ONE_VIAL_ALTERNATING_CONFIG.FORCE_START_PHASE === "storage") {
    startWithStorage = true;
  } else if (ONE_VIAL_ALTERNATING_CONFIG.FORCE_START_PHASE === "no_storage") {
    startWithStorage = false;
  } else {
    startWithStorage = Math.random() < 0.5;
  }

  console.log(
    "One Vial Alternating - Starting with:",
    startWithStorage ? "STORAGE" : "NO STORAGE"
  );

  // Generate 4 phases
  for (let phase = 0; phase < 4; phase++) {
    const hasStorage = phase % 2 === 0 ? startWithStorage : !startWithStorage;

    for (let i = 0; i < roundsPerPhase; i++) {
      buckets.push({
        vial1: hasStorage ? 1 : 0,
        vial2: 0,
      });
    }
  }

  return buckets;
};

/**
 * Generate velocity sequence for one vial alternating
 * Each phase has 2 of each velocity (slow, medium, fast) shuffled randomly
 */
const generatePhaseVelocities = (totalRounds, velocities, numPhases) => {
  const velocityArray = [];
  const roundsPerPhase = Math.floor(totalRounds / numPhases); // 6 rounds per phase
  const velocityIterations = roundsPerPhase / 3;

  // Generate velocities for each phase
  for (let phase = 0; phase < 4; phase++) {
    const phaseVelocities = [];
    for (let iter = 0; iter < velocityIterations; iter++) {
      phaseVelocities.push(velocities.SLOW);
      phaseVelocities.push(velocities.MEDIUM);
      phaseVelocities.push(velocities.FAST);
    }

    // Shuffle this phase's velocities
    shuffleArray(phaseVelocities);

    // Add to main array
    velocityArray.push(...phaseVelocities);
  }

  return velocityArray;
};

/**
 * Generate velocity sequence
 * mode: "constant", "varied", "increasing"
 * velocities: object with SLOW, MEDIUM, FAST values
 */
const generateVelocitySequence = (totalRounds, mode = "varied", velocities) => {
  const velocityArray = [];

  if (mode === "constant") {
    for (let i = 0; i < totalRounds; i++) {
      velocityArray.push(velocities.MEDIUM);
    }
  } else if (mode === "varied") {
    const rateArray = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    // Each rate appears totalRounds/3 times
    const perRate = Math.floor(totalRounds / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < perRate; j++) {
        velocityArray.push(rateArray[i]);
      }
    }
    // Fill remaining rounds
    while (velocityArray.length < totalRounds) {
      velocityArray.push(rateArray[velocityArray.length % 3]);
    }
    // Shuffle
    shuffleArray(velocityArray);
  } else if (mode === "increasing") {
    for (let i = 0; i < totalRounds; i++) {
      if (i < totalRounds / 3) {
        velocityArray.push(velocities.SLOW);
      } else if (i < (2 * totalRounds) / 3) {
        velocityArray.push(velocities.MEDIUM);
      } else {
        velocityArray.push(velocities.FAST);
      }
    }
  }

  return velocityArray;
};

/**
 * Bucket sequence for one vial always having bucket
 */
const generateConstantBuckets = (totalRounds, vialNumber = 1) => {
  const buckets = [];
  for (let i = 0; i < totalRounds; i++) {
    buckets.push({
      vial1: vialNumber === 1 ? 1 : 0,
      vial2: 0,
    });
  }
  return buckets;
};

/**
 * Two vials, single bucket alternating between them or neither
 * 6 phases total (2 iterations of 3 bucket states in randomized order)
 * Each phase lasts totalRounds/6 rounds
 */
const generateTwoVialSingleBucket = (totalRounds) => {
  const buckets = [];
  const numPhases = Math.floor(totalRounds / 6);
  const roundsPerPhase = Math.floor(totalRounds / 6);

  // Define the three bucket states
  const bucketStates = [
    { vial1: 1, vial2: 0 }, // Left has bucket
    { vial1: 0, vial2: 1 }, // Right has bucket
    { vial1: 0, vial2: 0 }, // Neither has bucket
  ];

  // Create randomized order for first iteration
  const firstIteration = [...bucketStates];
  shuffleArray(firstIteration);

  // Create randomized order for second iteration
  const secondIteration = [...bucketStates];
  shuffleArray(secondIteration);

  // Combine both iterations
  const phaseOrder = [...firstIteration, ...secondIteration];

  console.log(
    "Two Vials Single Bucket - Phase order:",
    phaseOrder.map((state, idx) => {
      if (state.vial1 === 1) return `Phase ${idx + 1}: Left`;
      if (state.vial2 === 1) return `Phase ${idx + 1}: Right`;
      return `Phase ${idx + 1}: Neither`;
    })
  );

  // Generate bucket sequence based on phase order
  for (let phase = 0; phase < numPhases; phase++) {
    const bucketState = phaseOrder[phase];
    for (let i = 0; i < roundsPerPhase; i++) {
      buckets.push({ ...bucketState });
    }
  }

  return buckets;
};

const generateDynamicBuckets = (totalRounds, numPhases) => {
  const buckets = [];
  const roundsPerPhase = Math.floor(totalRounds / numPhases);
  const options = [
    { vial1: 1, vial2: 0 }, // Left has bucket
    { vial1: 0, vial2: 1 }, // Right has bucket
  ];

  for (let phase = 0; phase < numPhases; phase++) {
    const bucketPhase = [];
    const pairsNeeded = Math.floor(roundsPerPhase / 2);

    // Add pairs of left and right buckets
    for (let i = 0; i < pairsNeeded; i++) {
      bucketPhase.push({ ...options[0] });
      bucketPhase.push({ ...options[1] });
    }

    // If odd number of rounds, add one more randomly
    if (roundsPerPhase % 2 !== 0) {
      const randomChoice = Math.floor(Math.random() * 2);
      bucketPhase.push({ ...options[randomChoice] });
    }

    shuffleArray(bucketPhase);
    buckets.push(...bucketPhase);
  }

  return buckets;
};

/**
 * Generate constant phase
 */
const generateConstantPhase = (totalRounds, phase = "abundance") => {
  const phases = [];
  for (let i = 0; i < totalRounds; i++) {
    phases.push(phase);
  }
  return phases;
};

/**
 * Generate alternating phases
 * @param {number} totalRounds - Total number of rounds
 * @param {string} forceStartPhase - 'abundance', 'deprivation', or null for random
 */
const generateAlternatingPhases = (totalRounds, forceStartPhase = null) => {
  const roundsPerPhase = Math.floor(totalRounds / 4);
  const phases = [];

  // Determine starting phase based on PHASE_CONFIG or parameter
  let startingPhase;
  const configuredPhase = PHASE_CONFIG.FORCE_START_PHASE || forceStartPhase;

  if (configuredPhase === "abundance" || configuredPhase === "deprivation") {
    startingPhase = configuredPhase;
    console.log("Using configured starting phase:", startingPhase);
  } else {
    // Random selection
    startingPhase = Math.random() < 0.5 ? "abundance" : "deprivation";
    console.log("Randomly selected starting phase:", startingPhase);
  }

  // Determine which phase comes first and second
  const firstPhase = startingPhase;
  const secondPhase =
    startingPhase === "abundance" ? "deprivation" : "abundance";

  // First quarter
  for (let i = 0; i < roundsPerPhase; i++) {
    phases.push(firstPhase);
  }

  // Second quarter
  for (let i = 0; i < roundsPerPhase; i++) {
    phases.push(secondPhase);
  }

  // Third quarter
  for (let i = 0; i < roundsPerPhase; i++) {
    phases.push(firstPhase);
  }

  // Fourth quarter (fill remaining)
  const remainingRounds = totalRounds - roundsPerPhase * 3;
  for (let i = 0; i < remainingRounds; i++) {
    phases.push(secondPhase);
  }

  console.log(
    "Generated phase sequence (starting with",
    startingPhase + "):",
    phases
  );

  return phases;
};

// Utility function for shuffling
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Game messages
export const GAME_MESSAGES = {
  PLAYING: "Keep both vials at healthy level!",
  GAME_COMPLETE: "Congratulations! You completed all rounds!",
};

// Button labels
export const BUTTON_LABELS = {
  ADD_VIAL_1: "Add to Vial 1",
  ADD_VIAL_2: "Add to Vial 2",
  EMPTY_BUCKET: "Empty Bucket",
  RESTART: "Restart Game",
  TOGGLE_WITH_BUCKET: "Play Without Bucket",
  TOGGLE_WITHOUT_BUCKET: "Play With Bucket",
};

// Instructions text
export const INSTRUCTIONS = {
  INTRO: "How to play:",
  COMMON: "Vials constantly drain. Use keyboard controls to play:",
  CONTROLS_BASE: "← Left Arrow: Add to Vial 1 | → Right Arrow: Add to Vial 2",
  CONTROLS_WITH_BUCKET: " | ↑ Up Arrow: Empty Bucket",
  ENDING: "Survive each round to earn points!",
};
