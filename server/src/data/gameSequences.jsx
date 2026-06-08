import {
  VERSION_VELOCITIES,
  GAME_VERSIONS,
  ONE_VIAL_ALTERNATING_CONFIG,
  PHASE_CONFIG,
  VERSION_CONFIG,
} from "./params";
const numPhases1Vial = 4;

/**
 * Generate sequences based on game version.
 * Returns: { velocitySequence, bucketSequence, phaseSequence }
 * @param {string} version - Game version identifier (resolved from URL code)
 * @param {number} totalRounds - Total number of rounds
 * @param {object} customVelocities - Optional custom velocity config (for training mode)
 */
export const generateGameSequences = (
  version,
  totalRounds = 36,
  customVelocities = null,
) => {
  const config = VERSION_CONFIG[version];

  if (!config) throw new Error(`Unknown game version: ${version}`);

  const velocities = customVelocities || VERSION_VELOCITIES[version];

  return {
    velocitySequence: generatePhaseVelocities(
      totalRounds,
      velocities,
      config.numPhases,
    ),
    bucketSequence: generateBucketSequence(
      totalRounds,
      config.numPhases,
      config.numVials,
      config.bucketBehavior,
    ),
    phaseSequence: generatePhaseSequence(
      totalRounds,
      config.numPhases,
      null,
      config.hasPhases,
    ),
  };
};

// ============================================================================
// SEQUENCE HELPERS
// ============================================================================
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
  const velocityTypes = [velocities.SLOW, velocities.MEDIUM, velocities.FAST];
  const velocityArray = [];

  // push as many full sets of velocities as we can for the number of rounds, then shuffle
  if (totalRounds < numPhases) {
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

const generateBucketSequence = (
  totalRounds,
  numPhases,
  vialNumber = 1,
  bucketConfig = "constant",
) => {
  if (bucketConfig === "constant") {
    return generateConstantBuckets(totalRounds, vialNumber);
  } else if (bucketConfig === "alternating") {
    return generateOneVialAlternatingBuckets(totalRounds, numPhases);
  } else if (bucketConfig === "dynamic") {
    return generateDynamicBuckets(totalRounds, numPhases);
  } else {
    throw new Error(`Unknown bucket config: ${bucketConfig}`);
  }
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

const generatePhaseSequence = (
  totalRounds,
  numPhases,
  forceStartPhase = null,
  hasPhases = false,
) => {
  if (hasPhases === true) {
    return generateAlternatingPhases(totalRounds, forceStartPhase, numPhases);
  } else if (hasPhases === false) {
    return generateConstantPhase(totalRounds, "abundance");
  }
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
  const secondPhase =
    startingPhase === "abundance" ? "deprivation" : "abundance";

  for (let phase = 0; phase < numPhases; phase++) {
    const condition = phase % 2 === 0 ? startingPhase : secondPhase; // setting for entire phase
    for (let i = 0; i < roundsPerPhase; i++) {
      phases.push(condition);
    }
  }

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
