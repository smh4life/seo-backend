"use client";

export default function PlanCard({ plan, price, features, onSelect }) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "32px",
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      <h3 style={{ 
        margin: 0, 
        fontSize: "24px", 
        fontWeight: "600", 
        color: "#ffffff" 
      }}>
        {plan}
      </h3>
      <div style={{ 
        fontSize: "32px", 
        fontWeight: "700", 
        color: "#4dabff",
        marginBottom: "8px"
      }}>
        {price}
      </div>
      <ul style={{ 
        listStyle: "none", 
        padding: 0, 
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        flex: 1
      }}>
        {features.map((f, i) => (
          <li key={i} style={{ 
            color: "#d1d5db", 
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ color: "#22c55e", fontSize: "18px" }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={() => onSelect(plan)}
        style={{
          padding: "16px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          color: "#ffffff",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
          fontSize: "18px",
          marginTop: "16px",
          width: "100%",
          boxSizing: "border-box"
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "scale(1.02)";
          e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.4)";
        }}
      >
        Choose Plan
      </button>
    </div>
  );
}
