"use client";

import { useState, useEffect } from "react";
import GeneratorCard from "../../../components/GeneratorCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE}/categories`, {
        credentials: "include",
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        setError(null);
      } else {
        setError("Failed to load categories");
      }
    } catch (e) {
      console.error("Load categories error:", e);
      setError("Failed to load categories");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      setError("Please upload a CSV or JSON file");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        let categoryData = [];

        if (file.name.endsWith(".csv")) {
          // Parse CSV
          const lines = text.split("\n").filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error("CSV must have at least a header and one row");
          }

          const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
          const pathIndex = headers.findIndex(h => /path|category/i.test(h));
          const keywordsIndex = headers.findIndex(h => /keyword/i.test(h));
          const parentIndex = headers.findIndex(h => /parent/i.test(h));

          if (pathIndex === -1) {
            throw new Error("CSV must have a 'path' or 'category' column");
          }

          categoryData = lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
            const path = values[pathIndex] || "";
            const keywordsStr = keywordsIndex >= 0 ? values[keywordsIndex] : "";
            const keywords = keywordsStr ? keywordsStr.split(/[,;|]/).map(k => k.trim()).filter(k => k) : [];
            const parentPath = parentIndex >= 0 ? values[parentIndex] : "";

            return { path, keywords, parentPath };
          }).filter(cat => cat.path);
        } else {
          // Parse JSON
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            categoryData = json;
          } else if (json.categories && Array.isArray(json.categories)) {
            categoryData = json.categories;
          } else {
            throw new Error("JSON must be an array or have a 'categories' array");
          }
        }

        // Import categories
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = {
          "Content-Type": "application/json"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/categories/import`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ categories: categoryData })
        });

        if (res.ok) {
          const data = await res.json();
          setError(null);
          await loadCategories();
          alert(`Successfully imported ${data.count} categories!`);
        } else {
          const errorData = await res.json().catch(() => ({ error: "Failed to import categories" }));
          throw new Error(errorData.error || "Failed to import categories");
        }
      } catch (err) {
        setError(err.message || "Failed to import categories");
        console.error("Import error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsText(file, "UTF-8");
    }
  };

  const exportCategories = () => {
    if (categories.length === 0) {
      setError("No categories to export");
      return;
    }

    // Export as CSV
    const headers = ["Category Path", "Keywords", "Parent Path"];
    const rows = categories.map(cat => [
      cat.path,
      (cat.keywords || []).join(", "),
      cat.parentPath || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => {
        const str = String(cell || "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "my_categories.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteAllCategories = async () => {
    if (!confirm("Are you sure you want to delete all categories? This cannot be undone.")) {
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/categories`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });

      if (res.ok) {
        setCategories([]);
        setError(null);
        alert("All categories deleted");
      } else {
        throw new Error("Failed to delete categories");
      }
    } catch (err) {
      setError(err.message || "Failed to delete categories");
    }
  };

  return (
    <GeneratorCard title="Category Management">
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Import Categories:</label>
        <div
          onClick={() => document.getElementById("category-file-input")?.click()}
          style={{
            border: "2px dashed #3b82f6",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
          }}
        >
          <div style={{ color: "#60a5fa", fontSize: "14px", fontWeight: "600" }}>
            {loading ? "Importing..." : "Click to Upload CSV or JSON"}
          </div>
          <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "4px" }}>
            CSV format: Category Path, Keywords, Parent Path
          </div>
        </div>
        <input
          id="category-file-input"
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
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

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={exportCategories}
          disabled={categories.length === 0}
          style={{
            padding: "10px 20px",
            background: categories.length === 0 ? "#64748b" : "#4dabff",
            color: "#020617",
            fontWeight: 700,
            border: "none",
            borderRadius: "8px",
            cursor: categories.length === 0 ? "not-allowed" : "pointer",
            flex: 1
          }}
        >
          Export Categories ({categories.length})
        </button>
        <button
          onClick={deleteAllCategories}
          disabled={categories.length === 0}
          style={{
            padding: "10px 20px",
            background: categories.length === 0 ? "#64748b" : "#ef4444",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            borderRadius: "8px",
            cursor: categories.length === 0 ? "not-allowed" : "pointer",
            flex: 1
          }}
        >
          Delete All
        </button>
      </div>

      {categories.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4 style={{ marginBottom: "12px", color: "#ffffff", fontSize: "16px", fontWeight: "600" }}>
            Your Categories ({categories.length})
          </h4>
          <div style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "12px",
            background: "#0f172a"
          }}>
            {categories.slice(0, 50).map((cat, index) => (
              <div
                key={index}
                style={{
                  padding: "8px",
                  marginBottom: "4px",
                  background: "#1e293b",
                  borderRadius: "6px",
                  fontSize: "13px"
                }}
              >
                <div style={{ color: "#ffffff", fontWeight: "600" }}>{cat.path}</div>
                {cat.keywords && cat.keywords.length > 0 && (
                  <div style={{ color: "#9ca3af", fontSize: "11px", marginTop: "4px" }}>
                    Keywords: {cat.keywords.join(", ")}
                  </div>
                )}
              </div>
            ))}
            {categories.length > 50 && (
              <div style={{ color: "#9ca3af", fontSize: "12px", textAlign: "center", marginTop: "8px" }}>
                ... and {categories.length - 50} more
              </div>
            )}
          </div>
        </div>
      )}

      {categories.length === 0 && !error && (
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "16px" }}>
          No categories imported yet. Upload a CSV or JSON file to get started.
        </p>
      )}
    </GeneratorCard>
  );
}

