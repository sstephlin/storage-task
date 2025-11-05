// Game Parameters
// Adjust these values to change game difficulty and behavior

export const GAME_PARAMS = {
  // Liquid management
  DRAIN_RATE: 0.5, // Percentage points drained per game tick
  ADD_AMOUNT: 5, // Percentage points added per button click
  MAX_LEVEL: 100, // Maximum percentage level for vials

  // Optimal zone (green when in range, red when outside)
  OPTIMAL_ZONE_MIN: 35, // Minimum level for optimal zone (green)
  OPTIMAL_ZONE_MAX: 50, // Maximum level for optimal zone (green)

  DANGER_UPPER: 90,
  DANGER_LOWER: 10,

  // Timing
  GAME_SPEED: 100, // Milliseconds per game tick (lower = faster)
  ROUND_DURATION: 10, // Duration of each round in seconds
  MAX_ROUNDS: 24, // Maximum number of rounds before game ends

  // Initial conditions
  INITIAL_VIAL_LEVEL: 50, // Starting percentage for both vials
  INITIAL_BUCKET_LEVEL: 0, // Starting percentage for bucket

  // Game version
  // RANDOM_VERSION_PROBABILITY: 0.5, // Probability of starting with bucket (0.0 to 1.0)

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

export const ROUND_CONDITIONS = [
  { drainRate: DRAIN_RATES.SLOW, numBuckets: 0, name: "Slow, No Bucket" },
  { drainRate: DRAIN_RATES.SLOW, numBuckets: 1, name: "Slow, 1 Bucket" },
  // {
  //   drainRate: DRAIN_RATES.SLOW,
  //   numBuckets: 2,
  //   name: "Slow, 2 Buckets",
  // },
  {
    drainRate: DRAIN_RATES.MEDIUM,
    numBuckets: 0,
    name: "Medium, No Bucket",
  },
  {
    drainRate: DRAIN_RATES.MEDIUM,
    numBuckets: 1,
    name: "Medium, 1 Bucket",
  },
  // {
  //   drainRate: DRAIN_RATES.MEDIUM,
  //   numBuckets: 2,
  //   name: "Medium, 2 Buckets",
  // },
  {
    drainRate: DRAIN_RATES.FAST,
    numBuckets: 0,
    name: "Medium-Fast, No Bucket",
  },
  { drainRate: DRAIN_RATES.FAST, numBuckets: 1, name: "Fast, 1 Bucket" },
  // { drainRate: DRAIN_RATES.FAST, numBuckets: 2, name: "Fast, 2 Buckets" },
];

/**
 * Generate a randomized sequence of 32 rounds
 * Each of the 8 conditions appears exactly 4 times
 */
export const generateRoundSequence = () => {
  const sequence = [];

  // Create 4 copies of each condition
  for (let i = 0; i < 4; i++) {
    sequence.push(...ROUND_CONDITIONS);
  }

  // Fisher-Yates shuffle
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }

  return sequence;
};

// Round-specific settings (for future customization)
// Array index corresponds to round number (0-indexed)
export const ROUND_SETTINGS = [
  // Round 1
  {
    drainRate: 0.5,
    addAmount: 15,
    duration: 30,
  },
  // Round 2 (currently same as Round 1, but can be customized later)
  {
    drainRate: 0.5,
    addAmount: 15,
    duration: 30,
  },
  // Round 3
  {
    drainRate: 0.5,
    addAmount: 15,
    duration: 30,
  },
  // Add more rounds as needed
];

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
  COMMON:
    "Both vials constantly drain at the same rate. Use keyboard controls to play:",
  CONTROLS_BASE: "← Left Arrow: Add to Vial 1 | → Right Arrow: Add to Vial 2",
  CONTROLS_WITH_BUCKET: " | ↑ Up Arrow: Empty Bucket",
  WITH_BUCKET:
    "Vial 2 has a spout that causes it to overflow into the bucket when full. Keep both vials from emptying!",
  WITHOUT_BUCKET:
    "Keep both vials from emptying! Vial levels are capped at 100%.",
  ENDING: "Survive each round to earn points!",
};
