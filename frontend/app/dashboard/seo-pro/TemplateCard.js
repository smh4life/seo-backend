"use client";

import { useEffect, useState } from "react";
import GeneratorCard from "../../../components/GeneratorCard";
import ErrorState from "../../../components/ErrorState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { apiPost } from "../../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function TemplateCard() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("product");
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadTemplates = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE}/templates`, {
        credentials: "include",
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        setError(null);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to load templates" }));
        if (errorData.error?.includes("Not authenticated")) {
          setError("Please log in to view templates");
        } else if (errorData.error?.includes("Pro plan")) {
          setError("Pro plan required");
        } else {
          setError(errorData.error || "Failed to load templates");
        }
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
      // Reload the full list to ensure we have the latest data
      await loadTemplates();
      setName("");
      setError(null);
    } catch (e) {
      const errorMessage = e.message || "";
      let userMessage = "Unable to create template. Please try again.";
      
      if (errorMessage.includes("Not authenticated") || errorMessage.includes("401")) {
        userMessage = "Please log in to create templates.";
      } else if (errorMessage.includes("Pro plan") || errorMessage.includes("403") || errorMessage.includes("Upgrade")) {
        userMessage = "Pro plan required to create templates.";
      }
      
      setError(userMessage);
      console.error("Template create error:", e);
    }
  }

  async function remove(id) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      await fetch(`${API_BASE}/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
      });
      // Reload the full list after deletion
      await loadTemplates();
      setConfirm(null);
      setError(null);
    } catch (e) {
      setError("Unable to delete template. Please try again.");
      console.error("Template delete error:", e);
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <span style={{ fontWeight: "600", color: "#ffffff" }}>{t.name}</span>
                  <span style={{ color: "#9ca3af", marginLeft: "8px" }}>({t.type})</span>
                </div>
                <button
                  onClick={() => setConfirm(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "#4dabff",
                    color: "#020617",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                >
                  Delete
                </button>
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

      <ConfirmDialog
        open={!!confirm}
        message={`Delete ${confirm?.name}?`}
        onConfirm={() => remove(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
    </GeneratorCard>
  );
}
