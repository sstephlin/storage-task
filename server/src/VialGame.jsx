import React, { useState, useEffect, useRef } from "react";
import Robot from "./components/Robot";
import GameControls from "./components/GameControls";
import RoundTransition from "./components/RoundTransition";
import Tutorial from "./instructions";
import GasStationIndicator from "./components/GasStationIndicator";
import { logButtonPress, logRoundStart, logRoundEnd } from "./logging";
import { PRODUCTION_MODE } from "./participantConfig";
import {
  GAME_PARAMS,
  GAME_MESSAGES,
  INSTRUCTIONS,
  getGameVersion,
  VERSION_CONFIG,
  generateGameSequences,
  VERSION_BUTTON_DELAYS,
  VERSION_DEPRIVATION_CONFIG,
  VERSION_VELOCITIES,
} from "./params";
import "./styles/VialGame.css";

const VialGame = ({
  userId,
  gameVersion,
  onComplete,
  isPaused = false,
  // Training mode props
  isTrainingMode = false,
  trainingParams = null,
  onRoundComplete = null,
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const versionConfig = VERSION_CONFIG[gameVersion];
  const buttonDelay = VERSION_BUTTON_DELAYS[gameVersion];
  const deprivationConfig = VERSION_DEPRIVATION_CONFIG[gameVersion];

  // Check if this version allows unrestricted bucket filling
  const allowUnrestrictedBucketFilling =
    versionConfig.allowUnrestrictedBucketFilling || false;
  // console.log("gameVersion:", gameVersion);
  // console.log("versionConfig:", versionConfig);

  // Use training parameters if in training mode
  const maxRounds = isTrainingMode
    ? trainingParams.MAX_ROUNDS
    : GAME_PARAMS.MAX_ROUNDS;
  const roundDuration = isTrainingMode
    ? trainingParams.ROUND_DURATION
    : GAME_PARAMS.ROUND_DURATION;
  const velocityConfig = VERSION_VELOCITIES[gameVersion];

  // const velocityConfig = isTrainingMode
  //   ? trainingParams.VELOCITIES[gameVersion]
  //   : VERSION_VELOCITIES[gameVersion];

  // console.log("=== VELOCITY DEBUG ===");
  // console.log("isTrainingMode:", isTrainingMode);
  // console.log("gameVersion:", gameVersion);
  // console.log("trainingParams:", trainingParams);
  // console.log("velocityConfig:", velocityConfig);
  // console.log(
  //   "VERSION_VELOCITIES[gameVersion]:",
  //   VERSION_VELOCITIES[gameVersion],
  // );

  // Generate all sequences based on version and mode
  const [gameSequences] = useState(() =>
    isTrainingMode && trainingParams?.sequences
      ? trainingParams.sequences
      : generateGameSequences(gameVersion, maxRounds, velocityConfig),
  );

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket1Level, setBucket1Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL,
  );
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL,
  );
  const [gameRunning, setGameRunning] = useState(false);
  const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
  const [messageType, setMessageType] = useState("playing");
  const [isAddingDisabled, setIsAddingDisabled] = useState(false);

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const currentDrainRate = gameSequences.velocitySequence[currentRound] || 1;
  const currentBucketConfig = gameSequences.bucketSequence[currentRound] || {
    vial1: 0,
    vial2: 0,
  };
  const currentPhase = gameSequences.phaseSequence[currentRound] || "abundance";

  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(roundDuration);
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [roundWasSuccessful, setRoundWasSuccessful] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  // Performance tracking for robot movement
  const [distanceSamples, setDistanceSamples] = useState([]);
  const [cumulativeProgress, setCumulativeProgress] = useState(0);
  const [previousRoundProgress, setPreviousRoundProgress] = useState(0);

  // Robot animation states
  const [isOverheated, setIsOverheated] = useState(false);
  const [isPoweredDown, setIsPoweredDown] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const keyLocked = useRef(false);
  const disableTimerRef = useRef(null);
  const previousPauseState = useRef(false);
  const audioContextRef = useRef(null);

  // Bucket assignment
  const vial1HasBucket = currentBucketConfig.vial1 === 1;
  const vial2HasBucket = currentBucketConfig.vial2 === 1;

  const vial1Paused = useRef(false);
  const vial2Paused = useRef(false);

  const gameStateRef = useRef({
    vial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    vial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    bucket1Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    bucket2Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    vial1HasBucket: false,
    vial2HasBucket: false,
    gameRunning: false,
    currentRound: 0,
    score: 0,
    roundTimeRemaining: roundDuration,
    currentDrainRate: 1,
    velocity: 0,
    roundWasSuccessful: true,
    setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
  });

  const [wasRunningBeforePause, setWasRunningBeforePause] = useState(false);
  const [frozenAddingDisabled, setFrozenAddingDisabled] = useState(false);
  // Handle pausing/resuming
  useEffect(() => {
    if (isPaused) {
      setWasRunningBeforePause(gameRunning);
      if (gameRunning) {
        setGameRunning(false);
      }
    } else {
      if (wasRunningBeforePause && !isRoundTransition && !showingAnimation) {
        setGameRunning(true);
      }
    }
  }, [isPaused, gameRunning, isRoundTransition, showingAnimation]);

  const isAbundancePhase = currentPhase === "abundance";

  useEffect(() => {
    gameStateRef.current = {
      vial1Level,
      vial2Level,
      bucket1Level,
      bucket2Level,
      vial1HasBucket,
      vial2HasBucket,
      gameRunning,
      currentRound,
      score,
      roundTimeRemaining,
      currentDrainRate,
      velocity: currentDrainRate,
      roundWasSuccessful,
      setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
      addAmount: GAME_PARAMS.ADD_AMOUNT,
    };
  }, [
    vial1Level,
    vial2Level,
    bucket1Level,
    bucket2Level,
    vial1HasBucket,
    vial2HasBucket,
    gameRunning,
    currentRound,
    score,
    roundTimeRemaining,
    currentDrainRate,
    roundWasSuccessful,
  ]);

  const handleTutorialExit = () => {
    setShowTutorial(false);
    setGameRunning(true);
    setTimeout(() => {
      logRoundStart(0, {
        numVials: versionConfig.numVials,
        vial1HasBucket: vial1HasBucket,
        vial2HasBucket: vial2HasBucket,
        velocity: currentDrainRate,
        setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
        phase: currentPhase,
        initialVial1Level: vial1Level,
        initialVial2Level: vial2Level,
        initialBucket1Level: bucket1Level,
        initialBucket2Level: bucket2Level,
        isTrainingMode: isTrainingMode,
      });
    }, 100);
  };

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (
      window.AudioContext || window.webkitAudioContext
    )();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-start game when tutorial is skipped (tutorial is now handled by App.jsx)
  useEffect(() => {
    if (!showTutorial && !gameRunning && currentRound === 0) {
      setGameRunning(true);
      setTimeout(() => {
        logRoundStart(0, {
          numVials: versionConfig.numVials,
          vial1HasBucket: vial1HasBucket,
          vial2HasBucket: vial2HasBucket,
          velocity: currentDrainRate,
          setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
          phase: currentPhase,
          initialVial1Level: vial1Level,
          initialVial2Level: vial2Level,
          initialBucket1Level: bucket1Level,
          initialBucket2Level: bucket2Level,
          isTrainingMode: isTrainingMode,
        });
      }, 100);
    }
  }, [showTutorial]); // Only run once when component mounts

  const playOverheatSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.9);
    osc.frequency.exponentialRampToValueAtTime(300, now + 1.2);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 1.1);
    gainNode.gain.linearRampToValueAtTime(0, now + 1.2);
    osc.type = "square";
    osc.start(now);
    osc.stop(now + 1.2);
  };

  const playPowerDownSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const tones = [
      { f0: 320, f1: 240, start: 0.0 },
      { f0: 240, f1: 170, start: 0.55 },
      { f0: 170, f1: 120, start: 1.1 },
    ];
    const toneDur = 0.6;
    tones.forEach(({ f0, f1, start }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "square";
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.frequency.setValueAtTime(f0, now + start);
      osc.frequency.exponentialRampToValueAtTime(f1, now + start + toneDur);
      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(0.3, now + start + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.28, now + start + toneDur - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + start + toneDur);
      osc.start(now + start);
      osc.stop(now + start + toneDur + 0.02);
    });
  };

  const playSuccessSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, start: 0.0 },
      { freq: 659.25, start: 0.15 },
      { freq: 783.99, start: 0.3 },
      { freq: 1046.5, start: 0.45 },
    ];

    const noteDur = 0.2;

    notes.forEach(({ freq, start }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.15, now + start + noteDur - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + start + noteDur);

      osc.start(now + start);
      osc.stop(now + start + noteDur);
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (
        isRoundTransition ||
        !gameRunning ||
        showTutorial ||
        showingAnimation ||
        isPaused
      )
        return;
      if (event.repeat) return;
      if (keyLocked.current) return;

      const getCurrentState = () => ({ ...gameStateRef.current });

      switch (event.key) {
        case "ArrowLeft":
          if (isAddingDisabled) return;
          event.preventDefault();
          keyLocked.current = true;
          logButtonPress("add_vial_1", {
            ...getCurrentState(),
            addAmount: GAME_PARAMS.ADD_AMOUNT,
            bucket1Level: bucket1Level,
            bucket2Level: bucket2Level,
            velocity: currentDrainRate,
            setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
          });
          vial1Paused.current = true;
          setVial1Level((prev) =>
            Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT),
          );
          setTimeout(() => {
            vial1Paused.current = false;
          }, 100);
          setTimeout(() => {
            keyLocked.current = false;
          }, buttonDelay);
          break;

        case "ArrowRight":
          if (versionConfig.numVials !== 2 || isAddingDisabled) return;
          event.preventDefault();
          keyLocked.current = true;
          logButtonPress("add_vial_2", {
            ...getCurrentState(),
            addAmount: GAME_PARAMS.ADD_AMOUNT,
            bucket1Level: bucket1Level,
            bucket2Level: bucket2Level,
            velocity: currentDrainRate,
            setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
          });
          vial2Paused.current = true;
          setVial2Level((prev) =>
            Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT),
          );
          setTimeout(() => {
            vial2Paused.current = false;
          }, 100);
          setTimeout(() => {
            keyLocked.current = false;
          }, buttonDelay);
          break;

        case "ArrowUp":
          event.preventDefault();
          keyLocked.current = true;
          if (vial1HasBucket && bucket1Level > 0) {
            setVial1Level((prev) => {
              // For simple version, allow filling to any level up to MAX
              const maxAddAmount = allowUnrestrictedBucketFilling
                ? GAME_PARAMS.MAX_LEVEL - prev
                : GAME_PARAMS.OPTIMAL_ZONE_MAX - prev;

              if (maxAddAmount <= 0) return prev; // Already at max allowed level

              const availableInBucket = bucket1Level;
              const amountToAdd = Math.min(maxAddAmount, availableInBucket);
              logButtonPress("empty_bucket_1", {
                ...getCurrentState(),
                addAmount: amountToAdd,
                bucket1Level: bucket1Level,
                bucket2Level: bucket2Level,
                velocity: currentDrainRate,
                setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
              });
              setBucket1Level((bucketPrev) =>
                Math.max(0, bucketPrev - amountToAdd),
              );
              return prev + amountToAdd;
            });
          } else if (
            vial2HasBucket &&
            bucket2Level > 0 &&
            versionConfig.numVials === 2
          ) {
            setVial2Level((prev) => {
              // For simple version, allow filling to any level up to MAX
              const maxAddAmount = allowUnrestrictedBucketFilling
                ? GAME_PARAMS.MAX_LEVEL - prev
                : GAME_PARAMS.OPTIMAL_ZONE_MAX - prev;

              if (maxAddAmount <= 0) return prev; // Already at max allowed level

              const availableInBucket = bucket2Level;
              const amountToAdd = Math.min(maxAddAmount, availableInBucket);
              logButtonPress("empty_bucket_2", {
                ...getCurrentState(),
                addAmount: amountToAdd,
                bucket1Level: bucket1Level,
                bucket2Level: bucket2Level,
                velocity: currentDrainRate,
                setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
              });
              setBucket2Level((bucketPrev) =>
                Math.max(0, bucketPrev - amountToAdd),
              );
              return prev + amountToAdd;
            });
          }
          setTimeout(() => {
            keyLocked.current = false;
          }, buttonDelay);
          break;

        case "ArrowDown":
          if (versionConfig.numVials !== 2) return;
          event.preventDefault();
          keyLocked.current = true;
          if (vial2HasBucket && bucket2Level > 0) {
            setVial2Level((prev) => {
              // For simple version, allow filling to any level up to MAX
              const maxAddAmount = allowUnrestrictedBucketFilling
                ? GAME_PARAMS.MAX_LEVEL - prev
                : GAME_PARAMS.OPTIMAL_ZONE_MAX - prev;

              if (maxAddAmount <= 0) return prev; // Already at max allowed level

              const availableInBucket = bucket2Level;
              const amountToAdd = Math.min(maxAddAmount, availableInBucket);
              logButtonPress("empty_bucket_2", getCurrentState());
              setBucket2Level((bucketPrev) =>
                Math.max(0, bucketPrev - amountToAdd),
              );
              return prev + amountToAdd;
            });
          }
          setTimeout(() => {
            keyLocked.current = false;
          }, buttonDelay);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isRoundTransition,
    gameRunning,
    showTutorial,
    showingAnimation,
    isPaused,
    isAddingDisabled,
    vial1HasBucket,
    vial2HasBucket,
    bucket1Level,
    bucket2Level,
    versionConfig.numVials,
    buttonDelay,
  ]);

  // Game loop with distance tracking
  useEffect(() => {
    if (gameRunning && !isRoundTransition && !showingAnimation && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        setVial1Level((prev) => {
          if (vial1Paused.current) return prev;
          const newLevel1 = Math.max(0, prev - currentDrainRate);

          // Modified bucket filling logic for simple version
          if (vial1HasBucket && newLevel1 < prev) {
            if (allowUnrestrictedBucketFilling) {
              // Simple version: only add to bucket when draining from ABOVE optimal zone
              if (prev > GAME_PARAMS.OPTIMAL_ZONE_MAX) {
                setBucket1Level((bucketPrev) =>
                  Math.min(100, bucketPrev + currentDrainRate),
                );
              }
            } else {
              // Original version: only add to bucket when in specific range
              if (
                prev > GAME_PARAMS.OPTIMAL_ZONE_MAX &&
                prev <= GAME_PARAMS.DANGER_UPPER &&
                newLevel1 >= GAME_PARAMS.OPTIMAL_ZONE_MAX
              ) {
                setBucket1Level((bucketPrev) =>
                  Math.min(100, bucketPrev + currentDrainRate),
                );
              }
            }
          }
          return newLevel1;
        });

        if (versionConfig.numVials === 2) {
          setVial2Level((prev) => {
            if (vial2Paused.current) return prev;
            const newLevel2 = Math.max(0, prev - currentDrainRate);

            // Modified bucket filling logic for simple version
            if (vial2HasBucket && newLevel2 < prev) {
              if (allowUnrestrictedBucketFilling) {
                // Simple version: only add to bucket when draining from ABOVE optimal zone
                if (prev > GAME_PARAMS.OPTIMAL_ZONE_MAX) {
                  setBucket2Level((bucketPrev) =>
                    Math.min(100, bucketPrev + currentDrainRate),
                  );
                }
              } else {
                // Original version: only add to bucket when in specific range
                if (
                  prev > GAME_PARAMS.OPTIMAL_ZONE_MAX &&
                  prev <= GAME_PARAMS.DANGER_UPPER &&
                  newLevel2 >= GAME_PARAMS.OPTIMAL_ZONE_MAX
                ) {
                  setBucket2Level((bucketPrev) =>
                    Math.min(100, bucketPrev + currentDrainRate),
                  );
                }
              }
            }
            return newLevel2;
          });
        }

        // Track distance from optimal zone
        setDistanceSamples((prevSamples) => {
          const vial1Distance = Math.abs(
            vial1Level - GAME_PARAMS.OPTIMAL_ZONE_MAX,
          );
          const vial2Distance =
            versionConfig.numVials === 2
              ? Math.abs(vial2Level - GAME_PARAMS.OPTIMAL_ZONE_MAX)
              : 0;

          // Average distance across all vials
          const avgDistance =
            versionConfig.numVials === 2
              ? (vial1Distance + vial2Distance) / 2
              : vial1Distance;

          return [...prevSamples, avgDistance];
        });
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [
    gameRunning,
    isRoundTransition,
    showingAnimation,
    isPaused,
    vial1HasBucket,
    vial2HasBucket,
    currentDrainRate,
    versionConfig.numVials,
    vial1Level,
    vial2Level,
    allowUnrestrictedBucketFilling,
  ]);

  // Round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition && !showingAnimation && !isPaused) {
      roundTimerRef.current = setInterval(() => {
        setRoundTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(roundTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(roundTimerRef.current);
    }
    return () => clearInterval(roundTimerRef.current);
  }, [gameRunning, isRoundTransition, showingAnimation, isPaused]);

  useEffect(() => {
    if (
      roundTimeRemaining === 0 &&
      gameRunning &&
      !isRoundTransition &&
      !showingAnimation
    ) {
      completeRound();
    }
  }, [roundTimeRemaining, gameRunning, isRoundTransition, showingAnimation]);

  // Gas station control based on phase
  useEffect(() => {
    if (!versionConfig.hasPhases) {
      setIsAddingDisabled(false);
      return;
    }
    if (isAbundancePhase) {
      setIsAddingDisabled(false);
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
    } else {
      if (gameRunning && !isRoundTransition && !showingAnimation) {
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
            setIsAddingDisabled(true);
            disableTimerRef.current = setTimeout(() => {
              setIsAddingDisabled(false);
              scheduleNextDisable();
            }, disableDuration);
          }, timeUntilDisable);
        };
        if (disableTimerRef.current) {
          clearTimeout(disableTimerRef.current);
        }
        scheduleNextDisable();
      } else {
        if (disableTimerRef.current) {
          clearTimeout(disableTimerRef.current);
          disableTimerRef.current = null;
        }
        setIsAddingDisabled(false);
      }
    }
    return () => {
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
    };
  }, [
    gameRunning,
    isRoundTransition,
    showingAnimation,
    isAbundancePhase,
    versionConfig.hasPhases,
    deprivationConfig,
  ]);

  // Check for round failure
  useEffect(() => {
    if (
      !gameRunning ||
      isRoundTransition ||
      roundTimeRemaining === 0 ||
      showingAnimation
    ) {
      return;
    }
    const checkVial1 = vial1Level <= 0 || vial1Level >= GAME_PARAMS.MAX_LEVEL;
    const checkVial2 =
      versionConfig.numVials === 2 &&
      (vial2Level <= 0 || vial2Level >= GAME_PARAMS.MAX_LEVEL);
    if (checkVial1 || checkVial2) {
      if (
        vial1Level >= GAME_PARAMS.MAX_LEVEL ||
        vial2Level >= GAME_PARAMS.MAX_LEVEL
      ) {
        setIsOverheated(true);
        playOverheatSound();
      } else {
        setIsPoweredDown(true);
        playPowerDownSound();
      }
      setShowingAnimation(true);
      setGameRunning(false);
      setTimeout(() => {
        setShowingAnimation(false);
        setIsOverheated(false);
        setIsPoweredDown(false);
        failRound();
      }, 2000);
    }
  }, [
    vial1Level,
    vial2Level,
    gameRunning,
    isRoundTransition,
    roundTimeRemaining,
    showingAnimation,
    versionConfig.numVials,
  ]);

  useEffect(() => {
    if (gameComplete && onComplete) {
      const timer = setTimeout(() => {
        try {
          onComplete();
        } catch (e) {
          console.error("Error calling onComplete:", e);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameComplete, onComplete]);

  useEffect(() => {
    if (showingAnimation) {
      setFrozenAddingDisabled(isAddingDisabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingAnimation]);

  const completeRound = () => {
    logRoundEnd(true);
    const previousProgress = cumulativeProgress;

    // const optimalAverage = GAME_PARAMS.ADD_AMOUNT / 2;
    const optimalAverage = 0;
    const worst_avg = Math.max(
      GAME_PARAMS.OPTIMAL_ZONE_MAX,
      100 - GAME_PARAMS.OPTIMAL_ZONE_MAX,
    );

    const avgDistance =
      distanceSamples.length > 0
        ? distanceSamples.reduce((sum, d) => sum + d, 0) /
          distanceSamples.length
        : (optimalAverage + worst_avg) / 2;

    const performanceRatio = Math.min(
      1,
      Math.max(
        0,
        1 - (avgDistance - optimalAverage) / (worst_avg - optimalAverage),
      ),
    );

    const roundContribution = (100 / GAME_PARAMS.MAX_ROUNDS) * performanceRatio;

    const newProgress = previousProgress + roundContribution;

    setScore((prev) => prev + 1);
    setRoundWasSuccessful(true);

    // Trigger celebration animation
    setIsCelebrating(true);
    setShowingAnimation(true);
    setGameRunning(false);
    playSuccessSound();

    // if (currentRound + 1 >= maxRounds) {
    //   setTimeout(() => {
    //     setShowingAnimation(false);
    //     setIsCelebrating(false);
    //     setGameComplete(true);
    //     setGameRunning(false);
    //   }, 2000);
    //   return;
    // }
    if (currentRound + 1 >= maxRounds) {
      if (isTrainingMode && onRoundComplete) {
        onRoundComplete(true);
      }
      setTimeout(() => {
        setShowingAnimation(false);
        setIsCelebrating(false);
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    // After celebration (2s), show transition screen
    setTimeout(() => {
      setShowingAnimation(false);
      setIsCelebrating(false);

      // NOW update the progress states right before showing transition
      setPreviousRoundProgress(previousProgress);
      setCumulativeProgress(newProgress);
      setIsRoundTransition(true);

      if (isTrainingMode && onRoundComplete) {
        onRoundComplete(true);
      }
      // After transition screen (3s), start next round
      setTimeout(() => {
        setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
        setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
        // setBucket1Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
        // setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
        setCurrentRound((prev) => prev + 1);
        setRoundTimeRemaining(roundDuration);
        setGameMessage(GAME_MESSAGES.PLAYING);
        setMessageType("playing");
        setIsRoundTransition(false);
        setGameRunning(true);

        // Reset distance samples for next round
        setDistanceSamples([]);

        const nextRound = currentRound + 1;
        const nextDrainRate = gameSequences.velocitySequence[nextRound] || 1;
        const nextBucketConfig = gameSequences.bucketSequence[nextRound] || {
          vial1: 0,
          vial2: 0,
        };
        const nextPhase = gameSequences.phaseSequence[nextRound] || "abundance";

        logRoundStart(nextRound, {
          numVials: versionConfig.numVials,
          vial1HasBucket: nextBucketConfig.vial1 === 1,
          vial2HasBucket: nextBucketConfig.vial2 === 1,
          velocity: nextDrainRate,
          setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
          phase: nextPhase,
          initialVial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
          initialVial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
          initialBucket1Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
          initialBucket2Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
          isTrainingMode: isTrainingMode,
        });
      }, GAME_PARAMS.TRANSITION_TIME);
    }, 2000);
  };

  const failRound = () => {
    logRoundEnd(false);

    const stepBack = 100 / GAME_PARAMS.MAX_ROUNDS; // one round's worth of progress (main game scale)
    const newProgress = Math.max(0, cumulativeProgress - stepBack);

    setPreviousRoundProgress(cumulativeProgress); // robot starts from current position
    setCumulativeProgress(newProgress);

    // On failure, no progress is added (robot stays in place)
    setDistanceSamples([]);

    // Call training callback if in training mode
    if (isTrainingMode && onRoundComplete) {
      onRoundComplete(false);
    }

    setRoundWasSuccessful(false);
    setIsRoundTransition(true);
    setGameRunning(false);

    if (currentRound + 1 >= maxRounds) {
      if (isTrainingMode && onRoundComplete) {
        onRoundComplete(true);
      }
      setTimeout(() => {
        setShowingAnimation(false);
        setIsCelebrating(false);
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      // setBucket1Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      // setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(roundDuration);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true);

      const nextRound = currentRound + 1;
      const nextDrainRate = gameSequences.velocitySequence[nextRound] || 1;
      const nextBucketConfig = gameSequences.bucketSequence[nextRound] || {
        vial1: 0,
        vial2: 0,
      };
      const nextPhase = gameSequences.phaseSequence[nextRound] || "abundance";

      logRoundStart(nextRound, {
        numVials: versionConfig.numVials,
        vial1HasBucket: nextBucketConfig.vial1 === 1,
        vial2HasBucket: nextBucketConfig.vial2 === 1,
        velocity: nextDrainRate,
        setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
        phase: nextPhase,
        initialVial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
        initialVial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
        initialBucket1Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
        initialBucket2Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
        isTrainingMode: isTrainingMode,
      });
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  if (showTutorial) {
    return <Tutorial onExit={handleTutorialExit} />;
  }
  if (gameComplete && isTrainingMode) {
    return null;
  }

  return (
    <div className="vial-game" data-training-mode={isTrainingMode}>
      {gameComplete ? (
        <div className="game-complete-screen">
          <h1>
            {isTrainingMode ? "Training Complete!" : "Thank You for Playing!"}
          </h1>
          <div className="completion-stats">
            <h2>Game Complete</h2>
            <p className="completion-message">
              You completed all {maxRounds} rounds!
            </p>
            <p className="final-score">
              Final Score: {score} / {maxRounds}
            </p>
            <p className="final-progress">
              Journey Progress: {Math.round(cumulativeProgress)}%
            </p>
            {!isTrainingMode && (
              <p className="thank-you-message">
                Thank you for participating in this experiment. Your data has
                been recorded.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {isRoundTransition && !isCelebrating && (
            <RoundTransition
              roundNumber={score}
              wasSuccessful={roundWasSuccessful}
              onComplete={() => {}}
              totalRounds={GAME_PARAMS.MAX_ROUNDS}
              score={score}
              cumulativeProgress={cumulativeProgress}
              previousProgress={previousRoundProgress}
              isTrainingMode={isTrainingMode}
              mainGameTotalRounds={GAME_PARAMS.MAX_ROUNDS}
            />
          )}
          <h1>
            {isTrainingMode && "PRACTICE: "}
            {versionConfig.name}
          </h1>

          <div className="game-info">
            {!PRODUCTION_MODE && (
              <>
                <div className="score-display">Score: {score}</div>
                <div className="round-display">
                  Round: {currentRound + 1} / {maxRounds}
                </div>
                <div className="timer-display">Time: {roundTimeRemaining}s</div>
                <div className="velocity-display">
                  Velocity: {currentDrainRate.toFixed(1)}
                </div>
                <div className="progress-display">
                  Progress: {Math.round(cumulativeProgress)}%
                </div>
              </>
            )}

            {versionConfig.hasPhases && (
              <div
                className="phase-display"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  backgroundColor: isAbundancePhase ? "#86efac" : "#fca5a5",
                  color: isAbundancePhase ? "#166534" : "#991b1b",
                }}
              >
                Phase: {isAbundancePhase ? "🌟 Abundance" : "⚠️ Deprivation"}
              </div>
            )}
          </div>

          <div
            className="game-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px",
            }}
          >
            <Robot
              vial1Level={vial1Level}
              vial2Level={vial2Level}
              isOverheated={isOverheated}
              isPoweredDown={isPoweredDown}
              isCelebrating={isCelebrating}
              numVials={versionConfig.numVials}
              vial1HasBucket={vial1HasBucket}
              vial2HasBucket={vial2HasBucket}
              bucket1Level={bucket1Level}
              bucket2Level={bucket2Level}
              isTrainingMode={isTrainingMode}
              trainingColors={
                isTrainingMode ? trainingParams.VIAL_COLORS : null
              }
            />

            {versionConfig.hasPhases && (
              <GasStationIndicator
                isActive={
                  showingAnimation ? !frozenAddingDisabled : !isAddingDisabled
                }
              />
            )}
          </div>

          <GameControls
            onAddVial1={() => {}}
            onAddVial2={() => {}}
            onEmptyBucket={() => {}}
            gameRunning={gameRunning && !isRoundTransition && !showingAnimation}
            bucketLevel={bucket2Level}
            hasBucket={vial1HasBucket || vial2HasBucket}
          />
          <div className="instructions">
            <p>
              <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
