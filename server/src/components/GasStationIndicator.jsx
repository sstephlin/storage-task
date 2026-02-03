import React from "react";

const GasStationIndicator = ({ isActive }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        transition: "all 0.3s ease",
      }}
    >
      {/* Gas Station Structure */}
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "160px",
        }}
      >
        {/* Gas Pump Body */}
        <div
          style={{
            position: "absolute",
            top: "45px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "100px",
            backgroundColor: isActive ? "#2E7D32" : "#444",
            borderRadius: "8px",
            border: `3px solid ${isActive ? "#4CAF50" : "#555"}`,
            transition: "all 0.3s ease",
            boxShadow: isActive
              ? "0 0 30px rgba(76, 175, 80, 0.6), inset 0 0 20px rgba(76, 175, 80, 0.3)"
              : "none",
          }}
        >
          {/* Display Screen */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "45px",
              height: "25px",
              backgroundColor: isActive ? "#8BC34A" : "#333",
              borderRadius: "4px",
              border: "2px solid #000",
              transition: "background-color 0.3s ease",
              boxShadow: isActive
                ? "0 0 15px rgba(139, 195, 74, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)"
                : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              color: isActive ? "#1B5E20" : "#666",
              fontFamily: "monospace",
            }}
          >
            {isActive ? "READY" : "WAIT"}
          </div>

          {/* Keypad Buttons */}
          <div
            style={{
              position: "absolute",
              top: "48px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3px",
              width: "40px",
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "8px",
                  backgroundColor: isActive ? "#4CAF50" : "#555",
                  borderRadius: "2px",
                  transition: "background-color 0.3s ease",
                  boxShadow: isActive
                    ? "0 0 5px rgba(76, 175, 80, 0.5)"
                    : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Nozzle Holder */}
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "5px",
            width: "20px",
            height: "40px",
            backgroundColor: isActive ? "#388E3C" : "#555",
            borderRadius: "4px",
            border: `2px solid ${isActive ? "#4CAF50" : "#666"}`,
            transition: "all 0.3s ease",
          }}
        >
          {/* Nozzle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "-3px",
              transform: "translateY(-50%)",
              width: "8px",
              height: "25px",
              backgroundColor: isActive ? "#4CAF50" : "#666",
              borderRadius: "0 4px 4px 0",
              transition: "background-color 0.3s ease",
            }}
          />
        </div>

        {/* Base/Platform */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "8px",
            backgroundColor: isActive ? "#2E7D32" : "#444",
            borderRadius: "4px",
            transition: "background-color 0.3s ease",
          }}
        />

        {/* Pulsing Glow Effect when Active */}
        {isActive && (
          <>
            <div
              style={{
                position: "absolute",
                top: "45px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "70px",
                height: "110px",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                borderRadius: "12px",
                animation: "pulse 2s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { 
                    opacity: 0.4;
                    transform: translateX(-50%) scale(1);
                  }
                  50% { 
                    opacity: 0.8;
                    transform: translateX(-50%) scale(1.05);
                  }
                }
              `}
            </style>
          </>
        )}
      </div>

      {/* Status Text */}
      <div
        style={{
          marginTop: "15px",
          fontSize: "14px",
          fontWeight: "bold",
          color: isActive ? "#4CAF50" : "#ff4444",
          textTransform: "uppercase",
          letterSpacing: "1px",
          textShadow: isActive ? "0 0 10px rgba(76, 175, 80, 0.5)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {isActive ? "⛽ REFUEL AVAILABLE" : "🚫 STATION CLOSED"}
      </div>
    </div>
  );
};

export default GasStationIndicator;
