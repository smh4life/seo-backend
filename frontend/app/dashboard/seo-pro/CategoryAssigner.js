"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CategoryAssigner({ csvData, onCategoriesAssigned, onClose }) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [categoryMap, setCategoryMap] = useState({}); // row index -> category path
  const [suggestions, setSuggestions] = useState({}); // row index -> suggested category
  const [bulkCategory, setBulkCategory] = useState("");
  const [imageColumn, setImageColumn] = useState("");
  const [categoryColumn, setCategoryColumn] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [userCategories, setUserCategories] = useState([]);

  // Load user categories and auto-match on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-detect image and category columns
  useEffect(() => {
    if (csvData?.headers) {
      // Find image column (common names: image, imageUrl, image_url, img, picture, photo)
      const imageCols = csvData.headers.filter(h => 
        /image|img|picture|photo|url/i.test(h)
      );
      if (imageCols.length > 0) {
        setImageColumn(imageCols[0]);
      }

      // Find category column (common names: category, categories, cat, type, path)
      const catCols = csvData.headers.filter(h => 
        /category|cat|type|path|group/i.test(h)
      );
      if (catCols.length > 0) {
        setCategoryColumn(catCols[0]);
      }
    }
  }, [csvData]);

  // Auto-match when categories and CSV are ready
  useEffect(() => {
    if (userCategories.length > 0 && csvData?.rows?.length > 0 && categoryColumn) {
      autoMatchCategories();
    }
  }, [userCategories, csvData, categoryColumn]);

  // Load user categories
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
        setUserCategories(data);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  // Auto-match products to categories
  const autoMatchCategories = async () => {
    if (!csvData?.rows || csvData.rows.length === 0) return;
    
    setIsMatching(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Prepare products for matching
      const products = csvData.rows.map((row, index) => ({
        index,
        distributorCategory: categoryColumn ? row[categoryColumn] : "",
        productName: row.title || row.name || row["Product Name"] || "",
        description: row.description || row["Item Description"] || ""
      }));

      const res = await fetch(`${API_BASE}/categories/match`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ products })
      });

      if (res.ok) {
        const data = await res.json();
        const newSuggestions = {};
        const newCategoryMap = {};
        
        data.matches.forEach(match => {
          if (match.suggestedCategory && match.confidence > 50) {
            newSuggestions[match.productIndex] = match.suggestedCategory;
            // Auto-assign if confidence is high
            if (match.confidence > 80) {
              newCategoryMap[match.productIndex] = match.suggestedCategory;
            }
          }
        });
        
        setSuggestions(newSuggestions);
        setCategoryMap(newCategoryMap);
      }
    } catch (e) {
      console.error("Auto-match error:", e);
    } finally {
      setIsMatching(false);
    }
  };

  const toggleRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const selectAll = () => {
    if (selectedRows.size === csvData.rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(csvData.rows.map((_, i) => i)));
    }
  };

  const assignBulkCategory = () => {
    if (!bulkCategory.trim()) return;
    
    const newMap = { ...categoryMap };
    selectedRows.forEach(index => {
      newMap[index] = bulkCategory.trim();
    });
    setCategoryMap(newMap);
    setBulkCategory("");
    setSelectedRows(new Set());
  };

  const assignSingleCategory = (index, category) => {
    const newMap = { ...categoryMap };
    newMap[index] = category.trim();
    setCategoryMap(newMap);
  };

  const getImageUrl = (row) => {
    if (!imageColumn) return null;
    const url = row[imageColumn];
    if (!url) return null;
    // Handle blob URLs - they won't work, but we can show a placeholder
    if (url.startsWith('blob:')) return null;
    return url;
  };

  const getDistributorCategory = (row) => {
    if (!categoryColumn) return "No category";
    return row[categoryColumn] || "No category";
  };

  const handleSave = () => {
    // Add category column to all rows
    const updatedRows = csvData.rows.map((row, index) => ({
      ...row,
      categoryPath: categoryMap[index] || row.categoryPath || ""
    }));

    const updatedData = {
      ...csvData,
      headers: csvData.headers.includes("categoryPath") 
        ? csvData.headers 
        : [...csvData.headers, "categoryPath"],
      rows: updatedRows
    };

    onCategoriesAssigned(updatedData);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
      overflow: "auto",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        background: "#0f172a",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid #1f2937"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <div>
            <h2 style={{ color: "#ffffff", margin: 0 }}>
              Assign Categories ({csvData?.rows?.length || 0} products)
            </h2>
            {isMatching && (
              <div style={{ color: "#60a5fa", fontSize: "12px", marginTop: "4px" }}>
                Auto-matching categories...
              </div>
            )}
            {userCategories.length > 0 && !isMatching && (
              <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                {userCategories.length} categories loaded • {Object.keys(suggestions).length} suggestions
              </div>
            )}
            {userCategories.length === 0 && (
              <div style={{ color: "#fbbf24", fontSize: "12px", marginTop: "4px" }}>
                No categories imported. Import categories for auto-matching.
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#64748b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>

        {/* Column Selection */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
          padding: "16px",
          background: "#1e293b",
          borderRadius: "8px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#cbd5f5" }}>
              Image Column:
            </label>
            <select
              value={imageColumn}
              onChange={(e) => setImageColumn(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#0f172a",
                border: "1px solid #1f2937",
                color: "#fff",
                borderRadius: "6px"
              }}
            >
              <option value="">-- Auto-detect --</option>
              {csvData?.headers?.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#cbd5f5" }}>
              Distributor Category Column:
            </label>
            <select
              value={categoryColumn}
              onChange={(e) => setCategoryColumn(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#0f172a",
                border: "1px solid #1f2937",
                color: "#fff",
                borderRadius: "6px"
              }}
            >
              <option value="">-- Auto-detect --</option>
              {csvData?.headers?.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Assignment */}
        <div style={{
          marginBottom: "24px",
          padding: "16px",
          background: "#1e293b",
          borderRadius: "8px"
        }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={selectAll}
              style={{
                padding: "8px 16px",
                background: selectedRows.size === csvData.rows.length ? "#4dabff" : "#64748b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {selectedRows.size === csvData.rows.length ? "Deselect All" : "Select All"}
            </button>
            <span style={{ color: "#cbd5f5" }}>
              {selectedRows.size} selected
            </span>
            <input
              type="text"
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              placeholder="Enter category path (e.g., Electronics/Audio/Headphones)"
              style={{
                flex: 1,
                minWidth: "300px",
                padding: "8px 12px",
                background: "#0f172a",
                border: "1px solid #1f2937",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
            <button
              onClick={assignBulkCategory}
              disabled={!bulkCategory.trim() || selectedRows.size === 0}
              style={{
                padding: "8px 16px",
                background: (!bulkCategory.trim() || selectedRows.size === 0) ? "#64748b" : "#4dabff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: (!bulkCategory.trim() || selectedRows.size === 0) ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              Assign to Selected
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
          maxHeight: "60vh",
          overflowY: "auto",
          padding: "8px"
        }}>
          {csvData?.rows?.map((row, index) => {
            const imageUrl = getImageUrl(row);
            const distributorCat = getDistributorCategory(row);
            const assignedCat = categoryMap[index] || "";
            const isSelected = selectedRows.has(index);

            return (
              <div
                key={index}
                onClick={() => toggleRow(index)}
                style={{
                  background: isSelected ? "#1e3a8a" : "#1e293b",
                  border: isSelected ? "2px solid #4dabff" : "1px solid #334155",
                  borderRadius: "8px",
                  padding: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: "#0f172a",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={row.title || row.name || `Product ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div style="color: #64748b; text-align: center; padding: 20px;">No Image</div>';
                      }}
                    />
                  ) : (
                    <div style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ fontSize: "12px", color: "#cbd5f5", marginBottom: "4px" }}>
                  {row.title || row.name || `Product ${index + 1}`}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                  Distributor: {distributorCat}
                </div>

                {/* Category Input with Suggestions */}
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={assignedCat}
                    onChange={(e) => assignSingleCategory(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={suggestions[index] ? `Suggested: ${suggestions[index]}` : "Your category path"}
                    style={{
                      width: "100%",
                      padding: "6px",
                      background: suggestions[index] && !assignedCat ? "#1e3a8a" : "#0f172a",
                      border: suggestions[index] && !assignedCat ? "1px solid #4dabff" : "1px solid #334155",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "11px"
                    }}
                  />
                  {suggestions[index] && !assignedCat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        assignSingleCategory(index, suggestions[index]);
                      }}
                      style={{
                        position: "absolute",
                        right: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        padding: "2px 6px",
                        background: "#4dabff",
                        color: "#020617",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "9px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "16px",
          borderTop: "1px solid #1f2937"
        }}>
          <div style={{ color: "#cbd5f5" }}>
            {Object.keys(categoryMap).length} of {csvData?.rows?.length || 0} products categorized
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "#64748b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "10px 20px",
                background: "#4dabff",
                color: "#020617",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              Save Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

