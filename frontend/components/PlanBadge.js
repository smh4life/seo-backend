"use client";

export default function PlanBadge({ plan }) {
  return (
    <span
      style={{
        fontSize: "11px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "rgba(59,130,246,0.15)",
        border: "1px solid #3b82f6"
      }}
    >
      {plan.toUpperCase()}
    </span>
  );
}
