export const GAME_PARAMS = {
  ADD_AMOUNT: 10,
  MAX_LEVEL: 100,
  BUCKET_CAPACITY: 40,
  OPTIMAL_LEVEL: 50,
  GAME_SPEED: 100,
  ROUND_DURATION: 15,
  MAX_ROUNDS: 36,
  INITIAL_VIAL_LEVEL: 50,
  INITIAL_BUCKET_LEVEL: 0,
  EMPTY_BUCKET_AMOUNT: 15,
  TRANSITION_TIME: 3000,
};

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
    numPhases: 4,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
    name: "One Vial - Always Bucket",
    description:
      "Single vial that always has storage but has abundance/deprivation phases",
    numVials: 1,
    hasPhases: true,
    bucketBehavior: "constant",
    enabled: true,
    numPhases: 4,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: {
    name: "One Vial - Simple Storage",
    description: "Single vial with constant storage and no phases",
    numVials: 1,
    hasPhases: false,
    bucketBehavior: "constant",
    enabled: true,
    numPhases: 4,
  },

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: {
    name: "One Vial - Simple Storage Fast",
    description:
      "Single vial with constant storage and no phases but faster velocity",
    numVials: 1,
    hasPhases: false,
    bucketBehavior: "constant",
    enabled: true,
    numPhases: 4,
  },

  // [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: {
  //   name: "Two Vials - Single Bucket",
  //   description: "Two vials where at most one has storage at a time",
  //   numVials: 2,
  //   hasPhases: false,
  //   bucketBehavior: "alternate",
  //   enabled: true,
  // },

  // [GAME_VERSIONS.TWO_VIALS_PHASES]: {
  //   name: "Two Vials - Phases",
  //   description:
  //     "Two vials with abundance/deprivation phases and varying storage",
  //   numVials: 2,
  //   hasPhases: true,
  //   bucketBehavior: "dynamic",
  //   enabled: true,
  // },
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
  MAX_ROUNDS: 1,
  ROUND_DURATION: 5,
  REQUIRED_SURVIVAL_RATE: 0.5,

  VELOCITIES: {
    [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: {
      SLOW: 2.2,
      MEDIUM: 2.4,
      FAST: 2.6,
    },
    [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: {
      SLOW: 1.4,
      MEDIUM: 1.5,
      FAST: 1.6,
    },
    [GAME_VERSIONS.TWO_VIALS_PHASES]: {
      SLOW: 1.4,
      MEDIUM: 1.5,
      FAST: 1.6,
    },
  },

  VIAL_COLORS: {
    primary: "#a78bfa",
    secondary: "#34d399",
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

// ============================================================================
// POST-GAME REDIRECT URLS
// After the main game ends, participants are sent to a version-specific link.
// Update the placeholder URLs below before deploying.
// Keyed by the same internal version strings used throughout the app.
// ============================================================================
export const VERSION_URLS = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: {
    gameComplete: "https://brown.co1.qualtrics.com/jfe/form/SV_cLObwj6KBpKvEF0",
    failInstructions:
      "https://app.prolific.com/submissions/complete?cc=C1FVK0JA",
    failTraining: "https://app.prolific.com/submissions/complete?cc=CQVYF7F2",
    reloadGeneral: "https://app.prolific.com/submissions/complete?cc=CDUWLNWZ",
    reloadMainGame: "https://app.prolific.com/submissions/complete?cc=C1D2NK2X",
    partialCompletion: "C1D2NK2X",
  },
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: {
    gameComplete: "https://brown.co1.qualtrics.com/jfe/form/SV_9mErNW5zeKEL0SW",
    failInstructions:
      "https://app.prolific.com/submissions/complete?cc=C11L3B0C",
    failTraining: "https://app.prolific.com/submissions/complete?cc=C1AWOSIL",
    reloadGeneral: "https://app.prolific.com/submissions/complete?cc=C1M6NFW7",
    reloadMainGame: "https://app.prolific.com/submissions/complete?cc=C12Y7MTD",
    partialCompletion: "C12Y7MTD",
  },
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: {
    gameComplete: "https://brown.co1.qualtrics.com/jfe/form/SV_9z9tplZtesJSya2",
    failInstructions:
      "https://app.prolific.com/submissions/complete?cc=C1DTFOCP",
    failTraining: "https://app.prolific.com/submissions/complete?cc=C1G6HUCS",
    reloadGeneral: "https://app.prolific.com/submissions/complete?cc=C1HX2EFH",
    reloadMainGame: "https://app.prolific.com/submissions/complete?cc=CC2HW32K",
    partialCompletion: "CC2HW32K",
  },
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: {
    gameComplete: "https://brown.co1.qualtrics.com/jfe/form/SV_42ajRjRdYhvv7xA",
    failInstructions:
      "https://app.prolific.com/submissions/complete?cc=CPU6RVTR",
    failTraining: "https://app.prolific.com/submissions/complete?cc=C1G7YBS3",
    reloadGeneral: "https://app.prolific.com/submissions/complete?cc=C1FJ139N",
    reloadMainGame: "https://app.prolific.com/submissions/complete?cc=C14R4MD0",
    partialCompletion: "C14R4MD0",
  },
  // [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: {
  //   gameComplete:      "https://brown.co1.qualtrics.com/jfe/form/SV_9z9tplZtesJSya2",
  //   failInstructions:  "https://app.prolific.com/submissions/complete?cc=C1DTFOCP",
  //   failTraining:      "https://app.prolific.com/submissions/complete?cc=C1G6HUCS",
  //   reloadGeneral:     "https://app.prolific.com/submissions/complete?cc=C1HX2EFH",
  //   reloadMainGame:    "https://app.prolific.com/submissions/complete?cc=CC2HW32K",
  //   partialCompletion: "CC2HW32K",
  // },
  // [GAME_VERSIONS.TWO_VIALS_PHASES]: {
  //   gameComplete:      "https://brown.co1.qualtrics.com/jfe/form/SV_42ajRjRdYhvv7xA",
  //   failInstructions:  "https://app.prolific.com/submissions/complete?cc=CPU6RVTR",
  //   failTraining:      "https://app.prolific.com/submissions/complete?cc=C1G7YBS3",
  //   reloadGeneral:     "https://app.prolific.com/submissions/complete?cc=C1FJ139N",
  //   reloadMainGame:    "https://app.prolific.com/submissions/complete?cc=C14R4MD0",
  //   partialCompletion: "C14R4MD0",
  // },
};
