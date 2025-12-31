"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
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
      <p style={{ color: "#cbd5f5", marginBottom: "24px", maxWidth: "600px" }}>
        We're sorry, but something unexpected happened. Please try refreshing the page or return to the dashboard.
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
      </body>
    </html>
  );
}

