import { PRODUCTION_MODE, getParticipantVersion } from "./participantConfig";

export const GAME_PARAMS = {
  DRAIN_RATE: 0.5,
  ADD_AMOUNT: 20,
  MAX_LEVEL: 100,
  OPTIMAL_ZONE_MIN: 35,
  OPTIMAL_ZONE_MAX: 50,
  DANGER_UPPER: 90,
  DANGER_LOWER: 10,
  GAME_SPEED: 100,
  ROUND_DURATION: 15,
  MAX_ROUNDS: 36,
  INITIAL_VIAL_LEVEL: 50,
  INITIAL_BUCKET_LEVEL: 0,
  EMPTY_BUCKET_AMOUNT: 15,
  TRANSITION_TIME: 3000,
  SETPOINT: 50,
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
    SLOW: 1.6,
    MEDIUM: 1.8,
    FAST: 2.0,
  },
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
    SLOW: 1.6,
    MEDIUM: 1.8,
    FAST: 2.0,
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

export const VERSION_BUTTON_DELAYS = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: 300,
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: 0,
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: 200,
  [GAME_VERSIONS.TWO_VIALS_PHASES]: 200,
};

export const VERSION_DEPRIVATION_CONFIG = {
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
    minTimeUntilDisable: 2000,
    maxTimeUntilDisable: 4000,
    minDisableDuration: 4000,
    maxDisableDuration: 6000,
  },
  [GAME_VERSIONS.TWO_VIALS_PHASES]: {
    minTimeUntilDisable: 5000,
    maxTimeUntilDisable: 10000,
    minDisableDuration: 2000,
    maxDisableDuration: 4000,
  },
};

// Configuration for ONE_VIAL_ALTERNATING version
export const ONE_VIAL_ALTERNATING_CONFIG = {
  // Set to 'storage', 'no_storage', or null for random
  FORCE_START_PHASE: null,
};

// Configuration for phase-based versions
export const PHASE_CONFIG = {
  // Set to 'abundance', 'deprivation', or null for random
  FORCE_START_PHASE: null,
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

// Force a specific version (for development/debugging only)
// In production mode, this is ignored in favor of participant assignments
export const FORCE_VERSION = PRODUCTION_MODE
  ? null
  : GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET;

/**
 * Get the game version to use
 * In production: uses participant's assigned version
 * In development: uses FORCE_VERSION or random
 * @param {string} userId - Participant ID
 * @returns {string} Game version identifier
 */
export const getGameVersion = (userId = null) => {
  // In production mode, always use participant's assigned version
  if (PRODUCTION_MODE && userId) {
    const assignedVersion = getParticipantVersion(userId);
    if (assignedVersion) {
      console.log(`Using assigned version for ${userId}:`, assignedVersion);
      return assignedVersion;
    }
    console.warn(`No version assigned to ${userId}, using random`);
  }

  // In development mode, use FORCE_VERSION if set
  if (FORCE_VERSION) {
    console.log("Using forced version (dev mode):", FORCE_VERSION);
    return FORCE_VERSION;
  }

  // Fallback to random selection
  const randomVersion = selectRandomVersion();
  console.log("Using random version:", randomVersion);
  return randomVersion;
};

/**
 * Generate sequences based on game version
 * Returns: { velocitySequence, bucketSequence, phaseSequence }
 * @param {string} version - Game version identifier
 * @param {number} totalRounds - Total number of rounds
 * @param {object} customVelocities - Optional custom velocity config (for training mode)
 */
export const generateGameSequences = (
  version,
  totalRounds = 24,
  customVelocities = null,
) => {
  const versionConfig = VERSION_CONFIG[version];
  // Use custom velocities if provided, otherwise use default VERSION_VELOCITIES
  const velocities = customVelocities || VERSION_VELOCITIES[version];

  console.log("generateGameSequences - Using velocities:", velocities);

  switch (version) {
    case GAME_VERSIONS.ONE_VIAL_ALTERNATING:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateOneVialAlternatingBuckets(totalRounds),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
      };

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateConstantBuckets(totalRounds, 1),
        phaseSequence: generateAlternatingPhases(totalRounds, null, 4),
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
        phaseSequence: generateAlternatingPhases(totalRounds, "deprivation", 4),
      };

    default:
      throw new Error(`Unknown game version: ${version}`);
  }
};

// [Rest of the helper functions remain the same as in your original code]

const generateOneVialAlternatingBuckets = (totalRounds) => {
  const buckets = [];
  const roundsPerPhase = Math.floor(totalRounds / 4);

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
    startWithStorage ? "STORAGE" : "NO STORAGE",
  );

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

// const generatePhaseVelocities = (totalRounds, velocities, numPhases) => {
//   const velocityArray = [];
//   const roundsPerPhase = Math.floor(totalRounds / numPhases);
//   const velocityIterations = roundsPerPhase / 3;

//   for (let phase = 0; phase < numPhases; phase++) {
//     const phaseVelocities = [];
//     for (let iter = 0; iter < velocityIterations; iter++) {
//       phaseVelocities.push(velocities.SLOW);
//       phaseVelocities.push(velocities.MEDIUM);
//       phaseVelocities.push(velocities.FAST);
//     }

//     shuffleArray(phaseVelocities);
//     velocityArray.push(...phaseVelocities);
//   }

//   return velocityArray;
// };
const generatePhaseVelocities = (totalRounds, velocities, numPhases) => {
  const velocityArray = [];

  // Handle small round counts (like training mode with 2 rounds)
  if (totalRounds < numPhases) {
    // For very short games, just generate velocities in order for each round
    const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    for (let i = 0; i < totalRounds; i++) {
      velocityArray.push(velocityTypes[i % 3]);
    }
    shuffleArray(velocityArray);
    console.log(
      `Generated ${totalRounds} velocities for short game:`,
      velocityArray,
    );
    return velocityArray;
  }

  // Original logic for normal-length games
  const roundsPerPhase = Math.floor(totalRounds / numPhases);
  const velocityIterations = Math.floor(roundsPerPhase / 3);

  for (let phase = 0; phase < numPhases; phase++) {
    const phaseVelocities = [];

    // Generate velocity triplets
    for (let iter = 0; iter < velocityIterations; iter++) {
      phaseVelocities.push(velocities.SLOW);
      phaseVelocities.push(velocities.MEDIUM);
      phaseVelocities.push(velocities.FAST);
    }

    // Handle remaining rounds in this phase
    const remainingInPhase = roundsPerPhase - velocityIterations * 3;
    const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    for (let i = 0; i < remainingInPhase; i++) {
      phaseVelocities.push(velocityTypes[i % 3]);
    }

    shuffleArray(phaseVelocities);
    velocityArray.push(...phaseVelocities);
  }

  // Handle any remaining rounds due to rounding
  const remaining = totalRounds - velocityArray.length;
  const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
  for (let i = 0; i < remaining; i++) {
    velocityArray.push(velocityTypes[i % 3]);
  }

  console.log(
    `Generated ${velocityArray.length} velocities for ${totalRounds} rounds`,
  );
  return velocityArray;
};

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

const generateTwoVialSingleBucket = (totalRounds) => {
  const buckets = [];
  const numPhases = Math.floor(totalRounds / 6);
  const roundsPerPhase = Math.floor(totalRounds / 6);

  const bucketStates = [
    { vial1: 1, vial2: 0 },
    { vial1: 0, vial2: 1 },
    { vial1: 0, vial2: 0 },
  ];

  const firstIteration = [...bucketStates];
  shuffleArray(firstIteration);

  const secondIteration = [...bucketStates];
  shuffleArray(secondIteration);

  const phaseOrder = [...firstIteration, ...secondIteration];

  console.log(
    "Two Vials Single Bucket - Phase order:",
    phaseOrder.map((state, idx) => {
      if (state.vial1 === 1) return `Phase ${idx + 1}: Left`;
      if (state.vial2 === 1) return `Phase ${idx + 1}: Right`;
      return `Phase ${idx + 1}: Neither`;
    }),
  );

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
    { vial1: 1, vial2: 0 },
    { vial1: 0, vial2: 1 },
  ];

  for (let phase = 0; phase < numPhases; phase++) {
    const bucketPhase = [];
    const pairsNeeded = Math.floor(roundsPerPhase / 2);

    for (let i = 0; i < pairsNeeded; i++) {
      bucketPhase.push({ ...options[0] });
      bucketPhase.push({ ...options[1] });
    }

    if (roundsPerPhase % 2 !== 0) {
      const randomChoice = Math.floor(Math.random() * 2);
      bucketPhase.push({ ...options[randomChoice] });
    }

    shuffleArray(bucketPhase);
    buckets.push(...bucketPhase);
  }

  return buckets;
};

const generateConstantPhase = (totalRounds, phase = "abundance") => {
  const phases = [];
  for (let i = 0; i < totalRounds; i++) {
    phases.push(phase);
  }
  return phases;
};

const generateAlternatingPhases = (
  totalRounds,
  forceStartPhase = null,
  numPhases,
) => {
  const roundsPerPhase = Math.floor(totalRounds / numPhases);
  const phases = [];

  let startingPhase;
  const configuredPhase = PHASE_CONFIG.FORCE_START_PHASE || forceStartPhase;

  if (configuredPhase === "abundance" || configuredPhase === "deprivation") {
    startingPhase = configuredPhase;
    console.log("Using configured starting phase:", startingPhase);
  } else {
    startingPhase = Math.random() < 0.5 ? "abundance" : "deprivation";
    console.log("Randomly selected starting phase:", startingPhase);
  }

  const firstPhase = startingPhase;
  const secondPhase =
    startingPhase === "abundance" ? "deprivation" : "abundance";

  for (let i = 0; i < roundsPerPhase; i++) {
    phases.push(firstPhase);
  }

  for (let i = 0; i < roundsPerPhase; i++) {
    phases.push(secondPhase);
  }

  for (let i = 0; i < roundsPerPhase; i++) {
    phases.push(firstPhase);
  }

  const remainingRounds = totalRounds - roundsPerPhase * 3;
  for (let i = 0; i < remainingRounds; i++) {
    phases.push(secondPhase);
  }

  console.log(
    "Generated phase sequence (starting with",
    startingPhase + "):",
    phases,
  );

  return phases;
};

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

export const TRAINING_PARAMS = {
  MAX_ROUNDS: 10, // Number of practice rounds
  ROUND_DURATION: 15, // Seconds per round
  REQUIRED_SURVIVAL_RATE: 0.5, // 0.5 = 50% needed to pass

  VELOCITIES: {
    // Adjust these to make training easier/harder
    one_vial_alternating: {
      SLOW: 1.2, // Lower = easier
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    // ... other versions
  },
};
