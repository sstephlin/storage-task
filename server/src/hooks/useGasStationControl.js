/**
 * logic for managing gas-station enable/disable timing and gas-station logging.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { logGasStationToggle } from "../data/logging";

export const useGasStationControl = ({
  hasPhases,
  isAbundancePhase,
  deprivationConfig,
  gameRunning,
  isRoundTransition,
  showingAnimation,
  isTrainingMode,
  roundKey,
}) => {
  const [isAddingDisabled, setIsAddingDisabledState] = useState(false);
  const [frozenAddingDisabled, setFrozenAddingDisabled] = useState(false);
  const isAddingDisabledRef = useRef(false);
  const disableTimerRef = useRef(null);
  const prevRoundKey = useRef(null);

  const setAddingDisabled = useCallback((value) => {
    isAddingDisabledRef.current = value;
    setIsAddingDisabledState(value);
  }, []);

  useEffect(() => {
    if (!hasPhases) {
      setAddingDisabled(false);
      return;
    }

    const clearDisableTimer = () => {
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
    };

    if (isAbundancePhase) {
      setAddingDisabled(false);
      clearDisableTimer();
      return;
    }

    if (gameRunning && !isRoundTransition && !showingAnimation) {
      if (roundKey !== prevRoundKey.current) {
        setAddingDisabled(false);
      }
      const scheduleNextDisable = () => {
        const timeUntilDisable =
          Math.random() *
            (deprivationConfig.maxTimeUntilDisable -
              deprivationConfig.minTimeUntilDisable) +
          deprivationConfig.minTimeUntilDisable;

        disableTimerRef.current = setTimeout(() => {
          const disableDuration =
            Math.random() *
              (deprivationConfig.maxDisableDuration -
                deprivationConfig.minDisableDuration) +
            deprivationConfig.minDisableDuration;

          setAddingDisabled(true);
          disableTimerRef.current = setTimeout(() => {
            setAddingDisabled(false);
            scheduleNextDisable();
          }, disableDuration);
        }, timeUntilDisable);
      };

      clearDisableTimer();
      scheduleNextDisable();
    } else {
      clearDisableTimer();
      // setAddingDisabled(false);
    }

    return clearDisableTimer;
  }, [
    deprivationConfig,
    gameRunning,
    hasPhases,
    isAbundancePhase,
    isRoundTransition,
    setAddingDisabled,
    showingAnimation,
  ]);

  useEffect(() => {
    if (!gameRunning || isRoundTransition || showingAnimation) return;

    const isRoundStart = roundKey !== prevRoundKey.current;
    prevRoundKey.current = roundKey;

    logGasStationToggle(!isAddingDisabled, isTrainingMode, isRoundStart);
  }, [
    isAddingDisabled,
    gameRunning,
    isRoundTransition,
    showingAnimation,
    isTrainingMode,
    roundKey,
  ]);

  useEffect(() => {
    if (showingAnimation) {
      setFrozenAddingDisabled(isAddingDisabledRef.current);
    }
  }, [showingAnimation]);

  return {
    isAddingDisabled,
    isAddingDisabledRef,
    frozenAddingDisabled,
  };
};
