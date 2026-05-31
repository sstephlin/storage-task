export const WarningModal = ({ secondsLeft, onDismiss }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.75)",
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "40px 48px",
        maxWidth: "480px",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <h2 style={{ color: "#c0392b", marginBottom: "12px", fontSize: "22px" }}>
        Are you still there?
      </h2>
      <p
        style={{
          color: "#444",
          fontSize: "16px",
          lineHeight: "1.6",
          marginBottom: "8px",
        }}
      >
        You've been on this slide for a while. You must continue within:
      </p>
      <p
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#c0392b",
          margin: "12px 0",
        }}
      >
        {secondsLeft}s
      </p>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
        If time runs out you will be removed from the study.
      </p>
      <button
        onClick={onDismiss}
        style={{
          background: "#2ecc71",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "12px 32px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        I'm here — continue
      </button>
    </div>
  </div>
);
