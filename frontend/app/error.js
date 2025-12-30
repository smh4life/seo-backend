"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{
      padding: "48px",
      textAlign: "center",
      color: "#ffffff",
      background: "linear-gradient(135deg, #050816 0%, #0b0f2a 55%, #1a0b3d 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        Something went wrong
      </h1>
      <p style={{ color: "#cbd5f5", marginBottom: "24px" }}>
        {error?.message || "An error occurred"}
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
          fontWeight: 600,
          marginRight: "12px"
        }}
      >
        Try Again
      </button>
      <button
        onClick={() => window.location.href = "/dashboard"}
        style={{
          padding: "12px 24px",
          background: "#6b7280",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

