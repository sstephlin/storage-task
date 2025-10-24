import React from "react";
import { GAME_PARAMS, getZonePercentages } from "../params";
import "../styles/ZoneMeter.css";

const ZoneMeter = () => {
  const zones = getZonePercentages();

  return (
    <div className="zone-meter-container">
      <div className="zone-meter">
        {/* Bottom Danger Zone (Red) */}
        <div
          className="zone danger-lower"
          style={{ height: `${zones.dangerLowerHeight}%` }}
        ></div>
        {/* Lower Warning Zone (Orange) */}
        <div
          className="zone warning-lower"
          style={{ height: `${zones.warningLowerHeight}%` }}
        ></div>

        {/* Optimal Zone (Green) */}
        <div
          className="zone optimal"
          style={{ height: `${zones.optimalHeight}%` }}
        ></div>
        {/* Upper Warning Zone (Orange) */}
        <div
          className="zone warning-upper"
          style={{ height: `${zones.warningUpperHeight}%` }}
        ></div>

        {/* Top Danger Zone (Red) */}
        <div
          className="zone danger-upper"
          style={{ height: `${zones.dangerUpperHeight}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ZoneMeter;
