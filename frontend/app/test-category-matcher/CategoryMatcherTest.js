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
          
          // Flexible column detection - try multiple common names
          const findColumn = (patterns) => {
            for (const pattern of patterns) {
              const index = headers.findIndex(h => pattern.test(h));
              if (index >= 0) return index;
            }
            return -1;
          };

          const nameIndex = findColumn([
            /^name$/i,
            /^category$/i,
            /^category[\s_-]?name$/i,
            /^cat[\s_-]?name$/i
          ]);
          
          const pathIndex = findColumn([
            /^(path|urlSlug|url-slug|url_slug|slug|category[\s_-]?path)$/i,
            /^full[\s_-]?path$/i
          ]);
          
          const keywordsIndex = findColumn([
            /keyword/i,
            /^tags?$/i,
            /^meta[\s_-]?keywords?$/i
          ]);
          
          const parentIndex = findColumn([
            /^(parentCategory|parent-category|parent_category|parent)$/i,
            /^parent[\s_-]?path$/i,
            /^parent[\s_-]?name$/i
          ]);
          
          const descriptionIndex = findColumn([
            /^description$/i,
            /^desc$/i,
            /^category[\s_-]?description$/i
          ]);

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
            // Get values using flexible column detection
            const name = nameIndex >= 0 ? (row[headers[nameIndex]] || "") : 
                        (row.name || row.Name || row.Category || "");
            const parentCat = parentIndex >= 0 ? (row[headers[parentIndex]] || "") :
                            (row.parentCategory || row["parentCategory"] || row.Parent || "");
            const urlSlug = pathIndex >= 0 ? (row[headers[pathIndex]] || "") :
                          (row.urlSlug || row["urlSlug"] || row.path || row.Path || "");
            const description = descriptionIndex >= 0 ? (row[headers[descriptionIndex]] || "") :
                              (row.description || row.Description || "");
            
            // Build full path - try multiple formats
            let fullPath = "";
            
            // Priority 1: Use explicit path/slug if available
            if (urlSlug) {
              fullPath = urlSlug;
            } 
            // Priority 2: Build from parent + name
            else if (parentCat && name) {
              // Handle different separators in parentCategory
              const separator = parentCat.includes(">") ? " > " : 
                              parentCat.includes("/") ? "/" :
                              parentCat.includes("|") ? "|" : " > ";
              fullPath = `${parentCat}${separator}${name}`;
            } 
            // Priority 3: Just use name
            else if (name) {
              fullPath = name;
            }
            // Priority 4: Try to find any column that looks like a path
            else {
              for (const header of headers) {
                const value = row[header] || "";
                if (value && (value.includes("/") || value.includes(">") || value.includes("|"))) {
                  fullPath = value;
                  break;
                }
              }
            }

            // Extract keywords from multiple sources
            const keywords = [];
            const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'your', 'you', 'our', 'all', 'any', 'but', 'not', 'what', 'when', 'where', 'who', 'why', 'how']);
            
            // 1. Add category name and its words
            if (name) {
              keywords.push(name.toLowerCase());
              // Split name into words
              const nameWords = name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
              keywords.push(...nameWords);
            }
            
            // 2. Extract from description
            if (description) {
              const cleanDesc = description
                .replace(/<[^>]+>/g, " ") // Remove HTML tags
                .replace(/[^\w\s]/g, " ") // Remove special chars
                .toLowerCase();
              
              const descWords = cleanDesc
                .split(/\s+/)
                .filter(w => w.length > 3 && !stopWords.has(w))
                .slice(0, 8); // Take first 8 meaningful words
              keywords.push(...descWords);
            }
            
            // 3. Extract from path segments
            if (fullPath) {
              const pathWords = fullPath
                .split(/[\/>|\\]/)
                .map(s => s.trim().toLowerCase())
                .filter(s => s.length > 2);
              keywords.push(...pathWords);
            }
            
            // 4. Add explicit keywords if column exists
            if (keywordsIndex >= 0 && row[headers[keywordsIndex]]) {
              const explicitKeywords = row[headers[keywordsIndex]]
                .split(/[,;|]/)
                .map(k => k.trim().toLowerCase())
                .filter(k => k);
              keywords.push(...explicitKeywords);
            }
            
            // 5. Check for metaKeywords column
            const metaKeywordsCol = headers.find(h => /meta[\s_-]?keyword/i.test(h));
            if (metaKeywordsCol && row[metaKeywordsCol]) {
              const metaKeywords = row[metaKeywordsCol]
                .split(/[,;]/)
                .map(k => k.trim().toLowerCase())
                .filter(k => k);
              keywords.push(...metaKeywords);
            }
            
            // Remove duplicates and short words
            const uniqueKeywords = [...new Set(keywords)].filter(k => k.length > 2);

            return {
              path: fullPath,
              keywords: uniqueKeywords,
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
      // Flexible column detection for distributor CSV
      const findDistributorColumn = (patterns, excludePatterns = []) => {
        // Try exact matches first
        for (const pattern of patterns) {
          const exact = csvData.headers.find(h => pattern.test(h));
          if (exact && !excludePatterns.some(ex => ex.test(exact))) {
            return exact;
          }
        }
        // Try partial matches
        for (const pattern of patterns) {
          const partial = csvData.headers.find(h => {
            const matches = pattern.test(h);
            const excluded = excludePatterns.some(ex => ex.test(h));
            return matches && !excluded;
          });
          if (partial) return partial;
        }
        return null;
      };

      // Find category column - try many variations
      const categoryCol = findDistributorColumn([
        /^category$/i,
        /^cat$/i,
        /^product[\s_-]?category$/i,
        /^item[\s_-]?category$/i,
        /^type$/i,
        /^group$/i,
        /^class$/i,
        /category|cat|type|group|class/i
      ]);

      // Find product name column - prioritize common names
      const nameCol = findDistributorColumn([
        /^(item[\s_-]?description|product[\s_-]?name|name|title|product[\s_-]?title)$/i,
        /^item[\s_-]?name$/i,
        /^product$/i,
        /name|title/i
      ], [
        /long[\s_-]?description/i,
        /description$/i
      ]);

      // Find description column - exclude name columns
      const descCol = findDistributorColumn([
        /^(long[\s_-]?description|description|product[\s_-]?description|item[\s_-]?description)$/i,
        /^desc$/i,
        /description/i
      ], [
        /^(item[\s_-]?description|product[\s_-]?name)$/i
      ]);

      // Prepare products for matching
      const products = csvData.rows.map((row, index) => ({
        index,
        distributorCategory: categoryCol ? row[categoryCol] : "",
        productName: nameCol ? row[nameCol] : row["Item Description"] || row["Product Name"] || "",
        description: descCol ? row[descCol] : row["Long Description"] || ""
      }));

      // Universal matching logic - works with any category/product structure
      const matches = products.map(product => {
        const distributorCat = (product.distributorCategory || "").toLowerCase().trim();
        const productName = (product.productName || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const searchText = `${distributorCat} ${productName} ${description}`.toLowerCase();

        let bestMatch = null;
        let bestScore = 0;

        categories.forEach(cat => {
          let score = 0;
          const catPath = (cat.path || "").toLowerCase();
          
          // Extract category name from path (handle different separators)
          const catName = catPath
            .split(/[\/>|\\]/)
            .pop()
            .trim()
            .replace(/[^\w\s]/g, " ")
            .trim();

          // 1. Direct distributor category match (highest priority)
          if (distributorCat) {
            const distWords = distributorCat.split(/[\s\-_]+/).filter(w => w.length > 2);
            
            // Exact or near-exact match
            if (catName === distributorCat) {
              score += 25;
            } else if (catName.includes(distributorCat) || distributorCat.includes(catName)) {
              score += 20;
            }
            
            // Match in full path
            if (catPath.includes(distributorCat)) {
              score += 15;
            }
            
            // Word-by-word matching
            distWords.forEach(word => {
              if (word.length > 3) {
                if (catPath.includes(word)) score += 6;
                if (catName.includes(word)) score += 8;
              }
            });
          }

          // 2. Keyword matching (most flexible)
          (cat.keywords || []).forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            if (!lowerKeyword || lowerKeyword.length < 2) return;
            
            // Exact keyword match
            if (searchText.includes(lowerKeyword)) {
              score += 10;
            }
            
            // Partial match (for longer keywords)
            if (lowerKeyword.length > 4) {
              const partial = lowerKeyword.substring(0, Math.min(5, lowerKeyword.length));
              if (searchText.includes(partial)) {
                score += 4;
              }
            }
            
            // Word boundary matching (better precision)
            const keywordRegex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (keywordRegex.test(searchText)) {
              score += 12;
            }
          });

          // 3. Category name matching in product text
          if (catName && catName.length > 2) {
            const catWords = catName.split(/[\s\-_]+/).filter(w => w.length > 2);
            
            // Full name match
            if (searchText.includes(catName)) {
              score += 8;
            }
            
            // Word-by-word
            catWords.forEach(word => {
              if (word.length > 3 && searchText.includes(word)) {
                score += 5;
              }
            });
            
            // Handle common variations/plurals
            const singular = catName.replace(/s$/, "");
            const plural = catName + "s";
            if (searchText.includes(singular) || searchText.includes(plural)) {
              score += 6;
            }
          }

          // 4. Path segment matching (for hierarchical categories)
          const pathSegments = catPath
            .split(/[\/>|\\]/)
            .map(s => s.trim().toLowerCase().replace(/[^\w\s]/g, " "))
            .filter(s => s.length > 2);
          
          pathSegments.forEach(segment => {
            const segmentWords = segment.split(/\s+/).filter(w => w.length > 2);
            segmentWords.forEach(word => {
              if (searchText.includes(word)) {
                score += 4;
              }
            });
          });

          // 5. Synonym/variation matching (common product terms)
          const synonyms = {
            'lube': ['lubricant', 'lube', 'lubrication'],
            'vibrat': ['vibrator', 'vibrating', 'vibration', 'vibe'],
            'dildo': ['dildo', 'dildos'],
            'anal': ['anal', 'anus', 'butt', 'backdoor'],
            'vaginal': ['vaginal', 'vagina', 'pussy'],
            'clitoral': ['clitoral', 'clitoris', 'clit'],
            'penis': ['penis', 'cock', 'dick'],
            'enhancer': ['enhancer', 'enhancement', 'stimulant'],
            'massager': ['massager', 'massage', 'massaging']
          };
          
          Object.keys(synonyms).forEach(key => {
            if (catPath.includes(key) || catName.includes(key)) {
              synonyms[key].forEach(synonym => {
                if (searchText.includes(synonym)) {
                  score += 8;
                }
              });
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
          confidence: bestScore > 0 ? Math.min(100, (bestScore / 35) * 100) : 0
        };
      });

      // Add categories to CSV data and replace Category column with matched categoryPath
      const categoryColumnName = csvData.headers.find(h => /^category$/i.test(h));
      
      const updatedRows = csvData.rows.map((row, index) => {
        const match = matches.find(m => m.productIndex === index);
        const newRow = {
          ...row,
          categoryPath: match?.suggestedCategory || "",
          matchConfidence: match?.confidence || 0
        };
        
        // Replace the distributor's "Category" column with the matched categoryPath
        // This ensures imports use your categories instead of distributor categories
        if (categoryColumnName) {
          newRow[categoryColumnName] = match?.suggestedCategory || "";
        }
        
        return newRow;
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

  // Reset everything to start over
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset? This will clear all uploaded data.")) {
      setStep(1);
      setCategories([]);
      setCsvData(null);
      setMatchedData(null);
      setError(null);
      setLoading(false);
      // Reset file inputs
      const categoryInput = document.getElementById("categoryFileInput");
      const csvInput = document.getElementById("distributorCsvInput");
      if (categoryInput) categoryInput.value = "";
      if (csvInput) csvInput.value = "";
    }
  };

  // Export matched CSV
  const exportCsv = () => {
    try {
      if (!matchedData) {
        setError("Please match categories first");
        return;
      }

      if (!matchedData.headers || !matchedData.rows) {
        setError("Invalid data format. Please try matching again.");
        return;
      }

      console.log("Exporting CSV with data:", {
        headers: matchedData.headers,
        rowCount: matchedData.rows.length,
        sampleRow: matchedData.rows[0]
      });

      const csvRows = [
        matchedData.headers.join(","),
        ...matchedData.rows.map(row => {
          return matchedData.headers.map(header => {
            // Get value and ensure it's a string
            let value = row[header];
            
            // Handle null, undefined, or non-string values
            if (value === null || value === undefined) {
              value = "";
            } else {
              value = String(value);
            }
            
            // Properly escape CSV values
            if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
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
      link.style.display = "none";
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup after a delay
      setTimeout(() => {
        try {
          if (link && link.parentNode) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }, 100);

      setError(null);
      alert(`CSV exported successfully! ${matchedData.rows.length} products with categories.`);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export CSV: " + err.message);
    }
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
              {loading ? "Loading..." : categories.length > 0 ? `${categories.length} categories loaded` : "Click to Upload Your Categories"}
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
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setStep(2)}
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
                Next: Upload Distributor CSV
              </button>
              <button
                onClick={handleReset}
                style={{ 
                  padding: "12px 20px", 
                  borderRadius: "10px", 
                  background: "#4dabff",
                  color: "#020617", 
                  fontWeight: 700, 
                  border: "none", 
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                Reset All
              </button>
            </div>
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
              {loading ? "Loading..." : csvData ? `${csvData.rows.length} products loaded` : "Click to Upload Distributor CSV"}
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
            <button
              onClick={handleReset}
              style={{ 
                padding: "12px 20px", 
                borderRadius: "10px", 
                background: "#4dabff",
                color: "#020617", 
                fontWeight: 700, 
                border: "none", 
                cursor: "pointer",
                transition: "transform 0.1s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              Reset All
            </button>
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
                <button
                  onClick={handleReset}
                  style={{ 
                    padding: "12px 20px", 
                    borderRadius: "10px", 
                    background: "#4dabff",
                    color: "#020617", 
                    fontWeight: 700, 
                    border: "none", 
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                >
                  Reset All
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

