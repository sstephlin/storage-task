// Game Parameters
// Adjust these values to change game difficulty and behavior

export const GAME_PARAMS = {
  // Liquid management
  DRAIN_RATE: 0.9, // Percentage points drained per game tick
  ADD_AMOUNT: 15, // Percentage points added per button click
  MAX_LEVEL: 100, // Maximum percentage level for vials

  // Timing
  GAME_SPEED: 100, // Milliseconds per game tick (lower = faster)
  ROUND_DURATION: 300, // Duration of each round in seconds

  // Initial conditions
  INITIAL_VIAL_LEVEL: 70, // Starting percentage for both vials
  INITIAL_BUCKET_LEVEL: 0, // Starting percentage for bucket

  // Game version
  RANDOM_VERSION_PROBABILITY: 0.5, // Probability of starting with bucket (0.0 to 1.0)
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
  PLAYING: "Keep both vials from emptying!",
  GAME_OVER: "Game Over! A vial emptied!",
  ROUND_COMPLETE: "Round Complete! Starting next round...",
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
  COMMON: "Both vials constantly drain at the same rate.",
  WITH_BUCKET:
    "Vial 2 has a spout that causes it to overflow into the bucket when full. Add liquid to keep both vials from emptying completely. Empty the bucket to return liquid to Vial 2.",
  WITHOUT_BUCKET:
    "Add liquid to keep both vials from emptying completely. Vial levels are capped at 100%.",
  ENDING: "Survive each round to earn points!",
};
