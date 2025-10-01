import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import { GAME_PARAMS, GAME_MESSAGES, INSTRUCTIONS } from "./params";
import { logButtonPress } from "./logging";
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
  const [showOverflow, setShowOverflow] = useState(false);

  const gameLoopRef = useRef(null);

  // Start game loop
  useEffect(() => {
    if (gameRunning) {
      gameLoopRef.current = setInterval(() => {
        // Drain both vials
        setVial1Level((prev) => Math.max(0, prev - GAME_PARAMS.DRAIN_RATE));
        setVial2Level((prev) => Math.max(0, prev - GAME_PARAMS.DRAIN_RATE));
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameRunning]);

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

  // Check for game over
  useEffect(() => {
    if (vial1Level <= 0 || vial2Level <= 0) {
      setGameRunning(false);
      setGameMessage(GAME_MESSAGES.GAME_OVER);
    }
  }, [vial1Level, vial2Level]);

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

      <GameStatus message={gameMessage} isGameOver={!gameRunning} />

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
            {hasBucket && (
              <div className="bucket-label">
                Bucket: {Math.round(bucket2Level)}%
              </div>
            )}
          </div>
        </div>
      </div>

      <GameControls
        onAddVial1={() => addLiquid(1)}
        onAddVial2={() => addLiquid(2)}
        onEmptyBucket={emptyBucket}
        onRestart={restartGame}
        onToggleVersion={toggleGameVersion}
        gameRunning={gameRunning}
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
