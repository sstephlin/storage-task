import { getVersionCode } from "../data/participantConfig";
import { VERSION_URLS } from "../data/params";

export const getReloadRedirectUrl = (gameVersion, isMainGame) => {
  const redirectUrl = isMainGame
    ? VERSION_URLS[gameVersion]?.reloadMainGame
    : VERSION_URLS[gameVersion]?.reloadGeneral;
  if (!redirectUrl) {
    console.error(`Missing reload URL for version: ${gameVersion}`);
  }
  console.log(
    `Reload redirect URL for version ${gameVersion} (main game: ${isMainGame}): ${redirectUrl}`,
  );

  return redirectUrl;
};

export const buildParticipantRedirectUrl = (
  redirectUrl,
  {
    userId,
    gameVersion,
    participantParam = "PROLIFIC_PID",
    bonusReached = null,
  } = {},
) => {
  if (!redirectUrl) return null;

  const url = new URL(redirectUrl);
  const versionCode = getVersionCode(gameVersion);

  if (userId) url.searchParams.set(participantParam, userId);
  if (versionCode) url.searchParams.set("STUDY_ID", versionCode);
  if (bonusReached !== null) {
    url.searchParams.set("B", bonusReached ? "true" : "false");
  }

  return url.toString();
};
