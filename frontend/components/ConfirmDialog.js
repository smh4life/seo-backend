"use client";

export default function ConfirmDialog({ open, onConfirm, onCancel, message }) {
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
          padding: "24px",
          borderRadius: "12px",
          width: "360px",
          border: "1px solid #1f2937"
        }}
      >
        <p>{message}</p>
        <div style={{ marginTop: "16px" }}>
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel} style={{ marginLeft: "12px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
