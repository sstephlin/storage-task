import React from "react";
import "../styles/Vial.css";

const Vial = ({ level, hasSpout, showOverflow, bucketLevel }) => {
  const displayLevel = Math.min(level, 100);

  return (
    <div className="vial-container">
      <div className={`vial ${hasSpout ? "with-spout" : ""}`}>
        <div className="liquid" style={{ height: `${displayLevel}%` }} />
        {hasSpout && (
          <div className={`overflow ${showOverflow ? "active" : ""}`} />
        )}
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
