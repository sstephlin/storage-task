/**
 * detecting when someone leaves the tab too long.
 */
import { useEffect, useRef } from "react";
import { logTabVisibilityChange } from "../data/logging";
import {
  buildParticipantRedirectUrl,
  getReloadRedirectUrl,
} from "../utils/redirectUtils";

const AWAY_LIMIT_MS = 15000;

export const useTabTermination = ({
  userId,
  gameVersion,
  trainingComplete,
  gameComplete,
  isDisqualified,
  redirectTo,
}) => {
  const tabHiddenTimerRef = useRef(null);

  useEffect(() => {
    if (!userId || !gameVersion) return;

    const currentStage = trainingComplete ? "main_game" : "training";

    const clearHiddenTimer = () => {
      if (tabHiddenTimerRef.current) {
        clearTimeout(tabHiddenTimerRef.current);
        tabHiddenTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logTabVisibilityChange("hidden", currentStage);
        tabHiddenTimerRef.current = setTimeout(() => {
          if (gameComplete || isDisqualified) return;

          const redirectUrl = getReloadRedirectUrl(
            gameVersion,
            trainingComplete,
          );
          const finalUrl = buildParticipantRedirectUrl(redirectUrl, {
            userId,
            gameVersion,
          });

          if (finalUrl) {
            redirectTo(finalUrl, "tab_switch", currentStage);
          }
        }, AWAY_LIMIT_MS);
      } else {
        logTabVisibilityChange("visible", currentStage);
        clearHiddenTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearHiddenTimer();
    };
  }, [
    userId,
    gameVersion,
    trainingComplete,
    gameComplete,
    isDisqualified,
    redirectTo,
  ]);
};
