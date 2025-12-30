"use client";

export default function GeneratorCard({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(30,30,45,0.7)",
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "24px"
      }}
    >
      <h3>{title}</h3>
      {children}
    </div>
  );
}
