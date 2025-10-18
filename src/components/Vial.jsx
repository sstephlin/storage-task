import React from "react";
import { GAME_PARAMS } from "../params";
import "../styles/Vial.css";

const Vial = ({ level, hasSpout, bucketLevel }) => {
  const displayLevel = Math.min(level, 100);

  // Determine if liquid is in optimal zone
  const isOptimal =
    level >= GAME_PARAMS.OPTIMAL_ZONE_MIN &&
    level <= GAME_PARAMS.OPTIMAL_ZONE_MAX;

  // Calculate if pipe should show flow (only when liquid reaches optimal zone AND bucket has room)
  const isPipeActive = hasSpout && level >= GAME_PARAMS.MAX_LEVEL;

  return (
    <div className="vial-container">
      <div className="vial_wrapper">
        <div className={`optimal_zone`}></div>
        <div className="vial">
          <div
            className={`liquid ${isOptimal ? "optimal" : "suboptimal"}`}
            style={{ height: `${displayLevel}%` }}
          />
          {hasSpout && (
            <>
              <div
                className={`pipe-flow ${isPipeActive ? "active" : "inactive"}`}
              />
            </>
          )}
        </div>
      </div>

      {hasSpout && (
        <div className="bucket-container">
          <div className="bucket-label">Bucket: {Math.round(bucketLevel)}%</div>
          <div className="bucket">
            <div
              className="bucket-liquid"
              style={{ height: `${bucketLevel}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Vial;
