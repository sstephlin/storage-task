import { getVersionCode } from "../data/participantConfig";
import {
  RELOAD_REDIRECT_URLS_GENERAL,
  RELOAD_REDIRECT_URLS_MAIN_GAME,
} from "../data/params";

export const getReloadRedirectUrl = (gameVersion, isMainGame) => {
  const redirectUrls = isMainGame
    ? RELOAD_REDIRECT_URLS_MAIN_GAME
    : RELOAD_REDIRECT_URLS_GENERAL;

  return redirectUrls[gameVersion] ?? null;
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
