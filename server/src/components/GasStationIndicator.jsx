import React from "react";

const GasStationIndicator = ({ isActive }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        transition: "all 0.3s ease",
      }}
    >
      {/* Gas Pump Structure */}
      <div
        style={{
          position: "relative",
          width: "70px",
          height: "95px",
        }}
      >
        {/* Pump Body */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "42px",
            height: "76px",
            backgroundColor: isActive ? "#2E7D32" : "#444",
            borderRadius: "5px",
            border: `2px solid ${isActive ? "#4CAF50" : "#555"}`,
            transition: "all 0.3s ease",
            boxShadow: isActive
              ? "0 0 12px rgba(76,175,80,0.6), inset 0 0 10px rgba(76,175,80,0.2)"
              : "none",
          }}
        >
          {/* Display Screen */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "28px",
              height: "15px",
              backgroundColor: isActive ? "#8BC34A" : "#333",
              borderRadius: "2px",
              border: "1px solid #000",
              transition: "background-color 0.3s ease",
              boxShadow: isActive ? "0 0 7px rgba(139,195,74,0.8)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6px",
              fontWeight: "bold",
              color: isActive ? "#1B5E20" : "#666",
              fontFamily: "monospace",
            }}
          >
            {isActive ? "READY" : "OFF"}
          </div>

          {/* Keypad dots */}
          <div
            style={{
              position: "absolute",
              top: "34px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3px",
              width: "25px",
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "5px",
                  height: "4px",
                  backgroundColor: isActive ? "#4CAF50" : "#555",
                  borderRadius: "1px",
                  transition: "background-color 0.3s ease",
                  boxShadow: isActive ? "0 0 3px rgba(76,175,80,0.5)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Nozzle Holder */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "2px",
            width: "14px",
            height: "28px",
            backgroundColor: isActive ? "#388E3C" : "#555",
            borderRadius: "3px",
            border: `1px solid ${isActive ? "#4CAF50" : "#666"}`,
            transition: "all 0.3s ease",
          }}
        >
          {/* Nozzle tip */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "-5px",
              transform: "translateY(-50%)",
              width: "5px",
              height: "15px",
              backgroundColor: isActive ? "#4CAF50" : "#666",
              borderRadius: "0 2px 2px 0",
              transition: "background-color 0.3s ease",
            }}
          />
        </div>

        {/* Pulsing glow when active */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50px",
              height: "80px",
              backgroundColor: "rgba(76,175,80,0.15)",
              borderRadius: "8px",
              animation: "gsPulse 2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes gsPulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.9; transform: translateX(-50%) scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default GasStationIndicator;
