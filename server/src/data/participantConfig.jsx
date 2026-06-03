/**
 * Parse and validate URL parameters for participant ID and game version.
 */
export const PRODUCTION_MODE = true;

export const VERSION_CODE_MAP = {
  0.1: "one_vial_alternating",
  0.2: "one_vial_always_bucket",
  0.3: "one_vial_always_bucket_simple",
  0.4: "one_vial_always_bucket_simple_fast",
  // 0.5: "two_vials_single_bucket",
  // 0.6: "two_vials_phases",
};

/**
 * Extract participant ID and resolve game version from URL parameters.
 * Expected URL format: https://https://petzschner-storage-task.web.app/?PROLIFIC_ID=[XX]&STUDY_ID=[XX]
 *
 * @returns {{ participantId: string|null, versionCode: string|null, version: string|null }}
 */
export const getParamsFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const participantId = params.get("PROLIFIC_ID") || null;
  const versionCode = params.get("STUDY_ID") || null;
  const version = versionCode ? (VERSION_CODE_MAP[versionCode] ?? null) : null;
  return { participantId, versionCode, version };
};

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

export const getVersionCode = (versionString) => {
  return (
    Object.keys(VERSION_CODE_MAP).find(
      (code) => VERSION_CODE_MAP[code] === versionString,
    ) ?? null
  );
};
