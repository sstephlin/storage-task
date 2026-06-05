/**
 * controls current round settings, bucket transfer amount, distance from setpoint, vial tick/drain behavior, failure type,
 * calculates performance ratio, progress calculation, round-start logging payload
 */
import { logRoundStart } from "../data/logging";
import { GAME_PARAMS } from "../data/params";

export const EMPTY_BUCKET_CONFIG = { vial1: 0, vial2: 0 };

export const getRoundSettings = (gameSequences, roundIndex) => ({
  drainRate: gameSequences.velocitySequence[roundIndex] || 1,
  bucketConfig: gameSequences.bucketSequence[roundIndex] || EMPTY_BUCKET_CONFIG,
  phase: gameSequences.phaseSequence[roundIndex] || "abundance",
});

export const getBucketTransferAmount = (vialLevel, bucketLevel) => {
  const maxAddAmount = GAME_PARAMS.OPTIMAL_LEVEL - vialLevel;

  return maxAddAmount > 0
    ? Math.min(maxAddAmount, bucketLevel, GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
    : 0;
};

// gets average distance from optimal level across both vials. if 1 vial game, the distance from the single vial is returned. if 2 vial game, the average distance across both vials is returned.
export const getAverageDistanceFromSetpoint = ({
  vial1Level,
  vial2Level,
  numVials,
}) => {
  const vial1Distance = Math.abs(vial1Level - GAME_PARAMS.OPTIMAL_LEVEL);
  const vial2Distance =
    numVials === 2 ? Math.abs(vial2Level - GAME_PARAMS.OPTIMAL_LEVEL) : 0;

  return numVials === 2 ? (vial1Distance + vial2Distance) / 2 : vial1Distance;
};

export const tickVialLevel = ({ level, isPaused, hasBucket, drainRate }) => {
  if (isPaused) {
    return { nextLevel: level, bucketIncrement: 0 };
  }

  const nextLevel = Math.max(0, level - drainRate);
  const bucketIncrement =
    hasBucket && nextLevel < level && level > GAME_PARAMS.OPTIMAL_LEVEL
      ? drainRate
      : 0;

  return { nextLevel, bucketIncrement };
};

export const getFailureType = ({ vial1Level, vial2Level, numVials }) => {
  const vial1Failed = vial1Level <= 0 || vial1Level >= GAME_PARAMS.MAX_LEVEL;
  const vial2Failed =
    numVials === 2 && (vial2Level <= 0 || vial2Level >= GAME_PARAMS.MAX_LEVEL);

  if (!vial1Failed && !vial2Failed) return null;

  const overheated =
    vial1Level >= GAME_PARAMS.MAX_LEVEL ||
    (numVials === 2 && vial2Level >= GAME_PARAMS.MAX_LEVEL);

  return overheated ? "overheat" : "powerdown";
};

export const computePerformanceRatio = (distanceSamples) => {
  const optimalAverage = 0;
  const worstAverage = Math.max(
    GAME_PARAMS.OPTIMAL_LEVEL,
    GAME_PARAMS.MAX_LEVEL - GAME_PARAMS.OPTIMAL_LEVEL,
  );

  const avgDistance =
    distanceSamples.length > 0
      ? distanceSamples.reduce((sum, distance) => sum + distance, 0) /
        distanceSamples.length
      : (optimalAverage + worstAverage) / 2;

  return Math.min(
    1,
    Math.max(
      0,
      1 - (avgDistance - optimalAverage) / (worstAverage - optimalAverage),
    ),
  );
};

export const getNextProgress = ({
  wasSuccessful,
  currentProgress,
  distanceSamples,
}) => {
  const stepSize = 100 / GAME_PARAMS.MAX_ROUNDS;

  return wasSuccessful
    ? currentProgress + stepSize * computePerformanceRatio(distanceSamples)
    : Math.max(0, currentProgress - stepSize);
};

export const logRoundStartFromSequences = ({
  roundIndex,
  gameSequences,
  versionConfig,
  bucket1Level,
  bucket2Level,
  isTrainingMode,
  gameVersion,
}) => {
  const { drainRate, bucketConfig, phase } = getRoundSettings(
    gameSequences,
    roundIndex,
  );

  return logRoundStart(
    roundIndex,
    {
      vial1HasBucket: bucketConfig.vial1 === 1,
      vial2HasBucket: bucketConfig.vial2 === 1,
      velocity: drainRate,
      setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
      phase,
      initialBucket1Level: bucket1Level,
      initialBucket2Level: bucket2Level,
      isTrainingMode,
      gameVersion,
    },
    isTrainingMode,
  );
};
