"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CategoryMatcherTest() {
  const [step, setStep] = useState(1); // 1: Import Categories, 2: Upload CSV, 3: Match & Export
  const [categories, setCategories] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [matchedData, setMatchedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Import Categories
  const handleCategoryFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      setError("Please upload a CSV or JSON file");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let categoryData = [];

        if (file.name.endsWith(".csv")) {
          const lines = text.split("\n").filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error("CSV must have at least a header and one row");
          }

          const parseLine = (line) => {
            const result = [];
            let current = "";
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, ""));
          
          // Try to find columns - support multiple formats
          const nameIndex = headers.findIndex(h => /^name$/i.test(h));
          const pathIndex = headers.findIndex(h => /^(path|urlSlug|url-slug)$/i.test(h));
          const keywordsIndex = headers.findIndex(h => /keyword/i.test(h));
          const parentIndex = headers.findIndex(h => /^(parentCategory|parent-category|parent)$/i.test(h));
          const descriptionIndex = headers.findIndex(h => /^description$/i.test(h));

          // Build category map for path construction
          const categoryMap = new Map();
          const allRows = lines.slice(1).map(line => {
            const values = parseLine(line).map(v => v.replace(/^"|"$/g, ""));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });
            return row;
          });

          // First pass: build map of id -> category info
          allRows.forEach(row => {
            const id = row.id || row.ID || "";
            const name = row.name || row.Name || "";
            const parentCat = row.parentCategory || row["parentCategory"] || "";
            const urlSlug = row.urlSlug || row["urlSlug"] || "";
            
            categoryMap.set(id, {
              id,
              name,
              parentCategory: parentCat,
              urlSlug,
              description: row.description || row.Description || ""
            });
          });

          // Second pass: build full paths and extract keywords
          categoryData = allRows.map(row => {
            const name = row.name || row.Name || "";
            const parentCat = row.parentCategory || row["parentCategory"] || "";
            const urlSlug = row.urlSlug || row["urlSlug"] || "";
            const description = row.description || row.Description || "";
            
            // Build full path from parentCategory hierarchy
            let fullPath = "";
            if (urlSlug) {
              fullPath = urlSlug; // Use urlSlug as the path
            } else if (parentCat && name) {
              // Build path from parentCategory > name
              fullPath = parentCat ? `${parentCat} > ${name}` : name;
            } else if (name) {
              fullPath = name;
            }

            // Extract keywords from name, description, and meta keywords
            const keywords = [];
            if (name) keywords.push(name.toLowerCase());
            if (description) {
              // Extract meaningful words from description (remove HTML, common words)
              const descWords = description
                .replace(/<[^>]+>/g, " ") // Remove HTML tags
                .toLowerCase()
                .split(/\s+/)
                .filter(w => w.length > 3 && !/^(the|and|for|with|from|that|this|are|was|were|been|have|has|had|will|would|could|should|may|might|must|can)$/i.test(w))
                .slice(0, 5); // Take first 5 meaningful words
              keywords.push(...descWords);
            }
            if (row.metaKeywords) {
              const metaKeywords = row.metaKeywords.split(/[,;]/).map(k => k.trim().toLowerCase());
              keywords.push(...metaKeywords);
            }

            return {
              path: fullPath,
              keywords: [...new Set(keywords)], // Remove duplicates
              parentPath: parentCat || ""
            };
          }).filter(cat => cat.path);
        } else {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            categoryData = json;
          } else if (json.categories && Array.isArray(json.categories)) {
            categoryData = json.categories;
          } else {
            throw new Error("JSON must be an array or have a 'categories' array");
          }
        }

        setCategories(categoryData);
        setError(null);
        alert(`Successfully loaded ${categoryData.length} categories!`);
      } catch (err) {
        setError(err.message || "Failed to load categories");
        console.error("Import error:", err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  // Step 2: Upload Distributor CSV
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split("\n").filter(line => line.trim());
        if (lines.length === 0) {
          throw new Error("CSV file is empty");
        }

        const parseLine = (line) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map(line => {
          const values = parseLine(line).map(v => v.replace(/^"|"$/g, ""));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });

        setCsvData({ headers, rows });
        setError(null);
        alert(`Successfully loaded ${rows.length} products!`);
      } catch (err) {
        setError(err.message || "Failed to load CSV");
        console.error("CSV parse error:", err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  // Step 3: Match Categories
  const matchCategories = async () => {
    if (!categories.length || !csvData) {
      setError("Please import categories and CSV first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find category column (try multiple names)
      const categoryCol = csvData.headers.find(h => 
        /^category$/i.test(h)
      ) || csvData.headers.find(h => 
        /category|cat|type|path|group/i.test(h)
      );

      // Find product name column
      const nameCol = csvData.headers.find(h => 
        /^(item description|product name|name|title)$/i.test(h)
      ) || csvData.headers.find(h => 
        /name|title|description/i.test(h)
      );

      // Find description column
      const descCol = csvData.headers.find(h => 
        /^(long description|description)$/i.test(h)
      ) || csvData.headers.find(h => 
        /description/i.test(h) && !/item description/i.test(h)
      );

      // Prepare products for matching
      const products = csvData.rows.map((row, index) => ({
        index,
        distributorCategory: categoryCol ? row[categoryCol] : "",
        productName: nameCol ? row[nameCol] : row["Item Description"] || row["Product Name"] || "",
        description: descCol ? row[descCol] : row["Long Description"] || ""
      }));

      // Enhanced matching logic
      const matches = products.map(product => {
        const distributorCat = (product.distributorCategory || "").toLowerCase().trim();
        const productName = (product.productName || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const searchText = `${distributorCat} ${productName} ${description}`;

        let bestMatch = null;
        let bestScore = 0;

        categories.forEach(cat => {
          let score = 0;
          const catPath = (cat.path || "").toLowerCase();
          const catName = catPath.split("/").pop().split(">").pop().trim();

          // 1. Direct distributor category match (highest priority)
          if (distributorCat) {
            // Exact match with category name
            if (catName === distributorCat || catName.includes(distributorCat) || distributorCat.includes(catName)) {
              score += 20;
            }
            // Match in path
            if (catPath.includes(distributorCat)) {
              score += 15;
            }
            // Partial match
            const distWords = distributorCat.split(/\s+/);
            distWords.forEach(word => {
              if (word.length > 3 && catPath.includes(word)) {
                score += 5;
              }
            });
          }

          // 2. Keyword matching in product name/description
          (cat.keywords || []).forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            if (searchText.includes(lowerKeyword)) {
              score += 8;
            }
            // Partial keyword match
            if (lowerKeyword.length > 4 && searchText.includes(lowerKeyword.substring(0, 4))) {
              score += 3;
            }
          });

          // 3. Category name in product text
          if (catName && catName.length > 2) {
            if (searchText.includes(catName)) {
              score += 6;
            }
            // Check for variations (e.g., "lube" vs "lubricant")
            if (catName.includes("lube") && (searchText.includes("lubricant") || searchText.includes("lube"))) {
              score += 10;
            }
            if (catName.includes("vibrat") && searchText.includes("vibrat")) {
              score += 10;
            }
            if (catName.includes("dildo") && searchText.includes("dildo")) {
              score += 10;
            }
          }

          // 4. Path segment matching
          const pathSegments = catPath.split(/[\/>]/).map(s => s.trim().toLowerCase());
          pathSegments.forEach(segment => {
            if (segment.length > 3 && searchText.includes(segment)) {
              score += 4;
            }
          });

          if (score > bestScore) {
            bestScore = score;
            bestMatch = cat.path;
          }
        });

        return {
          productIndex: product.index,
          suggestedCategory: bestMatch,
          confidence: bestScore > 0 ? Math.min(100, (bestScore / 30) * 100) : 0
        };
      });

      // Add categories to CSV data
      const updatedRows = csvData.rows.map((row, index) => {
        const match = matches.find(m => m.productIndex === index);
        return {
          ...row,
          categoryPath: match?.suggestedCategory || "",
          matchConfidence: match?.confidence || 0
        };
      });

      const updatedHeaders = csvData.headers.includes("categoryPath")
        ? csvData.headers
        : [...csvData.headers, "categoryPath", "matchConfidence"];

      setMatchedData({
        headers: updatedHeaders,
        rows: updatedRows,
        matches
      });

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to match categories");
      console.error("Match error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Export matched CSV
  const exportCsv = () => {
    if (!matchedData) {
      setError("Please match categories first");
      return;
    }

    const csvRows = [
      matchedData.headers.join(","),
      ...matchedData.rows.map(row => {
        return matchedData.headers.map(header => {
          const value = row[header] || "";
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${String(value).replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(",");
      })
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "matched_products.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: "#0f172a",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #1f2937"
    }}>
      {/* Step Indicator */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "32px",
        position: "relative"
      }}>
        <div style={{
          flex: 1,
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: step >= 1 ? "#4dabff" : "#64748b",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            margin: "0 auto 8px"
          }}>
            1
          </div>
          <div style={{ color: step >= 1 ? "#4dabff" : "#64748b", fontSize: "14px", fontWeight: "600" }}>
            Import Categories
          </div>
        </div>
        <div style={{
          flex: 1,
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: step >= 2 ? "#4dabff" : "#64748b",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            margin: "0 auto 8px"
          }}>
            2
          </div>
          <div style={{ color: step >= 2 ? "#4dabff" : "#64748b", fontSize: "14px", fontWeight: "600" }}>
            Upload CSV
          </div>
        </div>
        <div style={{
          flex: 1,
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: step >= 3 ? "#4dabff" : "#64748b",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            margin: "0 auto 8px"
          }}>
            3
          </div>
          <div style={{ color: step >= 3 ? "#4dabff" : "#64748b", fontSize: "14px", fontWeight: "600" }}>
            Match & Export
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          color: "#fca5a5",
          marginBottom: "24px"
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Import Categories */}
      {step === 1 && (
        <div>
          <h2 style={{ color: "#ffffff", marginBottom: "16px" }}>Step 1: Import Your Categories</h2>
          <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
            Upload a CSV or JSON file with your category structure. Format: Category Path, Keywords, Parent Path
          </p>
          
          <div
            onClick={() => document.getElementById("category-upload")?.click()}
            style={{
              border: "2px dashed #3b82f6",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "rgba(59, 130, 246, 0.05)",
              transition: "all 0.2s",
              marginBottom: "24px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
            }}
          >
            <div style={{ color: "#60a5fa", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
              {loading ? "Loading..." : categories.length > 0 ? `${categories.length} categories loaded` : "Click to Upload Categories"}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>
              CSV or JSON format
            </div>
          </div>
          <input
            id="category-upload"
            type="file"
            accept=".csv,.json"
            onChange={handleCategoryFileUpload}
            style={{ display: "none" }}
          />

          {categories.length > 0 && (
            <div style={{
              background: "#1e293b",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "24px"
            }}>
              <div style={{ color: "#ffffff", fontWeight: "600", marginBottom: "12px" }}>
                Preview ({categories.length} categories)
              </div>
              <div style={{
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {categories.slice(0, 10).map((cat, i) => (
                  <div key={i} style={{
                    padding: "8px",
                    background: "#0f172a",
                    borderRadius: "6px",
                    marginBottom: "4px",
                    fontSize: "13px",
                    color: "#cbd5f5"
                  }}>
                    {cat.path}
                    {cat.keywords && cat.keywords.length > 0 && (
                      <span style={{ color: "#9ca3af", marginLeft: "8px" }}>
                        ({cat.keywords.join(", ")})
                      </span>
                    )}
                  </div>
                ))}
                {categories.length > 10 && (
                  <div style={{ color: "#9ca3af", fontSize: "12px", textAlign: "center", marginTop: "8px" }}>
                    ... and {categories.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <button
              onClick={() => setStep(2)}
              style={{
                marginTop: "24px",
                padding: "12px 24px",
                background: "#4dabff",
                color: "#020617",
                fontWeight: 700,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Next: Upload Distributor CSV
            </button>
          )}
        </div>
      )}

      {/* Step 2: Upload CSV */}
      {step === 2 && (
        <div>
          <h2 style={{ color: "#ffffff", marginBottom: "16px" }}>Step 2: Upload Distributor CSV</h2>
          <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
            Upload the CSV file from your distributor with product information.
          </p>
          
          <div
            onClick={() => document.getElementById("csv-upload")?.click()}
            style={{
              border: "2px dashed #3b82f6",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "rgba(59, 130, 246, 0.05)",
              transition: "all 0.2s",
              marginBottom: "24px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
            }}
          >
            <div style={{ color: "#60a5fa", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
              {loading ? "Loading..." : csvData ? `${csvData.rows.length} products loaded` : "Click to Upload CSV"}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>
              CSV format
            </div>
          </div>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            style={{ display: "none" }}
          />

          {csvData && (
            <div style={{
              background: "#1e293b",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "24px"
            }}>
              <div style={{ color: "#ffffff", fontWeight: "600", marginBottom: "12px" }}>
                CSV Preview ({csvData.rows.length} products)
              </div>
              <div style={{
                maxHeight: "200px",
                overflowY: "auto",
                fontSize: "12px",
                color: "#cbd5f5"
              }}>
                <div style={{ marginBottom: "8px", fontWeight: "600" }}>
                  Columns: {csvData.headers.join(", ")}
                </div>
                <div style={{ color: "#9ca3af" }}>
                  First product: {JSON.stringify(csvData.rows[0], null, 2).substring(0, 200)}...
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: "12px 24px",
                background: "#64748b",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                flex: 1
              }}
            >
              Back
            </button>
            {csvData && (
              <button
                onClick={() => {
                  setStep(3);
                  matchCategories();
                }}
                style={{
                  padding: "12px 24px",
                  background: "#4dabff",
                  color: "#020617",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Match Categories
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Match & Export */}
      {step === 3 && (
        <div>
          <h2 style={{ color: "#ffffff", marginBottom: "16px" }}>Step 3: Review Matches & Export</h2>
          <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
            Review the category matches and export your CSV with categories included.
          </p>

          {loading && (
            <div style={{
              padding: "20px",
              textAlign: "center",
              color: "#60a5fa"
            }}>
              Matching categories...
            </div>
          )}

          {matchedData && (
            <>
              <div style={{
                background: "#1e293b",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px"
              }}>
                <div style={{ color: "#ffffff", fontWeight: "600", marginBottom: "12px" }}>
                  Match Summary
                </div>
                <div style={{ color: "#cbd5f5", fontSize: "14px" }}>
                  <div>Total Products: {matchedData.rows.length}</div>
                  <div>Matched: {matchedData.matches.filter(m => m.suggestedCategory).length}</div>
                  <div>High Confidence ({'>'}80%): {matchedData.matches.filter(m => m.confidence > 80).length}</div>
                  <div>Needs Review: {matchedData.matches.filter(m => !m.suggestedCategory || m.confidence <= 80).length}</div>
                </div>
              </div>

              <div style={{
                maxHeight: "400px",
                overflowY: "auto",
                background: "#1e293b",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px"
              }}>
                <div style={{ color: "#ffffff", fontWeight: "600", marginBottom: "12px" }}>
                  Sample Matches (first 20)
                </div>
                {matchedData.rows.slice(0, 20).map((row, i) => {
                  const match = matchedData.matches.find(m => m.productIndex === i);
                  return (
                    <div key={i} style={{
                      padding: "12px",
                      background: "#0f172a",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      fontSize: "13px"
                    }}>
                      <div style={{ color: "#ffffff", marginBottom: "4px" }}>
                        {row.title || row.name || row["Product Name"] || `Product ${i + 1}`}
                      </div>
                      <div style={{ color: match?.confidence > 80 ? "#4ade80" : match?.confidence > 50 ? "#fbbf24" : "#f87171" }}>
                        Category: {row.categoryPath || "No match"}
                        {match && ` (${Math.round(match.confidence)}% confidence)`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: "12px 24px",
                    background: "#64748b",
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: 1
                  }}
                >
                  Back
                </button>
                <button
                  onClick={exportCsv}
                  style={{
                    padding: "12px 24px",
                    background: "#4dabff",
                    color: "#020617",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: 1
                  }}
                >
                  Export CSV with Categories
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

