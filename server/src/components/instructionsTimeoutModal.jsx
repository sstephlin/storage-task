export const TimeExpiredModal = ({ secondsLeft }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.85)",
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
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⌛</div>
      <h2 style={{ color: "#c0392b", marginBottom: "12px", fontSize: "22px" }}>
        Time Limit Reached
      </h2>
      <p
        style={{
          color: "#444",
          fontSize: "16px",
          lineHeight: "1.6",
          marginBottom: "8px",
        }}
      >
        The instructions phase has a 27-minute time limit, which has been
        reached. You will not be able to continue with this study.
      </p>
      <p style={{ color: "#888", fontSize: "14px", marginTop: "20px" }}>
        Redirecting in <strong>{secondsLeft}</strong> second
        {secondsLeft !== 1 ? "s" : ""}…
      </p>
    </div>
  </div>
);
