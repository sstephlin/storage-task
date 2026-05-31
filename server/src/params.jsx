export const GAME_PARAMS = {
  ADD_AMOUNT: 10,
  MAX_LEVEL: 100,
  OPTIMAL_LEVEL: 50,
  GAME_SPEED: 100,
  ROUND_DURATION: 15,
  MAX_ROUNDS: 36,
  INITIAL_VIAL_LEVEL: 50,
  INITIAL_BUCKET_LEVEL: 0,
  EMPTY_BUCKET_AMOUNT: 15,
  TRANSITION_TIME: 3000,
};

const numPhases1Vial = 4;

// ============================================================================
// GAME VERSION DEFINITIONS
// Note: version strings here correspond to the values in VERSION_CODE_MAP
// in participantConfig.js. If you add a version, update both files.
//
//   URL code  ->  version key (here)
//   0.1  -> one_vial_alternating
//   0.2  -> one_vial_always_bucket
//   0.3  -> one_vial_always_bucket_simple
//   0.4  -> one_vial_always_bucket_simple_fast
//   0.5  -> two_vials_single_bucket
//   0.6  -> two_vials_phases
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
    description:
      "Single vial that always has storage but has abundance/deprivation phases",
    numVials: 1,
    hasPhases: true,
    bucketBehavior: "always",
    enabled: true,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: {
    name: "One Vial - Simple Storage",
    description: "Single vial with constant storage and no phases",
    numVials: 1,
    hasPhases: false,
    bucketBehavior: "always",
    enabled: true,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: {
    name: "One Vial - Simple Storage Fast",
    description:
      "Single vial with constant storage and no phases but faster velocity",
    numVials: 1,
    hasPhases: false,
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

export const TRAINING_PARAMS = {
  MAX_ROUNDS: 2,
  ROUND_DURATION: 10,
  REQUIRED_SURVIVAL_RATE: 0.5,

  VELOCITIES: {
    one_vial_alternating: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    one_vial_always_bucket: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    one_vial_always_bucket_simple: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    one_vial_always_bucket_simple_fast: {
      SLOW: 2.2,
      MEDIUM: 2.4,
      FAST: 2.6,
    },
    two_vials_single_bucket: {
      SLOW: 1.4,
      MEDIUM: 1.5,
      FAST: 1.6,
    },
    two_vials_phases: {
      SLOW: 1.4,
      MEDIUM: 1.5,
      FAST: 1.6,
    },
  },

  VIAL_COLORS: {
    primary: "#a78bfa",
    secondary: "#34d399",
    optimal: "#fbbf24",
    danger: "#f87171",
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
        velocitySequence: generatePhaseVelocities(
          totalRounds,
          velocities,
          numPhases1Vial,
        ),
        bucketSequence: generateOneVialAlternatingBuckets(totalRounds),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
      };

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET:
      return {
        velocitySequence: generatePhaseVelocities(
          totalRounds,
          velocities,
          numPhases1Vial,
        ),
        bucketSequence: generateConstantBuckets(totalRounds, 1),
        phaseSequence: generateAlternatingPhases(
          totalRounds,
          null,
          numPhases1Vial,
        ),
      };

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE:
      return {
        velocitySequence: generatePhaseVelocities(
          totalRounds,
          velocities,
          numPhases1Vial,
        ),
        bucketSequence: generateConstantBuckets(totalRounds, 1),
        phaseSequence: generateConstantPhase(totalRounds, "abundance"),
      };

    case GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST:
      return {
        velocitySequence: generatePhaseVelocities(
          totalRounds,
          velocities,
          numPhases1Vial,
        ),
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
        velocitySequence: generatePhaseVelocities(
          totalRounds,
          velocities,
          numPhases,
        ),
        bucketSequence: generateDynamicBuckets(totalRounds, 4),
        phaseSequence: generateAlternatingPhases(
          totalRounds,
          "deprivation",
          numPhases,
        ),
      };

    default:
      throw new Error(`Unknown game version: ${version}`);
  }
};

// ============================================================================
// SEQUENCE HELPERS
// ============================================================================
/**
 * Creates the storage sequence.
 * Creates phases for game, storage setting stays the same over entire phase.
 * Phases will alternate between storage and no storage, starting condition is randomized unless forced by config.
 *
 * @param {*} totalRounds
 * @param {*} numPhases
 * @returns
 */
const generateOneVialAlternatingBuckets = (totalRounds, numPhases) => {
  const buckets = [];
  const roundsPerPhase = Math.floor(totalRounds / numPhases);

  // can force games
  let startWithStorage;
  if (ONE_VIAL_ALTERNATING_CONFIG.FORCE_START_PHASE === "storage") {
    // odd numbered phases have storage
    startWithStorage = true;
  } else if (ONE_VIAL_ALTERNATING_CONFIG.FORCE_START_PHASE === "no_storage") {
    // even numbers phases have storage
    startWithStorage = false;
  } else {
    startWithStorage = Math.random() < 0.5; // randomly assign
  }

  for (let phase = 0; phase < numPhases; phase++) {
    const hasStorage = phase % 2 === 0 ? startWithStorage : !startWithStorage; // setting for entire phase
    for (let i = 0; i < roundsPerPhase; i++) {
      buckets.push({ vial1: hasStorage ? 1 : 0, vial2: 0 }); // vial 2 will not have storage ever
    }
  }
  return buckets;
};

/**
 * Creates the per-round drain speed sequence.
 * Creates phases for game, each phases gets an equal number of rounds for each velocity.
 *
 * @param {*} totalRounds
 * @param {*} velocities
 * @param {*} numPhases
 * @returns
 */
const generatePhaseVelocities = (totalRounds, velocities, numPhases) => {
  const velocityArray = [];

  // push as many full sets of velocities as we can for the number of rounds, then shuffle
  if (totalRounds < numPhases) {
    const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    for (let i = 0; i < totalRounds; i++) {
      velocityArray.push(velocityTypes[i % 3]);
    }
    shuffleArray(velocityArray);
    return velocityArray;
  }

  const roundsPerPhase = Math.floor(totalRounds / numPhases);
  const velocityIterations = Math.floor(roundsPerPhase / 3); // how many full sets of SLOW, MEDIUM, FAST we can fit in each phase

  // populate one phase at a time to ensure even distribution of velocities across phases, then shuffle within phase
  for (let phase = 0; phase < numPhases; phase++) {
    const phaseVelocities = [];

    for (let iter = 0; iter < velocityIterations; iter++) {
      phaseVelocities.push(velocities.SLOW);
      phaseVelocities.push(velocities.MEDIUM);
      phaseVelocities.push(velocities.FAST);
    }

    const remainingInPhase = roundsPerPhase - velocityIterations * 3; //remainder rounds that didn't fit full velocity set
    const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
    for (let i = 0; i < remainingInPhase; i++) {
      phaseVelocities.push(velocityTypes[i % 3]);
    }

    shuffleArray(phaseVelocities);
    velocityArray.push(...phaseVelocities);
  }

  const remaining = totalRounds - velocityArray.length; // any remaining rounds that didn't fit into full phases, just add velocities in order (will be shuffled in next step if more than 3)
  const remainingVelocity = [];
  for (let i = 0; i < remaining; i++) {
    remainingVelocity.push(velocityTypes[i % 3]);
  }
  shuffleArray(remainingVelocity);
  velocityArray.push(...remainingVelocity);
  return velocityArray;
};

/**
 * For 1 vial versions with constant storage presencce, generate the bucket sequence.
 * V0.2, V0.3, V0.4
 * @param {*} totalRounds
 * @param {*} vialNumber
 * @returns
 */
const generateConstantBuckets = (totalRounds, vialNumber = 1) => {
  const buckets = [];
  for (let i = 0; i < totalRounds; i++) {
    buckets.push({ vial1: vialNumber === 1 ? 1 : 0, vial2: 0 });
  }
  return buckets;
};

/**
 * Used for 2 vial versions where storage presence changes but doesn't follow a set phase pattern.
 *  Each phase should contain vial1 has storage, vial2 has storage, or neither has storage, and which phase comes first is randomized
 * @returns
 */
// MUST CLARIFY BEFORE USE 5/18
const generateTwoVialSingleBucket = (totalRounds) => {
  const buckets = [];
  // const numPhases = Math.floor(totalRounds / 6);
  const roundsPerPhase = Math.floor(totalRounds / numPhases);
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

/**
 * for the two-vial phases version.
 * Divides into phases and within each phase alternates the bucket between vial1 and vial2 (one of each per pair of rounds),
 * then shuffles so which vial gets storage when is unpredictable. Ensures even number of storage conditions between vial1 and vial2 in each phase
 * V0.6
 * @param {*} totalRounds
 * @param {*} numPhases
 * @returns
 */
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

    // create pairs of rounds for each option to ensure even distribution within phase, then shuffle
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

/**
 * trivially fills every round with the same phase string, either "abundance" or "deprivation".
 * Default is "abundance""
 * @param {*} totalRounds
 * @param {*} phase
 * @returns
 */
const generateConstantPhase = (totalRounds, phase = "abundance") => {
  return Array(totalRounds).fill(phase);
};

/**
 * Alternate between "abundance" and "deprivation" phases, starting with a random phase unless forced by config.
 * V0.2, 0.6
 * ABAB-style phase sequence
 * @param {*} totalRounds
 * @param {*} forceStartPhase
 * @param {*} numPhases
 * @returns
 */
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

/**
 * Helper function to shuffle an array in place using Fisher-Yates algorithm
 * @param {*} array
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]:
    "https://brown.co1.qualtrics.com/jfe/form/SV_9z9tplZtesJSya2",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]:
    "https://brown.co1.qualtrics.com/jfe/form/SV_42ajRjRdYhvv7xA",
  // [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]:
  //   "https://brown.co1.qualtrics.com/jfe/form/SV_9z9tplZtesJSya2",
  // [GAME_VERSIONS.TWO_VIALS_PHASES]:
  //   "https://brown.co1.qualtrics.com/jfe/form/SV_42ajRjRdYhvv7xA",
};

/**
 * Redirection URL if participant fails instructions phase
 */
export const FAIL_INSTRUCTIONS_REDIRECT_URL = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]:
    "https://app.prolific.com/submissions/complete?cc=C1FVK0JA",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]:
    "https://app.prolific.com/submissions/complete?cc=C11L3B0C",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]:
    "https://app.prolific.com/submissions/complete?cc=C1DTFOCP",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]:
    "https://app.prolific.com/submissions/complete?cc=CPU6RVTR",
  // [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]:
  //   "https://app.prolific.com/submissions/complete?cc=C1DTFOCP",
  // [GAME_VERSIONS.TWO_VIALS_PHASES]:
  //   "https://app.prolific.com/submissions/complete?cc=CPU6RVTR",
};

/**
 * Redirection URLs if participant fails training phase
 */
export const FAIL_TRAINING_REDIRECT_URL = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]:
    "https://app.prolific.com/submissions/complete?cc=CQVYF7F2",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]:
    "https://app.prolific.com/submissions/complete?cc=C1AWOSIL",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]:
    "https://app.prolific.com/submissions/complete?cc=C1G6HUCS",
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]:
    "https://app.prolific.com/submissions/complete?cc=C1G7YBS3",
  // [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]:
  //   "https://app.prolific.com/submissions/complete?cc=C1G6HUCS",
  // [GAME_VERSIONS.TWO_VIALS_PHASES]:
  //   "https://app.prolific.com/submissions/complete?cc=C1G7YBS3",
};

/**
 * Redirection URLs if participant reloads before the main game (in instructions, training, etc)
 */
export const RELOAD_REDIRECT_URLS_GENERAL = {
  one_vial_alternating:
    "https://app.prolific.com/submissions/complete?cc=CDUWLNWZ",
  one_vial_always_bucket:
    "https://app.prolific.com/submissions/complete?cc=C1M6NFW7",
  one_vial_always_bucket_simple:
    "https://app.prolific.com/submissions/complete?cc=C1HX2EFH",
  one_vial_always_bucket_simple_fast:
    "https://app.prolific.com/submissions/complete?cc=C1FJ139N",
  // two_vials_single_bucket:
  //   "https://app.prolific.com/submissions/complete?cc=C1HX2EFH",
  // two_vials_phases: "https://app.prolific.com/submissions/complete?cc=C1FJ139N",
};

/**
 * Redirection URLs if participant reloads during the main game
 */
export const RELOAD_REDIRECT_URLS_MAIN_GAME = {
  one_vial_alternating:
    "https://app.prolific.com/submissions/complete?cc=C1D2NK2X",
  one_vial_always_bucket:
    "https://app.prolific.com/submissions/complete?cc=C12Y7MTD",
  one_vial_always_bucket_simple:
    "https://app.prolific.com/submissions/complete?cc=CC2HW32K",
  one_vial_always_bucket_simple_fast:
    "https://app.prolific.com/submissions/complete?cc=C14R4MD0",
  // two_vials_single_bucket:
  //   "https://app.prolific.com/submissions/complete?cc=CC2HW32K",
  // two_vials_phases: "https://app.prolific.com/submissions/complete?cc=C14R4MD0",
};

/**
 * Codes needed for participant credit, even if participant did not complete the game (e.g. reloaded during main game, refresh page, etc)
 */
export const PARTIAL_COMPLETION_CODES = {
  one_vial_alternating: "C1D2NK2X",
  one_vial_always_bucket: "C12Y7MTD",
  one_vial_always_bucket_simple: "CC2HW32K",
  one_vial_always_bucket_simple_fast: "C14R4MD0",
  // two_vials_single_bucket: "CC2HW32K",
  // two_vials_phases: "C14R4MD0",
};
