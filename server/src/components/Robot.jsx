import React, { useState, useEffect } from "react";
import { Star, Flame, Skull } from "lucide-react";
import Vial from "./Vial";
import { PRODUCTION_MODE } from "../data/participantConfig";

const Robot = ({
  vial1Level,
  vial2Level,
  isOverheated,
  isPoweredDown,
  isCelebrating,
  numVials = 2,
  scale = 0.7,
  // bucket props forwarded from VialGame
  vial1HasBucket = false,
  vial2HasBucket = false,
  bucket1Level = 0,
  bucket2Level = 0,
  // Training mode props
  isTrainingMode = false,
  trainingColors = null,
}) => {
  // Adjust scale based on production mode
  const effectiveScale = PRODUCTION_MODE ? scale * 1.2 : scale;

  // base robot dimensions (kept in JS so scale calculations stay in-sync)
  const BASE_WIDTH = 500;
  const BASE_HEIGHT = 600;
  const scaledWidth = BASE_WIDTH * effectiveScale;
  const scaledHeight = BASE_HEIGHT * effectiveScale;

  // Determine vial colors based on training mode
  const vial1Color =
    isTrainingMode && trainingColors ? trainingColors.primary : "#d665e5"; // Purple in main game

  const vial2Color =
    isTrainingMode && trainingColors ? trainingColors.secondary : "#4A90E2"; // Blue in main game

  return (
    // outer wrapper reserves the scaled layout space so other components/layouts
    // behave correctly while the inner robot is scale-transformed for visual
    // proportional shrinking.
    <div
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          transform: `scale(${effectiveScale})`,
          transformOrigin: "top center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "500px",
            height: "600px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: isCelebrating
              ? "celebrateBounce 1.5s ease-in-out infinite"
              : "none",
          }}
        >
          {/* Antenna */}
          <div
            style={{
              width: "8px",
              height: "50px",
              backgroundColor: "#34495e",
              borderRadius: "4px",
              position: "relative",
              zIndex: 3,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-15px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "24px",
                height: "24px",
                backgroundColor: isOverheated
                  ? "#ff4444"
                  : isTrainingMode
                    ? "#a78bfa"
                    : "#3498db",
                borderRadius: "50%",
                border: "4px solid #2c3e50",
                animation: isOverheated
                  ? "overheatPulse 0.4s infinite"
                  : isCelebrating
                    ? "celebrateAntenna 0.6s ease-in-out infinite"
                    : "none",
                boxShadow: isOverheated
                  ? "0 0 20px rgba(255,68,68,0.8)"
                  : isTrainingMode
                    ? "0 0 15px rgba(167,139,250,0.6)"
                    : "0 0 15px rgba(52,152,219,0.6)",
              }}
            />
          </div>

          {/* Head - rectangular with rounded corners */}
          <div
            style={{
              width: "280px",
              height: "180px",
              backgroundColor: "#ecf0f1",
              borderRadius: "20px",
              position: "relative",
              border: "6px solid #2c3e50",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              zIndex: 2,
            }}
          >
            {/* Side antenna/ears */}
            <div
              style={{
                position: "absolute",
                top: "30px",
                left: "-40px",
                width: "35px",
                height: "35px",
                backgroundColor: "#ecf0f1",
                borderRadius: "50%",
                border: "6px solid #2c3e50",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "30px",
                right: "-40px",
                width: "35px",
                height: "35px",
                backgroundColor: "#ecf0f1",
                borderRadius: "50%",
                border: "6px solid #2c3e50",
              }}
            />

            {/* Screen/display area */}
            <div
              style={{
                position: "absolute",
                top: "30px",
                left: "30px",
                right: "30px",
                height: "120px",
                backgroundColor: "#34495e",
                borderRadius: "10px",
                border: "4px solid #2c3e50",
                overflow: "hidden",
              }}
            >
              {/* Eyes */}
              <div
                style={{
                  position: "absolute",
                  top: "35px",
                  left: "45px",
                  width: "50px",
                  height: isPoweredDown ? "8px" : "50px",
                  backgroundColor: isPoweredDown ? "#1a252f" : "#2c3e50",
                  borderRadius: "50%",
                  border: "4px solid #1a252f",
                  transition: "all 0.15s ease",
                  boxShadow: isOverheated
                    ? "0 0 25px rgba(255,68,68,0.9)"
                    : "none",
                }}
              >
                {!isPoweredDown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "30px",
                      height: "30px",
                      backgroundColor: isOverheated
                        ? "#ff4444"
                        : isTrainingMode
                          ? "#a78bfa"
                          : "#3498db",
                      borderRadius: "50%",
                      animation: isOverheated
                        ? "overheatPulse 0.5s infinite"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        borderRadius: "50%",
                      }}
                    />
                    {/* Happy eye curve for celebration */}
                    {isCelebrating && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "20px",
                          height: "10px",
                          borderTop: "3px solid #000",
                          borderRadius: "20px 20px 0 0",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "35px",
                  right: "45px",
                  width: "50px",
                  height: isPoweredDown ? "8px" : "50px",
                  backgroundColor: isPoweredDown ? "#1a252f" : "#2c3e50",
                  borderRadius: "50%",
                  border: "4px solid #1a252f",
                  transition: "all 0.15s ease",
                  boxShadow: isOverheated
                    ? "0 0 25px rgba(255,68,68,0.9)"
                    : "none",
                }}
              >
                {!isPoweredDown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "30px",
                      height: "30px",
                      backgroundColor: isOverheated
                        ? "#ff4444"
                        : isTrainingMode
                          ? "#a78bfa"
                          : "#3498db",
                      borderRadius: "50%",
                      animation: isOverheated
                        ? "overheatPulse 0.5s infinite"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        borderRadius: "50%",
                      }}
                    />
                    {/* Happy eye curve for celebration */}
                    {isCelebrating && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "20px",
                          height: "10px",
                          borderTop: "3px solid #000",
                          borderRadius: "20px 20px 0 0",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Neck */}
          <div
            style={{
              width: "80px",
              height: "30px",
              backgroundColor: "#bdc3c7",
              border: "6px solid #2c3e50",
              borderTop: "none",
              borderBottom: "none",
              zIndex: 1,
            }}
          />

          {/* Body - rectangular with vials */}
          <div
            style={{
              width: "400px",
              height: "320px",
              backgroundColor: "#95a5a6",
              borderRadius: "30px",
              position: "relative",
              border: "6px solid #2c3e50",
              boxShadow: isOverheated
                ? "0 8px 35px rgba(255,68,68,0.4)"
                : "0 8px 30px rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "60px",
              paddingTop: "20px",
              animation: isOverheated ? "shake 0.3s infinite" : "none",
              opacity: isPoweredDown ? 0.7 : 1,
              transition: "background-color 0.3s ease, opacity 0.5s ease",
              zIndex: 1,
              overflow: "hidden",
            }}
          >
            {/* Status lights */}
            <div
              style={{
                position: "absolute",
                top: "25px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "15px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: isOverheated
                    ? "#ff4444"
                    : isPoweredDown
                      ? "#34495e"
                      : "#ffffff",
                  borderRadius: "50%",
                  border: "3px solid #2c3e50",
                  boxShadow: isOverheated
                    ? "0 0 18px rgba(255,68,68,0.9)"
                    : "none",
                  animation: isOverheated
                    ? "overheatPulse 0.3s infinite"
                    : isPoweredDown
                      ? "none"
                      : isCelebrating
                        ? "celebrateLights 1s ease-in-out infinite"
                        : "none",
                }}
              />
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: isOverheated
                    ? "#ff4444"
                    : isPoweredDown
                      ? "#34495e"
                      : "#ffffff",
                  borderRadius: "50%",
                  border: "3px solid #2c3e50",
                  boxShadow: isOverheated
                    ? "0 0 18px rgba(255,68,68,0.9)"
                    : "none",
                  animation: isOverheated
                    ? "overheatPulse 0.3s infinite"
                    : isPoweredDown
                      ? "none"
                      : isCelebrating
                        ? "celebrateLights 1s ease-in-out infinite"
                        : "none",
                }}
              />
            </div>

            {/* Vial window */}
            <div
              style={{
                position: "absolute",
                top: "70px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "280px",
                height: "210px",
                backgroundColor: "rgba(44,62,80,0.3)",
                borderRadius: "20px",
                border: "5px solid #2c3e50",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                padding: "6px",
                overflow: "visible",
              }}
            >
              <Vial
                level={vial1Level}
                numBuckets={vial1HasBucket ? 1 : 0}
                bucketLevel={bucket1Level}
                liquidColor={vial1Color}
                isTrainingMode={isTrainingMode}
                trainingColors={trainingColors}
              />
              {numVials === 2 && (
                <Vial
                  level={vial2Level}
                  numBuckets={vial2HasBucket ? 1 : 0}
                  bucketLevel={bucket2Level}
                  liquidColor={vial2Color}
                  isTrainingMode={isTrainingMode}
                  trainingColors={trainingColors}
                />
              )}
            </div>
          </div>

          {/* Arms */}
          <div
            style={{
              position: "absolute",
              top: "330px",
              left: "-30px",
              width: "60px",
              height: "140px",
              backgroundColor: "#95a5a6",
              borderRadius: "30px",
              border: "6px solid #2c3e50",
              transform: isPoweredDown
                ? "rotate(-30deg)"
                : isCelebrating
                  ? "rotate(-70deg)"
                  : "rotate(-15deg)",
              transformOrigin: "top center",
              transition: "transform 0.5s ease",
              animation: isCelebrating
                ? "celebrateArmLeft 1s ease-in-out infinite"
                : "none",
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-40px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "50px",
                height: "50px",
                backgroundColor: "#7f8c8d",
                borderRadius: "50%",
                border: "6px solid #2c3e50",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: "330px",
              right: "-30px",
              width: "60px",
              height: "140px",
              backgroundColor: "#95a5a6",
              borderRadius: "30px",
              border: "6px solid #2c3e50",
              transform: isPoweredDown
                ? "rotate(30deg)"
                : isCelebrating
                  ? "rotate(70deg)"
                  : "rotate(15deg)",
              transformOrigin: "top center",
              transition: "transform 0.5s ease",
              animation: isCelebrating
                ? "celebrateArmRight 1s ease-in-out infinite"
                : "none",
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-40px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "50px",
                height: "50px",
                backgroundColor: "#7f8c8d",
                borderRadius: "50%",
                border: "6px solid #2c3e50",
              }}
            />
          </div>

          {/* Legs */}
          <div
            style={{
              position: "absolute",
              bottom: "0px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "120px",
              opacity: isPoweredDown ? 0.7 : 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-35px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "85px",
                height: "45px",
                backgroundColor: "#7f8c8d",
                borderRadius: "20px",
                border: "6px solid #2c3e50",
              }}
            />
          </div>

          <style>{`
        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          50% { opacity: 1; transform: translateY(-25px) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          75% { transform: translateX(5px) rotate(1deg); }
        }
        @keyframes overheatPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes celebrateBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-12px) rotate(-2deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes celebrateAntenna {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.2); }
        }
        @keyframes celebrateLights {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes celebrateArmLeft {
          0%, 100% { transform: rotate(-70deg); }
          50% { transform: rotate(-55deg); }
        }
        @keyframes celebrateArmRight {
          0%, 100% { transform: rotate(70deg); }
          50% { transform: rotate(55deg); }
        }
        @keyframes sparkFloat {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 1; transform: translateY(-40px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.5); }
        }
      `}</style>
        </div>
      </div>
    </div>
  );
};

export default Robot;
