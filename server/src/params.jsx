export const GAME_PARAMS = {
  DRAIN_RATE: 0.5,
  ADD_AMOUNT: 10,
  MAX_LEVEL: 100,
  OPTIMAL_ZONE_MIN: 35,
  OPTIMAL_ZONE_MAX: 50,
  DANGER_UPPER: 90,
  DANGER_LOWER: 10,
  GAME_SPEED: 100,
  ROUND_DURATION: 15,
  MAX_ROUNDS: 3,
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

// ============================================================================
// GAME VERSION DEFINITIONS
// Note: version strings here correspond to the values in VERSION_CODE_MAP
// in participantConfig.js. If you add a version, update both files.
//
//   URL code  →  version key (here)
//   0.1       →  one_vial_alternating
//   0.2       →  one_vial_always_bucket
//   0.3       →  one_vial_always_bucket_simple
//   0.4       →  one_vial_always_bucket_simple_fast
//   0.5       →  two_vials_single_bucket
//   0.6       →  two_vials_phases
// ============================================================================
export const GAME_VERSIONS = {
  ONE_VIAL_ALTERNATING: "one_vial_alternating",
  ONE_VIAL_ALWAYS_BUCKET: "one_vial_always_bucket",
  ONE_VIAL_ALWAYS_BUCKET_SIMPLE: "one_vial_always_bucket_simple",
  ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST: "one_vial_always_bucket_simple_fast",
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

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: {
    name: "One Vial - Simple Storage",
    description:
      "Single vial with constant storage and no phases - simplified version",
    numVials: 1,
    hasPhases: false,
    bucketBehavior: "always",
    allowUnrestrictedBucketFilling: true,
    enabled: true,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: {
    name: "One Vial - Simple Storage Fast",
    description:
      "Single vial with constant storage and no phases - simplified version",
    numVials: 1,
    hasPhases: false,
    bucketBehavior: "always",
    allowUnrestrictedBucketFilling: true,
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
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: {
    SLOW: 1.6,
    MEDIUM: 1.8,
    FAST: 2.0,
  },
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: {
    SLOW: 2.6,
    MEDIUM: 2.8,
    FAST: 3.0,
  },
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: {
    SLOW: 1.6,
    MEDIUM: 1.8,
    FAST: 2.0,
  },
  [GAME_VERSIONS.TWO_VIALS_PHASES]: {
    SLOW: 1.6,
    MEDIUM: 1.8,
    FAST: 2.0,
  },
};

export const VERSION_BUTTON_DELAYS = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: 0,
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: 0,
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: 0,
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: 0,
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: 0,
  [GAME_VERSIONS.TWO_VIALS_PHASES]: 0,
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
    .map(([versionId]) => versionId);
};

/**
 * Generate sequences based on game version.
 * Returns: { velocitySequence, bucketSequence, phaseSequence }
 * @param {string} version - Game version identifier (resolved from URL code)
 * @param {number} totalRounds - Total number of rounds
 * @param {object} customVelocities - Optional custom velocity config (for training mode)
 */
export const generateGameSequences = (
  version,
  totalRounds = 24,
  customVelocities = null,
) => {
  const velocities = customVelocities || VERSION_VELOCITIES[version];

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

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateConstantBuckets(totalRounds, 1),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
      };

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST:
      return {
        velocitySequence: generatePhaseVelocities(totalRounds, velocities, 4),
        bucketSequence: generateConstantBuckets(totalRounds, 1),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
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

// ============================================================================
// SEQUENCE HELPERS
// ============================================================================

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

  for (let phase = 0; phase < 4; phase++) {
    const hasStorage = phase % 2 === 0 ? startWithStorage : !startWithStorage;
    for (let i = 0; i < roundsPerPhase; i++) {
      buckets.push({ vial1: hasStorage ? 1 : 0, vial2: 0 });
    }
  }

  return buckets;
};

const generatePhaseVelocities = (totalRounds, velocities, numPhases) => {
  const velocityArray = [];

  if (totalRounds < numPhases) {
    const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    for (let i = 0; i < totalRounds; i++) {
      velocityArray.push(velocityTypes[i % 3]);
    }
    shuffleArray(velocityArray);
    return velocityArray;
  }

  const roundsPerPhase = Math.floor(totalRounds / numPhases);
  const velocityIterations = Math.floor(roundsPerPhase / 3);

  for (let phase = 0; phase < numPhases; phase++) {
    const phaseVelocities = [];

    for (let iter = 0; iter < velocityIterations; iter++) {
      phaseVelocities.push(velocities.SLOW);
      phaseVelocities.push(velocities.MEDIUM);
      phaseVelocities.push(velocities.FAST);
    }

    const remainingInPhase = roundsPerPhase - velocityIterations * 3;
    const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    for (let i = 0; i < remainingInPhase; i++) {
      phaseVelocities.push(velocityTypes[i % 3]);
    }

    shuffleArray(phaseVelocities);
    velocityArray.push(...phaseVelocities);
  }

  const remaining = totalRounds - velocityArray.length;
  const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
  for (let i = 0; i < remaining; i++) {
    velocityArray.push(velocityTypes[i % 3]);
  }

  return velocityArray;
};

const generateConstantBuckets = (totalRounds, vialNumber = 1) => {
  const buckets = [];
  for (let i = 0; i < totalRounds; i++) {
    buckets.push({ vial1: vialNumber === 1 ? 1 : 0, vial2: 0 });
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
      bucketPhase.push({ ...options[Math.floor(Math.random() * 2)] });
    }

    shuffleArray(bucketPhase);
    buckets.push(...bucketPhase);
  }

  return buckets;
};

const generateConstantPhase = (totalRounds, phase = "abundance") => {
  return Array(totalRounds).fill(phase);
};

const generateAlternatingPhases = (
  totalRounds,
  forceStartPhase = null,
  numPhases,
) => {
  const roundsPerPhase = Math.floor(totalRounds / numPhases);
  const phases = [];

  const configuredPhase = PHASE_CONFIG.FORCE_START_PHASE || forceStartPhase;
  const startingPhase =
    configuredPhase === "abundance" || configuredPhase === "deprivation"
      ? configuredPhase
      : Math.random() < 0.5
        ? "abundance"
        : "deprivation";

  const firstPhase = startingPhase;
  const secondPhase =
    startingPhase === "abundance" ? "deprivation" : "abundance";

  for (let i = 0; i < roundsPerPhase; i++) phases.push(firstPhase);
  for (let i = 0; i < roundsPerPhase; i++) phases.push(secondPhase);
  for (let i = 0; i < roundsPerPhase; i++) phases.push(firstPhase);

  const remainingRounds = totalRounds - roundsPerPhase * 3;
  for (let i = 0; i < remainingRounds; i++) phases.push(secondPhase);

  return phases;
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// ============================================================================
// GAME MESSAGES / LABELS
// ============================================================================

export const GAME_MESSAGES = {
  PLAYING: "Keep both vials at healthy level!",
  GAME_COMPLETE: "Congratulations! You completed all rounds!",
};

export const BUTTON_LABELS = {
  ADD_VIAL_1: "Add to Vial 1",
  ADD_VIAL_2: "Add to Vial 2",
  EMPTY_BUCKET: "Empty Bucket",
  RESTART: "Restart Game",
  TOGGLE_WITH_BUCKET: "Play Without Bucket",
  TOGGLE_WITHOUT_BUCKET: "Play With Bucket",
};

export const INSTRUCTIONS = {
  INTRO: "How to play:",
  COMMON: "Vials constantly drain. Use keyboard controls to play:",
  CONTROLS_BASE: "← Left Arrow: Add to Vial 1 | → Right Arrow: Add to Vial 2",
  CONTROLS_WITH_BUCKET: " | ↑ Up Arrow: Empty Bucket",
  ENDING: "Survive each round to earn points!",
};

export const TRAINING_PARAMS = {
  MAX_ROUNDS: 10,
  ROUND_DURATION: 15,
  REQUIRED_SURVIVAL_RATE: 0.5,

  VELOCITIES: {
    one_vial_alternating: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    one_vial_always_bucket_simple: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
  },
};

// ============================================================================
// POST-GAME REDIRECT URLS
// After the main game ends, participants are sent to a version-specific link.
// Update the placeholder URLs below before deploying.
// Keyed by the same internal version strings used throughout the app.
// ============================================================================
export const GAME_COMPLETE_REDIRECT_URL = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]:
    "https://brown.co1.qualtrics.com/jfe/form/SV_cLObwj6KBpKvEF0",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]:
    "https://brown.co1.qualtrics.com/jfe/form/SV_9mErNW5zeKEL0SW",
  // [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]:
  //   "https://your-survey.com/redirect/0.3",
  // [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]:
  //   "https://your-survey.com/redirect/0.4",
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]:
    "https://brown.co1.qualtrics.com/jfe/form/SV_9z9tplZtesJSya2",
  [GAME_VERSIONS.TWO_VIALS_PHASES]:
    "https://brown.co1.qualtrics.com/jfe/form/SV_42ajRjRdYhvv7xA",
};

export const FAIL_INSTRUCTIONS_REDIRECT_URL = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]:
    "https://app.prolific.com/submissions/complete?cc=C1FVK0JA",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]:
    "https://app.prolific.com/submissions/complete?cc=C11L3B0C",
  // [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]:
  //   "https://your-survey.com/redirect/0.3",
  // [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]:
  //   "https://your-survey.com/redirect/0.4",
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]:
    "https://app.prolific.com/submissions/complete?cc=C1DTFOCP",
  [GAME_VERSIONS.TWO_VIALS_PHASES]:
    "https://app.prolific.com/submissions/complete?cc=CPU6RVTR",
};

export const FAIL_TRAINING_REDIRECT_URL = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]:
    "https://app.prolific.com/submissions/complete?cc=CQVYF7F2",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]:
    "https://app.prolific.com/submissions/complete?cc=C1AWOSIL",
  // [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]:
  //   "https://your-survey.com/redirect/0.3",
  // [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]:
  //   "https://your-survey.com/redirect/0.4",
  [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]:
    "https://app.prolific.com/submissions/complete?cc=C1G6HUCS",
  [GAME_VERSIONS.TWO_VIALS_PHASES]:
    "https://app.prolific.com/submissions/complete?cc=C1G7YBS3",
};

// ============================================================================
// VERSION REDIRECT URLS
// Shown on the termination screen when a participant reloads during the
// experiment. Set a version-specific URL so they land on the right
// follow-up page for their condition. Update the placeholder URLs below.
// ============================================================================
export const RELOAD_REDIRECT_URLS_GENERAL = {
  one_vial_alternating:
    "https://app.prolific.com/submissions/complete?cc=CDUWLNWZ",
  one_vial_always_bucket:
    "https://app.prolific.com/submissions/complete?cc=C1M6NFW7",
  // one_vial_always_bucket_simple: "https://your-survey.com/redirect/0.3",
  // one_vial_always_bucket_simple_fast: "https://your-survey.com/redirect/0.4",
  two_vials_single_bucket:
    "https://app.prolific.com/submissions/complete?cc=C1HX2EFH",
  two_vials_phases: "https://app.prolific.com/submissions/complete?cc=C1FJ139N",
};
export const RELOAD_REDIRECT_URLS_MAIN_GAME = {
  one_vial_alternating:
    "https://app.prolific.com/submissions/complete?cc=C1D2NK2X",
  one_vial_always_bucket:
    "https://app.prolific.com/submissions/complete?cc=C12Y7MTD",
  // one_vial_always_bucket_simple: "https://your-survey.com/redirect/0.3",
  // one_vial_always_bucket_simple_fast: "https://your-survey.com/redirect/0.4",
  two_vials_single_bucket:
    "https://app.prolific.com/submissions/complete?cc=CC2HW32K",
  two_vials_phases: "https://app.prolific.com/submissions/complete?cc=C14R4MD0",
};
export const PARTIAL_COMPLETION_CODES = {
  one_vial_alternating: "C1D2NK2X",
  one_vial_always_bucket: "C12Y7MTD",
  // one_vial_always_bucket_simple: "https://your-survey.com/redirect/0.3",
  // one_vial_always_bucket_simple_fast: "https://your-survey.com/redirect/0.4",
  two_vials_single_bucket: "CC2HW32K",
  two_vials_phases: "C14R4MD0",
};
