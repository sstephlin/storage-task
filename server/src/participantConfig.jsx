export const PRODUCTION_MODE = false;

// Production mode (all security features enabled)
// export const PRODUCTION_MODE = true;
// ============================================================================
// PARTICIPANT DATABASE
// ============================================================================
// Each participant has:
// - id: Unique participant identifier
// - pin: 4-digit PIN for authentication
// - version: Game version they're assigned to
// Format: { id: string, pin: string, version: string }

export const PARTICIPANTS = [
  { id: "P001", pin: "4827", version: "one_vial_alternating" },
  { id: "P002", pin: "9503", version: "one_vial_always_bucket_simple" },
  { id: "P003", pin: "1764", version: "two_vials_single_bucket" },
  { id: "P004", pin: "6389", version: "two_vials_phases" },
  { id: "P005", pin: "2048", version: "one_vial_alternating" },
  { id: "P006", pin: "7196", version: "one_vial_always_bucket" },
  { id: "P007", pin: "5831", version: "two_vials_single_bucket" },
  { id: "P008", pin: "0946", version: "two_vials_phases" },
  { id: "P009", pin: "8610", version: "one_vial_alternating" },
  { id: "P010", pin: "4375", version: "one_vial_always_bucket" },
  { id: "P011", pin: "6924", version: "two_vials_single_bucket" },
  { id: "P012", pin: "1508", version: "two_vials_phases" },
  { id: "P013", pin: "9736", version: "one_vial_alternating" },
  { id: "P014", pin: "2819", version: "one_vial_always_bucket" },
  { id: "P015", pin: "7450", version: "two_vials_single_bucket" },
  { id: "P016", pin: "3167", version: "two_vials_phases" },
  { id: "P017", pin: "8042", version: "one_vial_alternating" },
  { id: "P018", pin: "5693", version: "one_vial_always_bucket" },
  { id: "P019", pin: "1284", version: "two_vials_single_bucket" },
  { id: "P020", pin: "9075", version: "two_vials_phases" },
  { id: "P021", pin: "3541", version: "one_vial_alternating" },
  { id: "P022", pin: "6680", version: "one_vial_always_bucket" },
  { id: "P023", pin: "4926", version: "two_vials_single_bucket" },
  { id: "P024", pin: "0159", version: "two_vials_phases" },
  { id: "P025", pin: "7814", version: "one_vial_alternating" },
  { id: "P026", pin: "2368", version: "one_vial_always_bucket_simple_fast" },
  { id: "P027", pin: "9401", version: "two_vials_single_bucket" },
  { id: "P028", pin: "5072", version: "two_vials_phases" },
  { id: "P029", pin: "6195", version: "one_vial_alternating" },
  { id: "P030", pin: "8734", version: "one_vial_always_bucket" },
  { id: "P031", pin: "0427", version: "two_vials_single_bucket" },
  { id: "P032", pin: "6958", version: "two_vials_phases" },
  { id: "P033", pin: "1843", version: "one_vial_alternating" },
  { id: "P034", pin: "9206", version: "one_vial_always_bucket" },
  { id: "P035", pin: "3579", version: "two_vials_single_bucket" },
  { id: "P036", pin: "4612", version: "two_vials_phases" },
  { id: "P037", pin: "7085", version: "one_vial_alternating" },
  { id: "P038", pin: "2390", version: "one_vial_always_bucket" },
  { id: "P039", pin: "8561", version: "two_vials_single_bucket" },
  { id: "P040", pin: "5148", version: "two_vials_phases" },
];

// ============================================================================
// VERSION ASSIGNMENT FOR DEBUG MODE
// ============================================================================
const VERSIONS = [
  "one_vial_alternating",
  "one_vial_always_bucket",
  "one_vial_always_bucket_simple",
  "two_vials_single_bucket",
  "two_vials_phases",
];

/**
 * Get version for participant ID in debug mode
 * Maps participant IDs to versions the same way as production
 * @param {string} participantId - Participant ID
 * @returns {string} Game version
 */
const getDebugVersion = (participantId) => {
  // Check if it's a standard P### format
  const match = participantId.match(/^P(\d+)$/);

  if (match) {
    // Extract number (e.g., "P001" -> 1)
    const num = parseInt(match[1], 10);
    // Map to version using same pattern as PARTICIPANTS array
    // Now cycles through 5 versions instead of 4
    // P001, P006, P011, P016... -> one_vial_alternating
    // P002, P007, P012, P017... -> one_vial_always_bucket
    // P003, P008, P013, P018... -> one_vial_always_bucket_simple
    // P004, P009, P014, P019... -> two_vials_single_bucket
    // P005, P010, P015, P020... -> two_vials_phases
    return VERSIONS[(num - 1) % VERSIONS.length];
  }

  // For non-standard IDs, default to first version
  return VERSIONS[0];
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate participant credentials
 * @param {string} participantId - Participant ID
 * @param {string} pin - 4-digit PIN
 * @returns {Object|null} Participant object if valid, null otherwise
 */
export const validateCredentials = (participantId, pin) => {
  // First, try to find in PARTICIPANTS array (works in both modes)
  const participant = PARTICIPANTS.find(
    (p) => p.id === participantId && p.pin === pin,
  );

  if (participant) {
    return participant;
  }

  // If not found and in dev mode, accept any credentials with debug version
  if (!PRODUCTION_MODE) {
    // Check if participant exists in array (but wrong PIN)
    const participantExists = PARTICIPANTS.find((p) => p.id === participantId);
    if (participantExists) {
      // In dev mode, ignore wrong PIN and return the participant
      return participantExists;
    }

    // Participant not in array at all - use debug version mapping
    return {
      id: participantId || "P001",
      pin: pin || "0000",
      version: getDebugVersion(participantId || "P001"),
    };
  }

  // Production mode - strict validation
  return null;
};

/**
 * Check if participant ID exists
 * @param {string} participantId - Participant ID to check
 * @returns {boolean} True if ID exists
 */
export const participantExists = (participantId) => {
  if (!PRODUCTION_MODE) return true;
  return PARTICIPANTS.some((p) => p.id === participantId);
};

/**
 * Get participant by ID
 * @param {string} participantId - Participant ID
 * @returns {Object|null} Participant object if found, null otherwise
 */
export const getParticipant = (participantId) => {
  // First, try to find in PARTICIPANTS array (works in both modes)
  const participant = PARTICIPANTS.find((p) => p.id === participantId);

  if (participant) {
    return participant;
  }

  // If not found and in dev mode, use debug version mapping
  if (!PRODUCTION_MODE) {
    return {
      id: participantId || "P001",
      pin: "0000",
      version: getDebugVersion(participantId || "P001"),
    };
  }

  // Production mode and not found
  return null;
};

/**
 * Get game version for participant
 * @param {string} participantId - Participant ID
 * @returns {string} Game version identifier
 */
export const getParticipantVersion = (participantId) => {
  const participant = getParticipant(participantId);
  return participant ? participant.version : null;
};

// ============================================================================
// UTILITY FUNCTIONS FOR SETUP
// ============================================================================

/**
 * Generate random 4-digit PIN
 * @returns {string} 4-digit PIN
 */
export const generateRandomPin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate participant list with random PINs
 * Useful for initial setup
 * @param {string[]} participantIds - Array of participant IDs
 * @param {string[]} versions - Array of version identifiers
 * @returns {Object[]} Array of participant objects
 */
export const generateParticipantList = (participantIds, versions) => {
  return participantIds.map((id, index) => ({
    id,
    pin: generateRandomPin(),
    version: versions[index % versions.length], // Distribute versions evenly
  }));
};

/**
 * Export participants as CSV string for distribution
 * @returns {string} CSV formatted participant data
 */
export const exportParticipantsAsCSV = () => {
  const header = "Participant ID,PIN,Game Version\n";
  const rows = PARTICIPANTS.map((p) => `${p.id},${p.pin},${p.version}`).join(
    "\n",
  );
  return header + rows;
};

/**
 * Get statistics about participant distribution
 * @returns {Object} Statistics object
 */
export const getParticipantStats = () => {
  const versionCounts = {};
  PARTICIPANTS.forEach((p) => {
    versionCounts[p.version] = (versionCounts[p.version] || 0) + 1;
  });

  return {
    total: PARTICIPANTS.length,
    byVersion: versionCounts,
  };
};

// ============================================================================
// EXAMPLE: Generate new participant list (commented out)
// ============================================================================
/*
const participantIds = Array.from({ length: 40 }, (_, i) => 
  `P${String(i + 1).padStart(3, '0')}`
);

const versions = [
  'one_vial_alternating',
  'one_vial_always_bucket',
  'one_vial_always_bucket_simple',
  'two_vials_single_bucket',
  'two_vials_phases'
];

const newParticipants = generateParticipantList(participantIds, versions);
console.log(JSON.stringify(newParticipants, null, 2));
*/
