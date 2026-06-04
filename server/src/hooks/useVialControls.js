/**
 * manages keyboard input, add-to-vial behavior, empty-bucket behavior, and button-press logging.
 */
import { useCallback, useEffect } from "react";
import { logButtonPress } from "../data/logging";
import { GAME_PARAMS } from "../data/params";
import { getBucketTransferAmount } from "../utils/vialGameLogic";

export const useVialControls = ({
  isEnabled,
  keyLocked,
  buttonDelay,
  numVials,
  vial1HasBucket,
  vial2HasBucket,
  vial1Paused,
  vial2Paused,
  vial1Level,
  vial2Level,
  bucket1Level,
  bucket2Level,
  currentRound,
  score,
  roundTimeRemaining,
  currentDrainRate,
  roundWasSuccessful,
  isAddingDisabledRef,
  isTrainingMode,
  setVial1Level,
  setVial2Level,
  setBucket1Level,
  setBucket2Level,
}) => {
  const getCurrentState = useCallback(
    () => ({
      vial1Level,
      vial2Level,
      bucket1Level,
      bucket2Level,
      currentRound,
      score,
      roundTimeRemaining,
      currentDrainRate,
      velocity: currentDrainRate,
      roundWasSuccessful,
      setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
      addAmount: GAME_PARAMS.ADD_AMOUNT,
      isAddingDisabled: isAddingDisabledRef.current,
      gasStationActive: !isAddingDisabledRef.current,
    }),
    [
      bucket1Level,
      bucket2Level,
      currentDrainRate,
      currentRound,
      isAddingDisabledRef,
      roundTimeRemaining,
      roundWasSuccessful,
      score,
      vial1Level,
      vial2Level,
    ],
  );

  const unlockKeyAfterDelay = useCallback(() => {
    setTimeout(() => {
      keyLocked.current = false;
    }, buttonDelay);
  }, [buttonDelay, keyLocked]);

  const handleAddVial = useCallback(
    (vialNum, event) => {
      const setVial = vialNum === 1 ? setVial1Level : setVial2Level;
      const vialPausedRef = vialNum === 1 ? vial1Paused : vial2Paused;

      event.preventDefault();
      keyLocked.current = true;

      logButtonPress(
        vialNum === 1 ? "add_vial_1" : "add_vial_2",
        getCurrentState(),
        isTrainingMode,
        isAddingDisabledRef.current ? 0 : GAME_PARAMS.ADD_AMOUNT,
      );

      if (!isAddingDisabledRef.current) {
        vialPausedRef.current = true;
        setVial((prev) =>
          Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT),
        );
        setTimeout(() => {
          vialPausedRef.current = false;
        }, 100);
      }

      unlockKeyAfterDelay();
    },
    [
      getCurrentState,
      isAddingDisabledRef,
      isTrainingMode,
      keyLocked,
      setVial1Level,
      setVial2Level,
      unlockKeyAfterDelay,
      vial1Paused,
      vial2Paused,
    ],
  );

  const handleEmptyBucket = useCallback(
    (vialNum, event) => {
      const bucketLevel = vialNum === 1 ? bucket1Level : bucket2Level;
      const setVial = vialNum === 1 ? setVial1Level : setVial2Level;
      const setBucket = vialNum === 1 ? setBucket1Level : setBucket2Level;
      const currentVialLevel = vialNum === 1 ? vial1Level : vial2Level;
      const actionName = vialNum === 1 ? "empty_bucket_1" : "empty_bucket_2";

      event.preventDefault();
      keyLocked.current = true;

      const amountToAdd = getBucketTransferAmount(
        currentVialLevel,
        bucketLevel,
      );

      logButtonPress(
        actionName,
        getCurrentState(),
        isTrainingMode,
        +amountToAdd.toFixed(2),
      );

      if (amountToAdd > 0) {
        setVial((prev) => prev + amountToAdd);
        setBucket((prev) => Math.max(0, prev - amountToAdd));
      }

      unlockKeyAfterDelay();
    },
    [
      bucket1Level,
      bucket2Level,
      getCurrentState,
      isTrainingMode,
      keyLocked,
      setBucket1Level,
      setBucket2Level,
      setVial1Level,
      setVial2Level,
      unlockKeyAfterDelay,
      vial1Level,
      vial2Level,
    ],
  );

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isEnabled || event.repeat || keyLocked.current) return;

      switch (event.key) {
        case "ArrowLeft":
          handleAddVial(1, event);
          break;
        case "ArrowRight":
          if (numVials !== 2) return;
          handleAddVial(2, event);
          break;
        case "ArrowUp":
          if (vial1HasBucket) {
            handleEmptyBucket(1, event);
          } else if (vial2HasBucket && numVials === 2) {
            handleEmptyBucket(2, event);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    handleAddVial,
    handleEmptyBucket,
    isEnabled,
    keyLocked,
    numVials,
    vial1HasBucket,
    vial2HasBucket,
  ]);
};
