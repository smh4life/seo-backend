"use client";

export default function BatchError({ error, reset }) {
  return (
    <div style={{
      padding: "48px",
      textAlign: "center",
      color: "#ffffff",
      background: "linear-gradient(135deg, #050816 0%, #0b0f2a 55%, #1a0b3d 100%)",
      minHeight: "calc(100vh - 79px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Error loading page</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "24px" }}>
        {error?.message || "Something went wrong"}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "12px 24px",
          background: "#3b82f6",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600
        }}
      >
        Try Again
      </button>
    </div>
  );
}

