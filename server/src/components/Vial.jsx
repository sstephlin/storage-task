import React from "react";
import { GAME_PARAMS } from "../data/params";
import "../styles/Vial.css";
import { Star, Flame, Skull } from "lucide-react";
import GasStationIndicator from "./GasStationIndicator";

const Vial = ({
  level,
  numBuckets,
  bucketLevel,
  liquidColor,
  isTrainingMode = false,
  trainingColors = null,
  showGasStation = false,
  gasStationActive = true,
}) => {
  const displayLevel = Math.min(Math.round(level), GAME_PARAMS.MAX_LEVEL);
  const bucketFillPercent = Math.min(
    100,
    Math.max(0, (bucketLevel / GAME_PARAMS.BUCKET_CAPACITY) * 100),
  );
  const bucketHeight =
    200 * (GAME_PARAMS.BUCKET_CAPACITY / GAME_PARAMS.MAX_LEVEL);

  // Get icon colors based on training mode
  const dangerColor = "#dc2626";
  const optimalColor = "#fbbf24";

  return (
    <div className="vial-container">
      <div className="vial_wrapper">
        <div className="vial">
          <div
            className={`liquid`}
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

          {/* Center line with star icon*/}
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {showGasStation && (
              <GasStationIndicator isActive={gasStationActive} />
            )}
            <div className="bucket" style={{ height: `${bucketHeight}px` }}>
              <div
                className="bucket-liquid"
                style={{
                  height: `${bucketFillPercent}%`,
                  backgroundColor: liquidColor,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Vial);
