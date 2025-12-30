"use client";

export default function ErrorState({ message = "Something went wrong." }) {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #3b82f6",
        background: "rgba(30,58,138,0.15)",
        borderRadius: "8px",
        marginTop: "16px"
      }}
    >
      ⚠️ {message}
    </div>
  );
}
