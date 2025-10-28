// Participant Configuration for Experiments
// Add your pre-assigned participant IDs here

export const PARTICIPANT_IDS = [
  "P001",
  "P002",
  "P003",
  "P004",
  "P005",
  // Add more participant IDs as needed
];

// Experiment settings
export const EXPERIMENT_CONFIG = {
  // Set to true to require participants to use pre-assigned IDs only
  REQUIRE_PREASSIGNED_ID: true,

  // Set to true to allow custom IDs (for testing)
  ALLOW_CUSTOM_ID: false,

  // Set to true to allow random ID generation (for testing)
  ALLOW_RANDOM_ID: false,

  // Prefix for auto-generated participant IDs (if you want sequential IDs)
  ID_PREFIX: "P",

  // ID format validation (regex pattern)
  // Default: Alphanumeric, underscores, hyphens
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
};

/**
 * Generate sequential participant IDs
 * @param {number} count - Number of IDs to generate
 * @param {number} startNumber - Starting number (default: 1)
 * @returns {string[]} Array of participant IDs
 */
export const generateSequentialIds = (count, startNumber = 1) => {
  const ids = [];
  for (let i = 0; i < count; i++) {
    const num = (startNumber + i).toString().padStart(3, "0");
    ids.push(`${EXPERIMENT_CONFIG.ID_PREFIX}${num}`);
  }
  return ids;
};

/**
 * Check if a participant ID is valid
 * @param {string} id - Participant ID to validate
 * @returns {boolean} Whether the ID is valid
 */
export const isValidParticipantId = (id) => {
  if (EXPERIMENT_CONFIG.REQUIRE_PREASSIGNED_ID) {
    return PARTICIPANT_IDS.includes(id);
  }
  return EXPERIMENT_CONFIG.ID_PATTERN.test(id);
};

/**
 * Get validation error message
 * @param {string} id - Participant ID that failed validation
 * @returns {string} Error message
 */
export const getValidationError = (id) => {
  if (EXPERIMENT_CONFIG.REQUIRE_PREASSIGNED_ID) {
    return "Invalid Participant ID. Please use your assigned ID.";
  }
  return "Invalid ID format. Use only letters, numbers, underscores, and hyphens.";
};

// Example: Generate 100 sequential IDs (P001 to P100)
// Uncomment and use this to quickly populate PARTICIPANT_IDS
// export const PARTICIPANT_IDS = generateSequentialIds(100);
