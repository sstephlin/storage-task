import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import { GAME_PARAMS, GAME_MESSAGES, INSTRUCTIONS } from "./params";
import { logButtonPress, logVialLevels } from "./logging";
import "./styles/VialGame.css";

const VialGame = () => {
  // Randomly determine initial game version
  const [hasBucket, setHasBucket] = useState(
    () => Math.random() < GAME_PARAMS.RANDOM_VERSION_PROBABILITY
  );

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [gameRunning, setGameRunning] = useState(true);
  const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
  const [messageType, setMessageType] = useState("playing");
  const [showOverflow, setShowOverflow] = useState(false);

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(
    GAME_PARAMS.ROUND_DURATION
  );
  const [isRoundTransition, setIsRoundTransition] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const vialLoggerRef = useRef(null);

  // Start game loop
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      gameLoopRef.current = setInterval(() => {
        // Drain both vials
        setVial1Level((prev) => Math.max(0, prev - GAME_PARAMS.DRAIN_RATE));
        setVial2Level((prev) => Math.max(0, prev - GAME_PARAMS.DRAIN_RATE));
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameRunning, isRoundTransition]);

  // Round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      roundTimerRef.current = setInterval(() => {
        setRoundTimeRemaining((prev) => {
          if (prev <= 1) {
            // Stop the timer and trigger round completion
            clearInterval(roundTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
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

  // Vial level logger - logs every second
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      vialLoggerRef.current = setInterval(() => {
        const currentState = {
          vial1Level,
          vial2Level,
          bucket2Level,
          hasBucket,
          gameRunning,
          currentRound,
          score,
          roundTimeRemaining,
        };
        logVialLevels(currentState);
      }, 1000); // Log every second
    } else {
      clearInterval(vialLoggerRef.current);
    }

    return () => clearInterval(vialLoggerRef.current);
  }, [
    gameRunning,
    isRoundTransition,
    vial1Level,
    vial2Level,
    bucket2Level,
    hasBucket,
    currentRound,
    score,
    roundTimeRemaining,
  ]);

  // Handle vial 2 overflow (only if bucket exists)
  useEffect(() => {
    if (hasBucket && vial2Level > GAME_PARAMS.MAX_LEVEL) {
      const overflow = vial2Level - GAME_PARAMS.MAX_LEVEL;
      setBucket2Level((prev) => Math.min(100, prev + overflow));
      setVial2Level(GAME_PARAMS.MAX_LEVEL);
      setShowOverflow(true);
    } else if (!hasBucket && vial2Level > GAME_PARAMS.MAX_LEVEL) {
      // Without bucket, cap at MAX_LEVEL without overflow
      setVial2Level(GAME_PARAMS.MAX_LEVEL);
      setShowOverflow(false);
    } else {
      setShowOverflow(false);
    }
  }, [vial2Level, hasBucket]);

  // Check for round failure (vial emptied)
  useEffect(() => {
    if (
      (vial1Level <= 0 || vial2Level <= 0) &&
      gameRunning &&
      !isRoundTransition
    ) {
      failRound();
    }
  }, [vial1Level, vial2Level, gameRunning, isRoundTransition]);

  const completeRound = () => {
    // Player survived the round!
    setScore((prev) => prev + 1);
    setIsRoundTransition(true);
    setGameMessage(GAME_MESSAGES.ROUND_COMPLETE);
    setMessageType("round-complete");

    // Reset vials and bucket for next round
    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setShowOverflow(false);
    }, 2000); // 2 second pause between rounds
  };

  const failRound = () => {
    // Player failed the round (vial emptied), but continue to next round
    setIsRoundTransition(true);
    setGameMessage(GAME_MESSAGES.GAME_OVER);
    setMessageType("round-failed");

    // Reset vials and bucket for next round (no score increase)
    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setShowOverflow(false);
      setGameRunning(true);
    }, 2000); // 2 second pause before next round
  };

  const addLiquid = (vialNumber) => {
    if (!gameRunning) return;

    // Log button press before state update
    const currentState = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
    };
    logButtonPress(`add_vial_${vialNumber}`, currentState);

    if (vialNumber === 1) {
      setVial1Level((prev) =>
        Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
      );
    } else if (vialNumber === 2) {
      if (hasBucket) {
        setVial2Level((prev) => prev + GAME_PARAMS.ADD_AMOUNT); // Allow overflow with bucket
      } else {
        setVial2Level((prev) =>
          Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
        ); // Cap without bucket
      }
    }
  };

  const emptyBucket = () => {
    if (!gameRunning || bucket2Level === 0 || !hasBucket) return;

    // Log button press before state update
    const currentState = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
    };
    logButtonPress("empty_bucket", currentState);

    setVial2Level((prev) => prev + bucket2Level);
    setBucket2Level(0);
  };

  const restartGame = () => {
    // Log button press before state update
    const currentState = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
    };
    logButtonPress("restart", currentState);

    setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
    setGameRunning(true);
    setGameMessage(GAME_MESSAGES.PLAYING);
    setShowOverflow(false);
    // Note: hasBucket remains the same, determined at component mount
  };

  const toggleGameVersion = () => {
    // Log button press before state update
    const currentState = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
    };
    logButtonPress("toggle_version", currentState);

    setHasBucket((prev) => !prev);
    // Reset game state when switching versions
    setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
    setGameRunning(true);
    setGameMessage(GAME_MESSAGES.PLAYING);
    setShowOverflow(false);
  };

  return (
    <div className="vial-game">
      <h1>Two Vials Game</h1>

      <div className="game-info">
        <div className="score-display">Score: {score}</div>
        <div className="round-display">Round: {currentRound + 1}</div>
        <div className="timer-display">Time: {roundTimeRemaining}s</div>
      </div>

      <GameStatus message={gameMessage} messageType={messageType} />

      <div className="game-container">
        <div className="vial-setup">
          <div className="liquid-level">Vial 1: {Math.round(vial1Level)}%</div>
          <Vial level={vial1Level} hasSpout={false} showOverflow={false} />
        </div>

        <div className="vial-setup">
          <div className="liquid-level">Vial 2: {Math.round(vial2Level)}%</div>
          <div className="vial-and-bucket">
            <Vial
              level={vial2Level}
              hasSpout={hasBucket}
              showOverflow={showOverflow}
              bucketLevel={bucket2Level}
            />
          </div>
        </div>
      </div>

      <GameControls
        onAddVial1={() => addLiquid(1)}
        onAddVial2={() => addLiquid(2)}
        onEmptyBucket={emptyBucket}
        onRestart={restartGame}
        onToggleVersion={toggleGameVersion}
        gameRunning={gameRunning && !isRoundTransition}
        bucketLevel={bucket2Level}
        hasBucket={hasBucket}
      />

      <div className="instructions">
        <p>
          <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
          {hasBucket ? (
            <> {INSTRUCTIONS.WITH_BUCKET}</>
          ) : (
            <> {INSTRUCTIONS.WITHOUT_BUCKET}</>
          )}{" "}
          {INSTRUCTIONS.ENDING}
        </p>
      </div>
    </div>
  );
};

export default VialGame;
