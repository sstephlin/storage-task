export const PRODUCTION_MODE = true;

// Production mode (all security features enabled)
// export const PRODUCTION_MODE = true;

// ============================================================================
// VERSION CODE MAP
// The URL uses short numeric codes (e.g. ?v=0.1) that are opaque to
// participants. This map is the single source of truth — update here only.
//
//   Code   Internal version key
//   ----   -----------------------------
//   0.1    one_vial_alternating
//   0.2    one_vial_always_bucket
//   0.3    one_vial_always_bucket_simple
//   0.4    one_vial_always_bucket_simple_fast
//   0.5    two_vials_single_bucket
//   0.6    two_vials_phases
// ============================================================================
export const VERSION_CODE_MAP = {
  0.1: "one_vial_alternating",
  0.2: "one_vial_always_bucket",
  0.3: "two_vials_single_bucket",
  0.4: "two_vials_phases",
  0.5: "one_vial_always_bucket_simple",
  0.6: "one_vial_always_bucket_simple_fast",
};

// ============================================================================
// VERSION REDIRECT URLS
// Shown on the termination screen when a participant reloads during the
// experiment. Set a version-specific URL so they land on the right
// follow-up page for their condition. Update the placeholder URLs below.
// ============================================================================
export const VERSION_REDIRECT_URLS = {
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

// ============================================================================
// URL PARAMETER PARSING
// ============================================================================

/**
 * Extract participant ID and resolve game version from URL parameters.
 * Expected URL format: https://yourdomain.com/?pid=P001&v=0.3
 *
 * @returns {{ participantId: string|null, versionCode: string|null, version: string|null }}
 */
export const getParamsFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const participantId = params.get("pid") || null;
  const versionCode = params.get("v") || null;
  const version = versionCode ? (VERSION_CODE_MAP[versionCode] ?? null) : null;
  return { participantId, versionCode, version };
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate the URL parameters needed to start a session.
 * Returns a structured result so App.js can show a clear error message.
 *
 * @returns {{ valid: boolean, participantId: string|null, version: string|null, error: string|null }}
 */
export const validateUrlParams = () => {
  const { participantId, versionCode, version } = getParamsFromUrl();

  if (!participantId) {
    return {
      valid: false,
      pid: null,
      version: null,
      error:
        "No participant ID found in the link. Please use the link provided by the researcher.",
    };
  }

  if (!versionCode) {
    return {
      valid: false,
      participantId,
      version: null,
      error:
        "No version code found in the link. Please use the link provided by the researcher.",
    };
  }

  // In dev mode accept any code so you can test freely; in production it must
  // resolve to a known internal version.
  if (!PRODUCTION_MODE && !version) {
    // Unknown code in dev — still allow but warn
    console.warn(
      `[dev] Unknown version code "${versionCode}", defaulting to first version.`,
    );
    return {
      valid: true,
      participantId,
      version: Object.values(VERSION_CODE_MAP)[0],
      error: null,
    };
  }

  if (!version) {
    return {
      valid: false,
      participantId,
      version: null,
      error: "Invalid version code in link. Please contact the researcher.",
    };
  }

  return { valid: true, participantId, version, error: null };
};

// ============================================================================
// UTILITY – kept for admin / data-export convenience
// ============================================================================

/**
 * Generate a CSV of shareable links using numeric version codes.
 *
 * @param {string[]} participantIds
 * @param {string[]} versionCodes  - e.g. ["0.1","0.2"] — cycled across participants
 * @param {string}   baseUrl       - e.g. "https://yourdomain.com"
 * @returns {string} CSV
 */
export const generateLinksCSV = (
  participantIds,
  versionCodes,
  baseUrl = "",
) => {
  const header = "Participant ID,Version Code,Link\n";
  const rows = participantIds
    .map((id, i) => {
      const code = versionCodes[i % versionCodes.length];
      const link = `${baseUrl}/?pid=${encodeURIComponent(id)}&v=${encodeURIComponent(code)}`;
      return `${id},${code},${link}`;
    })
    .join("\n");
  return header + rows;
};

export const getVersionCode = (versionString) => {
  return (
    Object.keys(VERSION_CODE_MAP).find(
      (code) => VERSION_CODE_MAP[code] === versionString,
    ) ?? null
  );
};
