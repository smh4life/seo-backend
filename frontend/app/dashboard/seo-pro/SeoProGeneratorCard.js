"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { apiPost } from "../../../lib/api";

const STORAGE_KEY = "seo_pro_generator_state";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const SeoProGeneratorCard = forwardRef(function SeoProGeneratorCard(props, ref) {
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [distributors, setDistributors] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);
  const generateButtonRef = useRef(null);
  const resetButtonRef = useRef(null);
  
  // Use refs to track latest state for saving
  const stateRef = useRef({ selectedDistributor, csvData, results, isGenerating, error, progress });

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refreshDistributors: loadDistributors
  }));

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = { selectedDistributor, csvData, results, isGenerating, error, progress };
  }, [selectedDistributor, csvData, results, isGenerating, error, progress]);

  // Load distributors and state on mount
  useEffect(() => {
    loadDistributors();
    const loadedState = loadState();
    
    // Check if generation was in progress and resume it
    if (loadedState && loadedState.isGenerating && loadedState.csvData && loadedState.csvData.rows) {
      // Restore CSV data first
      setCsvData(loadedState.csvData);
      stateRef.current.csvData = loadedState.csvData;
      
      // If we have results but generation was in progress, resume
      if (loadedState.results && loadedState.results.length < loadedState.csvData.rows.length) {
        setResults(loadedState.results);
        stateRef.current.results = loadedState.results;
        // Resume generation from where it left off
        setTimeout(() => {
          resumeGeneration();
        }, 100);
      }
    }
  }, []); // Only run once on mount

  // Load state from localStorage
  const loadState = () => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loaded = JSON.parse(saved);
        setSelectedDistributor(loaded.selectedDistributor || "");
        setResults(loaded.results || []);
        setIsGenerating(loaded.isGenerating || false);
        setProgress(loaded.progress || { current: 0, total: 0 });
        // Restore CSV data if available
        if (loaded.csvData) {
          setCsvData(loaded.csvData);
          stateRef.current.csvData = loaded.csvData;
        }
        // Update stateRef with loaded values
        stateRef.current = {
          selectedDistributor: loaded.selectedDistributor || "",
          csvData: loaded.csvData || null,
          results: loaded.results || [],
          isGenerating: loaded.isGenerating || false,
          error: loaded.error || null,
          progress: loaded.progress || { current: 0, total: 0 }
        };
        return loaded; // Return loaded state for resume check
      }
    } catch (e) {
      console.error("Failed to load SEO-Pro state:", e);
    }
    return null;
  };

  // Save state to localStorage (uses ref to get latest values)
  const saveState = (updates) => {
    if (typeof window === "undefined") return;
    try {
      const current = { ...stateRef.current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error("Failed to save SEO-Pro state:", e);
    }
  };

  // Load distributors from API
  const loadDistributors = async () => {
    try {
      const res = await fetch(`${API_BASE}/distributors`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setDistributors(data);
        if (data.length > 0 && !selectedDistributor) {
          setSelectedDistributor(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load distributors:", e);
    }
  };

  // Handle CSV file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setCsvFile(file);
    setError(null);
    stateRef.current.csvFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCsv(text);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Parse CSV data (handles quoted fields with commas)
  const parseCsv = (text) => {
    try {
      const lines = text.split("\n").filter(line => line.trim());
      if (lines.length === 0) {
        setError("CSV file is empty");
        return;
      }

      // Simple CSV parser that handles quoted fields
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
      console.log("[CSV Parse] Headers found:", headers);
      
      const rows = lines.slice(1).map(line => {
        const values = parseLine(line).map(v => v.replace(/^"|"$/g, ""));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });

      console.log("[CSV Parse] Sample row:", rows[0]);
      console.log("[CSV Parse] Available columns:", Object.keys(rows[0] || {}));

      const parsedData = { headers, rows };
      setCsvData(parsedData);
      stateRef.current.csvData = parsedData;
      // Save CSV data to localStorage so we can resume if needed
      saveState({ csvData: parsedData });
    } catch (e) {
      console.error("[CSV Parse] Error:", e);
      setError("Failed to parse CSV file: " + e.message);
    }
  };

  // Resume generation if it was interrupted
  const resumeGeneration = async () => {
    const currentCsvData = stateRef.current.csvData || csvData;
    const currentResults = stateRef.current.results || results;
    
    if (!currentCsvData || !currentCsvData.rows.length) {
      setIsGenerating(false);
      saveState({ isGenerating: false });
      return;
    }
    
    const startIndex = currentResults.length;
    if (startIndex >= currentCsvData.rows.length) {
      setIsGenerating(false);
      saveState({ isGenerating: false });
      return;
    }
    
    setIsGenerating(true);
    stateRef.current.isGenerating = true;
    setResults([...currentResults]);
    stateRef.current.results = [...currentResults];
    
    await continueGeneration(startIndex);
  };

  // Continue generation from a specific index
  const continueGeneration = async (startIndex = 0) => {
    const currentCsvData = stateRef.current.csvData || csvData;
    if (!currentCsvData || !currentCsvData.rows) {
      setIsGenerating(false);
      saveState({ isGenerating: false });
      return;
    }
    
    const rows = currentCsvData.rows;
    const currentResults = stateRef.current.results || results;
    const allResults = [...currentResults]; // Start with existing results

    // Process in chunks of 3 for speed
    const CHUNK_SIZE = 3;
    const chunks = [];
    for (let i = startIndex; i < rows.length; i += CHUNK_SIZE) {
      chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];

      const chunkResults = await Promise.all(
        chunk.map(async (row) => {
          try {
            // Find product name column (try common names, including Item Description)
            // Check with case-insensitive matching
            const productName = 
              row["Product Name"] || 
              row["product_name"] || 
              row["ProductName"] ||
              row["Item Description"] || 
              row["item_description"] || 
              row["ItemDescription"] ||
              row["Name"] || 
              row["name"] || 
              row["Title"] || 
              row["title"] || 
              row["Description"] || 
              row["description"] ||
              // Try case-insensitive search
              Object.keys(row).find(key => 
                key.toLowerCase() === "product name" || 
                key.toLowerCase() === "item description" ||
                key.toLowerCase() === "name" ||
                key.toLowerCase() === "title"
              ) ? row[Object.keys(row).find(key => 
                key.toLowerCase() === "product name" || 
                key.toLowerCase() === "item description" ||
                key.toLowerCase() === "name" ||
                key.toLowerCase() === "title"
              )] : null ||
              Object.values(row)[1] || // Try second column (usually product name after SKU)
              Object.values(row)[0] || ""; // Fallback to first column

            if (!productName || productName.trim() === "") {
              console.error("No product name found in row:", row);
              return { ...row, error: "No product name found" };
            }

            // Find product description for better context (try common names)
            const productDescription = 
              row["Long Description"] || 
              row["long_description"] || 
              row["LongDescription"] ||
              row["Description"] || 
              row["description"] ||
              // Try case-insensitive search
              Object.keys(row).find(key => 
                key.toLowerCase() === "long description" || 
                key.toLowerCase() === "description"
              ) ? row[Object.keys(row).find(key => 
                key.toLowerCase() === "long description" || 
                key.toLowerCase() === "description"
              )] : null ||
              "";

            console.log(`[SEO-Pro] Processing: "${productName}" with description: "${productDescription?.substring(0, 50)}..."`);

            // Send both product name and description to get more accurate, unique content
            const res = await fetch(`${API_BASE}/generate/single`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ 
                topic: productName.trim(),
                description: productDescription ? productDescription.trim() : "" // Pass description for context
              })
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error("Generation failed for", productName, ":", res.status, errorText);
              return { ...row, error: `Generation failed (${res.status})` };
            }

            const seoData = await res.json();
            
            if (!seoData || !seoData.title || !seoData.description) {
              console.error("Invalid response for", productName, ":", seoData);
              return { ...row, error: "Invalid response from server" };
            }
            return {
              ...row,
              "SEO Title": seoData.title || "",
              "Meta Description": seoData.description || "",
              "Keywords": Array.isArray(seoData.keywords) ? seoData.keywords.join(", ") : seoData.keywords || ""
            };
          } catch (error) {
            return { ...row, error: error.message };
          }
        })
      );

      allResults.push(...chunkResults);
      const newProgress = { current: allResults.length, total: rows.length };
      setResults([...allResults]);
      stateRef.current.results = [...allResults];
      setProgress(newProgress);
      stateRef.current.progress = newProgress;
      
      // Save state after each chunk (in case component unmounts)
      saveState({
        results: allResults,
        isGenerating: true,
        error: null,
        progress: newProgress,
        csvData: currentCsvData // Save CSV data so we can resume
      });
    }

    setIsGenerating(false);
    stateRef.current.isGenerating = false;
    saveState({ isGenerating: false });
  };

  // Generate SEO for all CSV rows
  const generateSeoPro = async () => {
    if (!csvData || !csvData.rows.length) {
      setError("Please upload a CSV file first");
      return;
    }

    if (!selectedDistributor) {
      setError("Please select a distributor");
      return;
    }

    // Button press animation
    const button = generateButtonRef.current;
    if (button) {
      button.classList.add("button-press");
      setTimeout(() => {
        if (button) {
          button.classList.remove("button-press");
        }
      }, 200);
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);
    setProgress({ current: 0, total: csvData.rows.length });
    stateRef.current.isGenerating = true;
    stateRef.current.results = [];
    stateRef.current.csvData = csvData;
    stateRef.current.progress = { current: 0, total: csvData.rows.length };
    saveState({ 
      isGenerating: true, 
      results: [],
      progress: { current: 0, total: csvData.rows.length },
      csvData: csvData // Save CSV data so we can resume
    });
    
    try {
      await continueGeneration(0);
    } catch (error) {
      console.error("Generate SEO-Pro error:", error);
      setError("Failed to generate SEO: " + (error.message || "Unknown error"));
      setIsGenerating(false);
      stateRef.current.isGenerating = false;
      saveState({ isGenerating: false });
    }
  };

  // Download results as CSV
  const downloadCsv = () => {
    if (!results.length) return;

    // Get all unique headers from original CSV and new SEO fields
    const allHeaders = new Set([...csvData.headers, "SEO Title", "Meta Description", "Keywords"]);
    const headers = Array.from(allHeaders);

    // Create CSV content
    const csvRows = [
      headers.join(","),
      ...results.map(row => {
        return headers.map(header => {
          const value = row[header] || "";
          // Escape commas and quotes
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
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
    link.setAttribute("download", "SEO_PRO_RESULTS.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset everything
  const reset = () => {
    setCsvFile(null);
    setCsvData(null);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsGenerating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ 
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes buttonPress {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .button-press {
          animation: buttonPress 0.2s ease;
        }
      `}</style>


      {/* Distributor Selection */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Select Distributor:</label>
        <select
          value={selectedDistributor}
          onChange={(e) => {
            setSelectedDistributor(e.target.value);
            saveState({ selectedDistributor: e.target.value });
          }}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            background: "#0f172a",
            border: "1px solid #1f2937",
            color: "#fff",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          <option value="">-- Select Distributor --</option>
          {distributors.map((dist) => (
            <option key={dist.id} value={dist.id}>
              {dist.name}
            </option>
          ))}
        </select>
      </div>

      {/* CSV Upload */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Upload CSV File:</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed #3b82f6",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            transition: "all 0.2s",
            background: "#0f172a",
            borderColor: "#1f2937"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
            e.currentTarget.style.borderColor = "#60a5fa";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#0f172a";
            e.currentTarget.style.borderColor = "#1f2937";
          }}
        >
          <div style={{ color: "#60a5fa", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
            {csvFile ? csvFile.name : "Click to Upload CSV"}
          </div>
          <div style={{ color: "#9ca3af", fontSize: "14px" }}>
            {csvFile ? `${csvData?.rows?.length || 0} rows loaded` : "Allowed: Product CSV Files (UTF-8)"}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        <button
          ref={generateButtonRef}
          disabled={isGenerating || !csvData || !selectedDistributor}
          onClick={generateSeoPro}
          style={{ 
            padding: "12px 20px", 
            borderRadius: "10px", 
            background: isGenerating || !csvData || !selectedDistributor ? "#64748b" : "#4dabff", 
            color: "#020617", 
            fontWeight: 700, 
            border: "none", 
            cursor: isGenerating || !csvData || !selectedDistributor ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            opacity: isGenerating || !csvData || !selectedDistributor ? 0.7 : 1,
            position: "relative"
          }}
        >
          {isGenerating ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "2px solid #020617",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }}></span>
              Generating... {progress.total > 0 && `(${progress.current}/${progress.total})`}
            </span>
          ) : (
            "Generate SEO-Pro"
          )}
        </button>

        {results.length > 0 && (
          <button
            onClick={downloadCsv}
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
            Download CSV
          </button>
        )}

        <button
          ref={resetButtonRef}
          onClick={(e) => {
            const button = resetButtonRef.current || e.currentTarget;
            if (button) {
              button.classList.add("button-press");
              setTimeout(() => {
                if (button) {
                  button.classList.remove("button-press");
                }
              }, 200);
            }
            reset();
          }}
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
          Reset
        </button>
      </div>

      {/* Error Display */}
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

      {/* Progress Display */}
      {isGenerating && (
        <div style={{
          padding: "12px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          border: "1px solid #3b82f6",
          borderRadius: "8px",
          color: "#93c5fd",
          marginBottom: "16px"
        }}>
          Processing {progress.current} of {progress.total} products...
          {progress.total > 0 && (
            <div style={{ marginTop: "8px", width: "100%", height: "8px", backgroundColor: "#1f2937", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                width: `${(progress.current / progress.total) * 100}%`,
                height: "100%",
                backgroundColor: "#3b82f6",
                transition: "width 0.3s"
              }} />
            </div>
          )}
        </div>
      )}

      {/* Results Preview */}
      {results.length > 0 && !isGenerating && (
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ color: "#ffffff", fontSize: "18px", marginBottom: "16px" }}>
            Results Preview ({results.length} products)
          </h3>
          <div style={{
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#0f172a"
          }}>
            {results.slice(0, 5).map((result, index) => (
              <div key={index} style={{
                padding: "12px",
                marginBottom: "8px",
                backgroundColor: "#1e293b",
                borderRadius: "6px",
                border: "1px solid #334155"
              }}>
                <div style={{ color: "#60a5fa", fontWeight: "600", marginBottom: "4px" }}>
                  {result["Product Name"] || result["product_name"] || result["Item Description"] || result["item_description"] || result["ItemDescription"] || result["Name"] || result["name"] || result["Title"] || result["title"] || Object.keys(result).find(k => k.toLowerCase().includes("item") && k.toLowerCase().includes("description")) ? result[Object.keys(result).find(k => k.toLowerCase().includes("item") && k.toLowerCase().includes("description"))] : null || Object.values(result).find(v => v && typeof v === "string" && v.length > 3 && !v.match(/^\d+\.?\d*$/)) || "Unknown Product"}
                </div>
                {result["SEO Title"] && (
                  <div style={{ color: "#d1d5db", fontSize: "13px", marginTop: "4px" }}>
                    <strong>Title:</strong> {result["SEO Title"]}
                  </div>
                )}
                {result["Meta Description"] && (
                  <div style={{ color: "#d1d5db", fontSize: "13px", marginTop: "4px" }}>
                    <strong>Description:</strong> {result["Meta Description"]}
                  </div>
                )}
                {result["Keywords"] && (
                  <div style={{ color: "#d1d5db", fontSize: "13px", marginTop: "4px" }}>
                    <strong>Keywords:</strong> {result["Keywords"]}
                  </div>
                )}
              </div>
            ))}
            {results.length > 5 && (
              <div style={{ color: "#9ca3af", fontSize: "12px", textAlign: "center", marginTop: "8px" }}>
                ... and {results.length - 5} more. Download CSV to see all results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default SeoProGeneratorCard;
