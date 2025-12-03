import React from "react";
import { GAME_PARAMS } from "../params";
import "../styles/Vial.css";
import ZoneMeter from "./ZoneMeter";
import { Star, Flame, Skull } from "lucide-react";

const Vial = ({ level, numBuckets, bucketLevel, liquidColor = "#4A90E2" }) => {
  const displayLevel = Math.min(level, 100);

  // Determine if liquid is in optimal zone
  const isOptimal =
    level >= GAME_PARAMS.OPTIMAL_ZONE_MIN &&
    level <= GAME_PARAMS.OPTIMAL_ZONE_MAX;

  // Calculate if pipe should show flow (only when liquid reaches optimal zone AND bucket has room)
  const isPipeActive = numBuckets > 0 && level >= GAME_PARAMS.MAX_LEVEL;

  return (
    <div className="vial-container">
      <div className="vial_wrapper">
        {/* <ZoneMeter /> */}
        <div className="vial">
          <div
            className={`liquid ${isOptimal ? "optimal" : "suboptimal"}`}
            style={{ height: `${displayLevel}%`, backgroundColor: liquidColor }}
          />

          {/* Top danger line with flame icon */}

          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "-25px",
              transform: "translateY(-50%)",
            }}
          >
            <Flame size={20} fill="#dc2626" color="#dc2626" />
          </div>

          {/* Center line with star icon */}
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
                backgroundColor: "#000000",
                opacity: 0.8,
              }}
            ></div>
            <Star
              size={16}
              fill="#000000"
              color="#000000"
              style={{ margin: "0 4px" }}
            />
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: "#000000",
                opacity: 0.8,
              }}
            ></div>
          </div>

          {/* Bottom danger line with skull icon */}
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "-25px",
              transform: "translateY(50%)",
            }}
          >
            <Skull size={20} fill="transparent" color="#dc2626" />
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

export default Vial;
