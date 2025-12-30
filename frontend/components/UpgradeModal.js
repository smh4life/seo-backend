"use client";

export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#0C0F14",
          padding: "32px",
          borderRadius: "16px",
          width: "420px",
          border: "1px solid #1f2937"
        }}
      >
        <h3>Upgrade Required</h3>
        <p>Your current plan does not include this feature.</p>

        <button style={{ marginTop: "16px" }}>View Plans</button>
        <button onClick={onClose} style={{ marginLeft: "12px" }}>
          Close
        </button>
      </div>
    </div>
  );
}
