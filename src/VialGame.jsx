// import React, { useState, useEffect, useRef } from "react";
// import Vial from "./components/Vial";
// import GameControls from "./components/GameControls";
// import GameStatus from "./components/GameStatus";
// import RoundTransition from "./components/RoundTransition";
// import {
//   GAME_PARAMS,
//   GAME_MESSAGES,
//   INSTRUCTIONS,
//   generateRoundSequence,
// } from "./params";
// import { logButtonPress, logVialLevels } from "./logging";
// import "./styles/VialGame.css";

// const VialGame = ({ userId }) => {
//   // Randomly determine initial game version
//   // const [hasBucket, setHasBucket] = useState(
//   //   () => Math.random() < GAME_PARAMS.RANDOM_VERSION_PROBABILITY
//   // );
//   const [roundSequence] = useState(() => generateRoundSequence());

//   const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//   const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//   const [bucket2Level, setBucket2Level] = useState(
//     GAME_PARAMS.INITIAL_BUCKET_LEVEL
//   );
//   const [gameRunning, setGameRunning] = useState(true);
//   const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
//   const [messageType, setMessageType] = useState("playing");

//   // Round management
//   const [currentRound, setCurrentRound] = useState(0);
//   const currentRoundConfig = roundSequence[currentRound];
//   console.log(currentRound);
//   console.log(currentRoundConfig);
//   // const [hasBucket, setHasBucket] = useState(
//   //   () => currentRoundConfig?.hasBucket
//   // );
//   const currentDrainRate = currentRoundConfig?.drainRate || 0.5;
//   const hasBucket = currentRoundConfig?.hasBucket || false;
//   const [score, setScore] = useState(0);
//   const [roundTimeRemaining, setRoundTimeRemaining] = useState(
//     GAME_PARAMS.ROUND_DURATION
//   );
//   const [isRoundTransition, setIsRoundTransition] = useState(false);
//   const [gameComplete, setGameComplete] = useState(false);

//   const gameLoopRef = useRef(null);
//   const roundTimerRef = useRef(null);
//   const vialLoggerRef = useRef(null);
//   const keyLocked = useRef(false);

//   // Set game version in Firebase when component mounts or hasBucket changes
//   // useEffect(() => {
//   //   setGameVersion(hasBucket);
//   // }, [hasBucket]);

//   // Keyboard controls
//   useEffect(() => {
//     const handleKeyPress = (event) => {
//       // Ignore key presses during round transitions
//       if (isRoundTransition || !gameRunning) return;
//       // ignore key presses if another key is being pressed
//       if (event.repeat) return; // Ignore hold repeats
//       if (keyLocked.current) return;
//       keyLocked.current = true;

//       // Get current state for logging
//       const getCurrentState = () => ({
//         vial1Level,
//         vial2Level,
//         bucket2Level,
//         hasBucket,
//         gameRunning,
//         currentRound,
//         score,
//         roundTimeRemaining,
//       });

//       switch (event.key) {
//         case "ArrowLeft":
//           event.preventDefault();
//           if (vial1Level < GAME_PARAMS.MAX_LEVEL) {
//             logButtonPress("add_vial_1", getCurrentState());
//             setVial1Level((prev) =>
//               Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
//             );
//           }
//           break;
//         case "ArrowRight":
//           event.preventDefault();
//           logButtonPress("add_vial_2", getCurrentState());
//           if (hasBucket) {
//             setVial2Level((prev) => prev + GAME_PARAMS.ADD_AMOUNT);
//           } else {
//             setVial2Level((prev) =>
//               Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
//             );
//           }
//           break;
//         case "ArrowUp":
//           if (hasBucket && bucket2Level > 0) {
//             event.preventDefault();
//             logButtonPress("empty_bucket", getCurrentState());
//             setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
//             if (bucket2Level - GAME_PARAMS.EMPTY_BUCKET_AMOUNT < 0) {
//               setBucket2Level(0);
//             } else {
//               setBucket2Level((prev) => prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
//             }
//           }
//           break;
//         default:
//           break;
//       }
//       setTimeout(() => {
//         keyLocked.current = false;
//       }, 100); // Adjust if needed
//     };

//     window.addEventListener("keydown", handleKeyPress);
//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, [
//     isRoundTransition,
//     gameRunning,
//     hasBucket,
//     vial1Level,
//     vial2Level,
//     bucket2Level,
//     currentRound,
//     score,
//     roundTimeRemaining,
//   ]);

//   // Start game loop
//   useEffect(() => {
//     if (gameRunning && !isRoundTransition) {
//       gameLoopRef.current = setInterval(() => {
//         // Drain both vials
//         setVial1Level((prev) => Math.max(0, prev - currentDrainRate));

//         // Handle vial 2 draining and bucket filling
//         setVial2Level((prev) => {
//           const newLevel = Math.max(0, prev - currentDrainRate);

//           // Only add to bucket if vial is actually draining in the overflow zone
//           // (not when user is adding liquid)
//           if (
//             hasBucket &&
//             prev > GAME_PARAMS.OPTIMAL_ZONE_MAX &&
//             prev <= GAME_PARAMS.DANGER_UPPER &&
//             newLevel >= GAME_PARAMS.OPTIMAL_ZONE_MAX // Still in or above the zone after draining
//           ) {
//             // The liquid that drained from the vial goes into the bucket
//             setBucket2Level((bucketPrev) => {
//               if (bucketPrev < 100) {
//                 return Math.min(100, bucketPrev + currentDrainRate);
//               }
//               return bucketPrev;
//             });
//           }

//           // Cap vial at MAX_LEVEL if no bucket or bucket is full
//           if (!hasBucket && newLevel > GAME_PARAMS.MAX_LEVEL) {
//             return GAME_PARAMS.MAX_LEVEL;
//           }

//           return newLevel;
//         });
//       }, GAME_PARAMS.GAME_SPEED);
//     } else {
//       clearInterval(gameLoopRef.current);
//     }
//     return () => clearInterval(gameLoopRef.current);
//   }, [gameRunning, isRoundTransition, hasBucket, currentDrainRate]);

//   // Round timer
//   useEffect(() => {
//     if (gameRunning && !isRoundTransition) {
//       roundTimerRef.current = setInterval(() => {
//         setRoundTimeRemaining((prev) => {
//           if (prev <= 1) {
//             // Stop the timer and trigger round completion
//             clearInterval(roundTimerRef.current);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000); // Update every second
//     } else {
//       clearInterval(roundTimerRef.current);
//     }

//     return () => clearInterval(roundTimerRef.current);
//   }, [gameRunning, isRoundTransition]);

//   // Check for round completion
//   useEffect(() => {
//     if (roundTimeRemaining === 0 && gameRunning && !isRoundTransition) {
//       completeRound();
//       // setHasBucket(
//       //   () => Math.random() < GAME_PARAMS.RANDOM_VERSION_PROBABILITY
//       // );
//     }
//   }, [roundTimeRemaining, gameRunning, isRoundTransition]);
//   const gameStateRef = useRef();

//   useEffect(() => {
//     gameStateRef.current = {
//       vial1Level,
//       vial2Level,
//       bucket2Level,
//       hasBucket,
//       gameRunning,
//       currentRound,
//       score,
//       roundTimeRemaining,
//       currentDrainRate,
//     };
//     console.log("Game State Updated:", gameStateRef.current);
//   }, [
//     vial1Level,
//     vial2Level,
//     bucket2Level,
//     hasBucket,
//     gameRunning,
//     currentRound,
//     score,
//     roundTimeRemaining,
//     // currentDrainRate,
//   ]);

//   // Logging interval
//   useEffect(() => {
//     if (gameRunning && !isRoundTransition) {
//       vialLoggerRef.current = setInterval(() => {
//         logVialLevels(gameStateRef.current); // Always latest values
//       }, 100);
//     } else {
//       clearInterval(vialLoggerRef.current);
//     }

//     return () => clearInterval(vialLoggerRef.current);
//   }, [gameRunning, isRoundTransition]);

//   // Check for round failure (vial emptied)
//   useEffect(() => {
//     console.log(vial1Level);
//     if (
//       (vial1Level <= 0 ||
//         vial2Level <= 0 ||
//         vial1Level >= GAME_PARAMS.MAX_LEVEL ||
//         vial2Level >= GAME_PARAMS.MAX_LEVEL) &&
//       gameRunning &&
//       !isRoundTransition
//     ) {
//       failRound();
//     }
//   }, [vial1Level, vial2Level, gameRunning, isRoundTransition]);

//   const completeRound = () => {
//     // Player survived the round!
//     setScore((prev) => prev + 1);
//     setIsRoundTransition(true);
//     setGameMessage(GAME_MESSAGES.ROUND_COMPLETE);
//     setMessageType("round-complete");

//     // Check if this was the final round
//     if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
//       // Game is complete after 20 rounds
//       setTimeout(() => {
//         setGameComplete(true);
//         setGameRunning(false);
//       }, 2000);
//       return;
//     }

//     // Reset vials and bucket for next round
//     setTimeout(() => {
//       setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//       setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//       setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
//       setCurrentRound((prev) => prev + 1);
//       setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
//       setGameMessage(GAME_MESSAGES.PLAYING);
//       setMessageType("playing");
//       setIsRoundTransition(false);
//     }, GAME_PARAMS.TRANSITION_TIME); // 2 second pause between rounds
//   };

//   const failRound = () => {
//     // Player failed the round (vial emptied), but continue to next round
//     setIsRoundTransition(true);
//     setGameMessage(GAME_MESSAGES.GAME_OVER);
//     setMessageType("round-failed");

//     // Check if this was the final round
//     if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
//       // Game is complete after 20 rounds
//       setTimeout(() => {
//         setGameComplete(true);
//         setGameRunning(false);
//       }, 2000);
//       return;
//     }

//     // Reset vials and bucket for next round (no score increase)
//     setTimeout(() => {
//       setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//       setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//       setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
//       setCurrentRound((prev) => prev + 1);
//       setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
//       setGameMessage(GAME_MESSAGES.PLAYING);
//       setMessageType("playing");
//       setIsRoundTransition(false);
//       setGameRunning(true);
//     }, GAME_PARAMS.TRANSITION_TIME); // 5 second pause before next round
//   };

//   const restartGame = () => {
//     // Log button press before state update
//     const currentState = {
//       vial1Level,
//       vial2Level,
//       bucket2Level,
//       hasBucket,
//       gameRunning,
//       currentRound,
//       score,
//       roundTimeRemaining,
//     };
//     logButtonPress("restart", currentState);

//     setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//     setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//     setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
//     setGameRunning(true);
//     setGameMessage(GAME_MESSAGES.PLAYING);
//     setMessageType("playing");
//     setCurrentRound(0);
//     setScore(0);
//     setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
//     setIsRoundTransition(false);
//     setGameComplete(false);
//   };

//   const toggleGameVersion = () => {
//     // Log button press before state update
//     const currentState = {
//       vial1Level,
//       vial2Level,
//       bucket2Level,
//       hasBucket,
//       gameRunning,
//       currentRound,
//       score,
//       roundTimeRemaining,
//     };
//     logButtonPress("toggle_version", currentState);

//     setHasBucket((prev) => !prev);
//     // Reset game state when switching versions
//     setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//     setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
//     setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
//     setGameRunning(true);
//     setGameMessage(GAME_MESSAGES.PLAYING);
//     setMessageType("playing");
//     setCurrentRound(0);
//     setScore(0);
//     setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
//     setIsRoundTransition(false);
//     setGameComplete(false);
//   };

//   return (
//     <div className="vial-game">
//       {gameComplete ? (
//         <div className="game-complete-screen">
//           <h1>Thank You for Playing!</h1>
//           <div className="completion-stats">
//             <h2>Game Complete</h2>
//             <p className="completion-message">
//               You completed all {GAME_PARAMS.MAX_ROUNDS} rounds!
//             </p>
//             <p className="thank-you-message">
//               Thank you for participating in this experiment. Your data has been
//               recorded.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <>
//           {isRoundTransition && (
//             <RoundTransition
//               round={currentRound + 1}
//               message={gameMessage} // "Round Complete", "Game Over", etc.
//             />
//           )}
//           <h1>Two Vials Game</h1>

//           <div className="game-info">
//             <div className="score-display">Score: {score}</div>
//             <div className="round-display">
//               Round: {currentRound + 1} / {GAME_PARAMS.MAX_ROUNDS}
//             </div>
//             <div className="timer-display">Time: {roundTimeRemaining}s</div>
//           </div>

//           <GameStatus message={gameMessage} messageType={messageType} />

//           <div className="game-container">
//             <div className="vial-setup">
//               <div className="liquid-level">
//                 Vial 1: {Math.round(vial1Level)}%
//               </div>
//               <Vial level={vial1Level} hasSpout={false} bucketLevel={0} />
//             </div>

//             <div className="vial-setup">
//               <div className="liquid-level">
//                 Vial 2: {Math.round(vial2Level)}%
//               </div>
//               <div className="vial-and-bucket">
//                 <Vial
//                   level={vial2Level}
//                   hasSpout={hasBucket}
//                   bucketLevel={bucket2Level}
//                 />
//               </div>
//             </div>
//           </div>

//           <GameControls
//             onAddVial1={() => {}}
//             onAddVial2={() => {}}
//             onEmptyBucket={() => {}}
//             onRestart={restartGame}
//             onToggleVersion={toggleGameVersion}
//             gameRunning={gameRunning && !isRoundTransition}
//             bucketLevel={bucket2Level}
//             hasBucket={hasBucket}
//           />

//           <div className="instructions">
//             <p>
//               <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
//             </p>
//             <p className="keyboard-controls">
//               <strong>Controls:</strong> {INSTRUCTIONS.CONTROLS_BASE}
//               {hasBucket && INSTRUCTIONS.CONTROLS_WITH_BUCKET}
//             </p>
//             <p>
//               {hasBucket ? (
//                 <>{INSTRUCTIONS.WITH_BUCKET}</>
//               ) : (
//                 <>{INSTRUCTIONS.WITHOUT_BUCKET}</>
//               )}{" "}
//               {INSTRUCTIONS.ENDING}
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VialGame;
import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import RoundTransition from "./components/RoundTransition";
import {
  GAME_PARAMS,
  GAME_MESSAGES,
  INSTRUCTIONS,
  generateRoundSequence,
} from "./params";
import { logButtonPress, logVialLevels } from "./logging";
import "./styles/VialGame.css";

const VialGame = ({ userId }) => {
  const [roundSequence] = useState(() => generateRoundSequence());

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [gameRunning, setGameRunning] = useState(true);
  const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
  const [messageType, setMessageType] = useState("playing");

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const currentRoundConfig = roundSequence[currentRound];
  const currentDrainRate = currentRoundConfig?.drainRate || 0.5;
  const hasBucket = currentRoundConfig?.hasBucket || false;
  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(
    GAME_PARAMS.ROUND_DURATION
  );
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const vialLoggerRef = useRef(null);
  const keyLocked = useRef(false);

  // Create a ref that ALWAYS has the current state - updated synchronously
  const gameStateRef = useRef({
    vial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    vial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    bucket2Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    hasBucket: false,
    gameRunning: true,
    currentRound: 0,
    score: 0,
    roundTimeRemaining: GAME_PARAMS.ROUND_DURATION,
    currentDrainRate: 0.5,
    velocity: 0, // Add velocity field
  });

  // Update ref immediately when any state changes
  useEffect(() => {
    gameStateRef.current = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
      currentRound,
      score,
      roundTimeRemaining,
      currentDrainRate,
      velocity: currentDrainRate, // Use drain rate as velocity
    };
  }, [
    vial1Level,
    vial2Level,
    bucket2Level,
    hasBucket,
    gameRunning,
    currentRound,
    score,
    roundTimeRemaining,
    currentDrainRate,
  ]);

  // Keyboard controls - now uses ref for current state
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore key presses during round transitions
      if (isRoundTransition || !gameRunning) return;
      if (event.repeat) return; // Ignore hold repeats
      if (keyLocked.current) return;
      keyLocked.current = true;

      // Get CURRENT state from ref (not closure)
      const getCurrentState = () => ({ ...gameStateRef.current });

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (gameStateRef.current.vial1Level < GAME_PARAMS.MAX_LEVEL) {
            logButtonPress("add_vial_1", getCurrentState());
            setVial1Level((prev) =>
              Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
            );
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          logButtonPress("add_vial_2", getCurrentState());
          if (gameStateRef.current.hasBucket) {
            setVial2Level((prev) => prev + GAME_PARAMS.ADD_AMOUNT);
          } else {
            setVial2Level((prev) =>
              Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
            );
          }
          break;
        case "ArrowUp":
          if (
            gameStateRef.current.hasBucket &&
            gameStateRef.current.bucket2Level > 0
          ) {
            event.preventDefault();
            logButtonPress("empty_bucket", getCurrentState());
            setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            if (
              gameStateRef.current.bucket2Level -
                GAME_PARAMS.EMPTY_BUCKET_AMOUNT <
              0
            ) {
              setBucket2Level(0);
            } else {
              setBucket2Level((prev) => prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            }
          }
          break;
        default:
          break;
      }
      setTimeout(() => {
        keyLocked.current = false;
      }, 100);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRoundTransition, gameRunning]); // Minimal dependencies - state accessed via ref

  // Start game loop
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      gameLoopRef.current = setInterval(() => {
        // Drain both vials
        setVial1Level((prev) => Math.max(0, prev - currentDrainRate));

        // Handle vial 2 draining and bucket filling
        setVial2Level((prev) => {
          const newLevel = Math.max(0, prev - currentDrainRate);

          if (
            hasBucket &&
            prev > GAME_PARAMS.OPTIMAL_ZONE_MAX &&
            prev <= GAME_PARAMS.DANGER_UPPER &&
            newLevel >= GAME_PARAMS.OPTIMAL_ZONE_MAX
          ) {
            setBucket2Level((bucketPrev) => {
              if (bucketPrev < 100) {
                return Math.min(100, bucketPrev + currentDrainRate);
              }
              return bucketPrev;
            });
          }

          if (!hasBucket && newLevel > GAME_PARAMS.MAX_LEVEL) {
            return GAME_PARAMS.MAX_LEVEL;
          }

          return newLevel;
        });
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameRunning, isRoundTransition, hasBucket, currentDrainRate]);

  // Round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
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
  }, [gameRunning, isRoundTransition]);

  // Check for round completion
  useEffect(() => {
    if (roundTimeRemaining === 0 && gameRunning && !isRoundTransition) {
      completeRound();
    }
  }, [roundTimeRemaining, gameRunning, isRoundTransition]);

  // Logging interval - now uses ref
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      vialLoggerRef.current = setInterval(() => {
        logVialLevels(gameStateRef.current);
      }, 100);
    } else {
      clearInterval(vialLoggerRef.current);
    }

    return () => clearInterval(vialLoggerRef.current);
  }, [gameRunning, isRoundTransition]);

  // Check for round failure (vial emptied)
  useEffect(() => {
    if (
      (vial1Level <= 0 ||
        vial2Level <= 0 ||
        vial1Level >= GAME_PARAMS.MAX_LEVEL ||
        vial2Level >= GAME_PARAMS.MAX_LEVEL) &&
      gameRunning &&
      !isRoundTransition
    ) {
      failRound();
    }
  }, [vial1Level, vial2Level, gameRunning, isRoundTransition]);

  const completeRound = () => {
    setScore((prev) => prev + 1);
    setIsRoundTransition(true);
    setGameMessage(GAME_MESSAGES.ROUND_COMPLETE);
    setMessageType("round-complete");

    if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
      setTimeout(() => {
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  const failRound = () => {
    setIsRoundTransition(true);
    setGameMessage(GAME_MESSAGES.GAME_OVER);
    setMessageType("round-failed");

    if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
      setTimeout(() => {
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true);
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  const restartGame = () => {
    logButtonPress("restart", { ...gameStateRef.current });

    setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
    setGameRunning(true);
    setGameMessage(GAME_MESSAGES.PLAYING);
    setMessageType("playing");
    setCurrentRound(0);
    setScore(0);
    setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
    setIsRoundTransition(false);
    setGameComplete(false);
  };

  const toggleGameVersion = () => {
    logButtonPress("toggle_version", { ...gameStateRef.current });

    // Note: This function may not work as expected since hasBucket
    // is now derived from roundSequence, not a state variable
    console.warn(
      "toggleGameVersion may not work correctly with round sequence"
    );
  };

  return (
    <div className="vial-game">
      {gameComplete ? (
        <div className="game-complete-screen">
          <h1>Thank You for Playing!</h1>
          <div className="completion-stats">
            <h2>Game Complete</h2>
            <p className="completion-message">
              You completed all {GAME_PARAMS.MAX_ROUNDS} rounds!
            </p>
            <p className="thank-you-message">
              Thank you for participating in this experiment. Your data has been
              recorded.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isRoundTransition && (
            <RoundTransition round={currentRound + 1} message={gameMessage} />
          )}
          <h1>Two Vials Game</h1>

          <div className="game-info">
            <div className="score-display">Score: {score}</div>
            <div className="round-display">
              Round: {currentRound + 1} / {GAME_PARAMS.MAX_ROUNDS}
            </div>
            <div className="timer-display">Time: {roundTimeRemaining}s</div>
          </div>

          <GameStatus message={gameMessage} messageType={messageType} />

          <div className="game-container">
            <div className="vial-setup">
              <div className="liquid-level">
                Vial 1: {Math.round(vial1Level)}%
              </div>
              <Vial level={vial1Level} hasSpout={false} bucketLevel={0} />
            </div>

            <div className="vial-setup">
              <div className="liquid-level">
                Vial 2: {Math.round(vial2Level)}%
              </div>
              <div className="vial-and-bucket">
                <Vial
                  level={vial2Level}
                  hasSpout={hasBucket}
                  bucketLevel={bucket2Level}
                />
              </div>
            </div>
          </div>

          <GameControls
            onAddVial1={() => {}}
            onAddVial2={() => {}}
            onEmptyBucket={() => {}}
            onRestart={restartGame}
            onToggleVersion={toggleGameVersion}
            gameRunning={gameRunning && !isRoundTransition}
            bucketLevel={bucket2Level}
            hasBucket={hasBucket}
          />

          <div className="instructions">
            <p>
              <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
            </p>
            <p className="keyboard-controls">
              <strong>Controls:</strong> {INSTRUCTIONS.CONTROLS_BASE}
              {hasBucket && INSTRUCTIONS.CONTROLS_WITH_BUCKET}
            </p>
            <p>
              {hasBucket ? (
                <>{INSTRUCTIONS.WITH_BUCKET}</>
              ) : (
                <>{INSTRUCTIONS.WITHOUT_BUCKET}</>
              )}{" "}
              {INSTRUCTIONS.ENDING}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
