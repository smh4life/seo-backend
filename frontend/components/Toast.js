"use client";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        padding: "12px 18px",
        background: "#1f2937",
        borderRadius: "8px"
      }}
    >
      {message}
    </div>
  );
}
