"use client";

import { useEffect, useState } from "react";
import GeneratorCard from "../../../components/GeneratorCard";
import ErrorState from "../../../components/ErrorState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { apiPost } from "../../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function DistributorCard({ onDistributorAdded }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadDistributors = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE}/distributors`, {
        credentials: "include",
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        setError(null);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to load distributors" }));
        if (errorData.error?.includes("Not authenticated")) {
          setError("Please log in to view distributors");
        } else if (errorData.error?.includes("Pro plan")) {
          setError("Pro plan required");
        } else {
          setError(errorData.error || "Failed to load distributors");
        }
      }
    } catch (e) {
      setError("Failed to load distributors");
    }
  };

  useEffect(() => {
    loadDistributors();
  }, []);

  async function add() {
    if (!name.trim()) return;

    setError(null);
    try {
      const d = await apiPost("/distributors", { name: name.trim() });
      setItems([...items, d]);
      setName("");
      // Notify parent component to refresh distributor list
      if (onDistributorAdded) {
        onDistributorAdded();
      }
    } catch (e) {
      const errorMessage = e.message || "";
      let userMessage = "Unable to add distributor. Please try again.";
      
      if (errorMessage.includes("Not authenticated") || errorMessage.includes("401")) {
        userMessage = "Please log in to add distributors.";
      } else if (errorMessage.includes("Pro plan") || errorMessage.includes("403") || errorMessage.includes("Upgrade")) {
        userMessage = "Pro plan required to add distributors.";
      } else if (errorMessage.includes("plan") || errorMessage.includes("pro")) {
        userMessage = "Pro plan required to add distributors.";
      }
      
      setError(userMessage);
      console.error("Distributor add error:", e);
    }
  }

  async function remove(id) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      await fetch(`${API_BASE}/distributors/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
      });
      setItems(items.filter(d => d.id !== id));
      setConfirm(null);
      setError(null);
    } catch (e) {
      setError("Failed to delete distributor");
    }
  }

  return (
    <GeneratorCard title="Distributors">
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Distributor Name:</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter distributor name"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "8px",
            background: "#0f172a",
            border: "1px solid #1f2937",
            color: "#fff",
            fontSize: "18px",
            boxSizing: "border-box"
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              add();
            }
          }}
        />
        <button
          onClick={add}
          disabled={!name.trim()}
          style={{
            marginTop: "12px",
            padding: "12px 20px",
            borderRadius: "10px",
            background: !name.trim() ? "#64748b" : "#4dabff",
            color: "#020617",
            fontWeight: 700,
            border: "none",
            cursor: !name.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            opacity: !name.trim() ? 0.7 : 1
          }}
        >
          Add
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
            Distributors ({items.length})
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map(d => (
              <li
                key={d.id}
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
                <span style={{ color: "#ffffff" }}>{d.name}</span>
                <button
                  onClick={() => setConfirm(d)}
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
          No distributors yet. Add one above to get started.
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
