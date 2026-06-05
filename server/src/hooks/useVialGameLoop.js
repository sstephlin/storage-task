/**
 * manages the interval that drains vials, fills buckets, and samples distance from the ideal level.
 */
import { useEffect, useRef } from "react";
import { GAME_PARAMS } from "../data/params";
import {
  getAverageDistanceFromSetpoint,
  tickVialLevel,
} from "../utils/vialGameLogic";

export const useVialGameLoop = ({
  isActive,
  currentDrainRate,
  numVials,
  vial1Level,
  vial2Level,
  vial1HasBucket,
  vial2HasBucket,
  vial1Paused,
  vial2Paused,
  setVial1Level,
  setVial2Level,
  setBucket1Level,
  setBucket2Level,
  distanceSamplesRef,
}) => {
  const gameLoopRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setVial1Level((prev) => {
        const { nextLevel, bucketIncrement } = tickVialLevel({
          level: prev,
          isPaused: vial1Paused.current,
          hasBucket: vial1HasBucket,
          drainRate: currentDrainRate,
        });

        if (bucketIncrement > 0) {
          setBucket1Level((bucketPrev) =>
            Math.min(GAME_PARAMS.BUCKET_CAPACITY, bucketPrev + bucketIncrement),
          );
        }

        return nextLevel;
      });

      if (numVials === 2) {
        setVial2Level((prev) => {
          const { nextLevel, bucketIncrement } = tickVialLevel({
            level: prev,
            isPaused: vial2Paused.current,
            hasBucket: vial2HasBucket,
            drainRate: currentDrainRate,
          });

          if (bucketIncrement > 0) {
            setBucket2Level((bucketPrev) =>
              Math.min(
                GAME_PARAMS.BUCKET_CAPACITY,
                bucketPrev + bucketIncrement,
              ),
            );
          }

          return nextLevel;
        });
      }

      distanceSamplesRef.current.push(
        getAverageDistanceFromSetpoint({
          vial1Level,
          vial2Level,
          numVials,
        }),
      );
    }, GAME_PARAMS.GAME_SPEED);

    return () => clearInterval(gameLoopRef.current);
  }, [
    currentDrainRate,
    distanceSamplesRef,
    isActive,
    numVials,
    setBucket1Level,
    setBucket2Level,
    setVial1Level,
    setVial2Level,
    vial1HasBucket,
    vial1Level,
    vial2HasBucket,
    vial2Level,
  ]);
};
