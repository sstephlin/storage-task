import React from "react";
import { GAME_PARAMS } from "../data/params";
import "../styles/Vial.css";
import { Star, Flame, Skull } from "lucide-react";

const Vial = ({
  level,
  numBuckets,
  bucketLevel,
  liquidColor,
  isTrainingMode = false,
  trainingColors = null,
}) => {
  const displayLevel = Math.min(Math.round(level), 100);

  // Determine if liquid is in optimal zone
  const isOptimal =
    level >= GAME_PARAMS.OPTIMAL_ZONE_MIN &&
    level <= GAME_PARAMS.OPTIMAL_ZONE_MAX;

  // Get icon colors based on training mode
  const dangerColor =
    isTrainingMode && trainingColors ? trainingColors.danger : "#dc2626";

  const optimalColor =
    isTrainingMode && trainingColors ? trainingColors.optimal : "#000000";

  return (
    <div className="vial-container">
      <div className="vial_wrapper">
        {/* <ZoneMeter /> */}
        <div className="vial">
          <div
            className={`liquid ${isOptimal ? "optimal" : "suboptimal"}`}
            style={{
              height: `${Math.round(displayLevel)}%`,
              backgroundColor: liquidColor,
            }}
          />

          {/* Top danger line with flame icon */}
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "-30px",
              transform: "translateY(-50%)",
            }}
          >
            <Flame size={30} fill={dangerColor} color={dangerColor} />
          </div>

          {/* Center line with star icon - golden/amber in training mode */}
          <div
            className="center-line-container"
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: optimalColor,
                opacity: 0.8,
              }}
            ></div>
            <Star
              size={16}
              fill={optimalColor}
              color={optimalColor}
              style={{ margin: "0 4px" }}
            />
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: optimalColor,
                opacity: 0.8,
              }}
            ></div>
          </div>

          {/* Bottom danger line with skull icon */}
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "-30px",
              transform: "translateY(50%)",
            }}
          >
            <Skull size={30} fill="transparent" color={dangerColor} />
          </div>
        </div>
      </div>

      {numBuckets > 0 && (
        <div className="bucket-container">
          <div className="bucket">
            <div
              className="bucket-liquid"
              style={{
                height: `${bucketLevel}%`,
                backgroundColor: liquidColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Vial);
