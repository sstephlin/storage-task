/**
 * countdown and redirect after reload termination.
 */
import { useEffect, useState } from "react";
import { validateUrlParams } from "../data/participantConfig";
import {
  buildParticipantRedirectUrl,
  getReloadRedirectUrl,
} from "../utils/redirectUtils";

export const useReloadRedirect = ({
  showReloadModal,
  trainingComplete,
  cleanupReloadWarning,
  redirectTo,
}) => {
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [hasRedirect, setHasRedirect] = useState(true);

  useEffect(() => {
    if (!showReloadModal) {
      setRedirectCountdown(5);
      setHasRedirect(true);
      return;
    }

    cleanupReloadWarning();

    const { participantId, version } = validateUrlParams();
    const redirectUrl = getReloadRedirectUrl(version, trainingComplete);
    const finalUrl = buildParticipantRedirectUrl(redirectUrl, {
      userId: participantId,
      gameVersion: version,
      participantParam: "PROLIFIC_ID",
    });

    setHasRedirect(Boolean(finalUrl));
    if (!finalUrl) return;

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          redirectTo(
            finalUrl,
            "reload",
            trainingComplete ? "main_game" : "training",
          );
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cleanupReloadWarning, redirectTo, showReloadModal, trainingComplete]);

  return { redirectCountdown, hasRedirect };
};
