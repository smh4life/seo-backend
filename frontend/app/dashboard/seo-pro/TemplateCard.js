"use client";

import { useEffect, useState } from "react";
import GeneratorCard from "../../../components/GeneratorCard";
import ErrorState from "../../../components/ErrorState";
import { apiPost } from "../../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function TemplateCard() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("product");
  const [error, setError] = useState(null);

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/templates`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        setError(null);
      } else {
        setError("Failed to load templates");
      }
    } catch (e) {
      setError("Failed to load templates");
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  async function create() {
    if (!name.trim()) return;

    try {
      const t = await apiPost("/templates", { name: name.trim(), type });
      setItems([...items, t]);
      setName("");
      setError(null);
    } catch (e) {
      setError("Upgrade required or failed to create template");
    }
  }

  return (
    <GeneratorCard title="Templates">
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Template Name:</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter template name (e.g., Product SEO, Blog Post, E-commerce)"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "8px",
            background: "#0f172a",
            border: "1px solid #1f2937",
            color: "#fff",
            fontSize: "18px",
            boxSizing: "border-box",
            marginBottom: "12px"
          }}
        />
        <label style={{ display: "block", marginBottom: "8px" }}>Template Type:</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "8px",
            background: "#0f172a",
            border: "1px solid #1f2937",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            boxSizing: "border-box",
            marginBottom: "12px"
          }}
        >
          <option value="product">Product</option>
          <option value="blog">Blog</option>
        </select>
        <button
          onClick={create}
          disabled={!name.trim()}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            background: !name.trim() ? "#64748b" : "#4dabff",
            color: "#020617",
            fontWeight: 700,
            border: "none",
            cursor: !name.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            opacity: !name.trim() ? 0.7 : 1,
            width: "100%"
          }}
        >
          Save Template
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          color: "#fca5a5",
          marginBottom: "16px"
        }}>
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4 style={{ marginBottom: "12px", color: "#ffffff", fontSize: "16px", fontWeight: "600" }}>
            Templates ({items.length})
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map(t => (
              <li
                key={t.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  background: "#0f172a",
                  border: "1px solid #1f2937",
                  borderRadius: "8px",
                  color: "#ffffff"
                }}
              >
                <span style={{ fontWeight: "600" }}>{t.name}</span>
                <span style={{ color: "#9ca3af", marginLeft: "8px" }}>({t.type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 && !error && (
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "16px" }}>
          No templates yet. Create one above to get started.
        </p>
      )}
    </GeneratorCard>
  );
}
