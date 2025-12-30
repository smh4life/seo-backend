"use client";

export default function UsageWarning({ remaining }) {
  if (remaining > 0) return null;

  return (
    <div
      style={{
        padding: "16px",
        marginTop: "16px",
        border: "1px solid #ef4444",
        background: "rgba(127,29,29,0.2)",
        borderRadius: "8px"
      }}
    >
      🚫 Usage limit reached. Upgrade to continue.
    </div>
  );
}
