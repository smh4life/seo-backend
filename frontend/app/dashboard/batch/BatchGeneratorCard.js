"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiPost } from "../../../lib/api";

const STORAGE_KEY = "seo_generator_batch_state";

export default function BatchGeneratorCard() {
  // Initialize with empty state (server-side safe)
  const [topics, setTopics] = useState("");
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  // Load state from localStorage only on client side (after mount)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loaded = JSON.parse(saved);
        setTopics(loaded.topics || "");
        setResults(loaded.results || []);
        setIsGenerating(loaded.isGenerating || false);
        setError(loaded.error || null);
        setProgress(loaded.progress || { current: 0, total: 0 });
      }
    } catch (e) {
      console.error("Failed to load batch state:", e);
    }
  }, []); // Only run once on mount
  
  // Use refs to track latest state for saving
  const stateRef = useRef({ topics, results, isGenerating, error, progress });
  
  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = { topics, results, isGenerating, error, progress };
  }, [topics, results, isGenerating, error, progress]);
  
  // Helper to save state immediately (uses ref to get latest values)
  const saveState = (updates) => {
    if (typeof window === "undefined") return;
    try {
      const current = { ...stateRef.current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error("Failed to save batch state:", e);
    }
  };

  // Wrapped setters that save immediately
  const updateTopics = (value) => {
    setTopics(value);
    stateRef.current.topics = value;
    saveState({ topics: value });
  };
  const updateResults = (value) => {
    setResults(value);
    stateRef.current.results = value;
    saveState({ results: value });
  };
  const updateIsGenerating = (value) => {
    setIsGenerating(value);
    stateRef.current.isGenerating = value;
    saveState({ isGenerating: value });
  };
  const updateError = (value) => {
    setError(value);
    stateRef.current.error = value;
    saveState({ error: value });
  };
  const updateProgress = (value) => {
    setProgress(value);
    stateRef.current.progress = value;
    saveState({ progress: value });
  };

  const generateButtonRef = useRef(null);
  const resetButtonRef = useRef(null);

  const TITLE_TARGET = 580;
  const DESC_TARGET = 990;

  // Google SERP font settings (must match exactly):
  // Title: Arial, 18px, bold (600 weight)
  // Description: Arial, 14px, normal (400 weight) - CORRECT, leave alone
  const TITLE_FONT = "600 18px Arial, sans-serif";
  const DESC_FONT = "400 14px Arial, sans-serif";
  
  // PRECISION CALIBRATION: Our 508px → Google 506px
  // Ratio: 506/508 = 0.996, previous 1.055 * 0.996 = 1.051
  // Description is correct - no adjustment needed
  const TITLE_ADJUSTMENT = 1.051; // Matches Google's EXACT 506px measurement
  const DESC_ADJUSTMENT = 1.0; // Description is correct - leave alone

  function measurePx(text, font, adjustment) {
    if (typeof window === "undefined" || !text) return 0;
    const cleanText = text.trim();
    const canvas = measurePx.canvas || (measurePx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    const measurement = ctx.measureText(cleanText).width;
    return Math.round(measurement * adjustment);
  }

  async function generateBatch() {
    const list = topics.split("\n").map(t => t.trim()).filter(Boolean);
    if (!list.length) return;

    const button = generateButtonRef.current;
    if (button) {
      button.classList.add("button-press");
      setTimeout(() => {
        if (button) {
          button.classList.remove("button-press");
        }
      }, 200);
    }

    updateIsGenerating(true);
    updateError(null);
    updateResults([]);
    updateProgress({ current: 0, total: list.length });

    try {
      const allResults = [];
      
      // Process in smaller parallel chunks (3 at a time) for speed while avoiding rate limits
      const CHUNK_SIZE = 3;
      const chunks = [];
      for (let i = 0; i < list.length; i += CHUNK_SIZE) {
        chunks.push(list.slice(i, i + CHUNK_SIZE));
      }
      
      // Process chunks sequentially, but items within each chunk in parallel
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        
        // Process this chunk in parallel
        const chunkResults = await Promise.all(
          chunk.map(async (topic) => {
            try {
              // Use direct fetch like single generator for consistency and speed
              const res = await fetch("http://localhost:3000/generate/single", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic })
              });
              
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${await res.text()}`);
              }
              
              const data = await res.json();
              
              return {
                topic,
                title: data.title || topic,
                description: data.description || `${topic}.`,
                keywords: Array.isArray(data.keywords) 
                  ? data.keywords.join(", ") 
                  : (data.keywords || "")
              };
            } catch (err) {
              console.error(`Error generating for "${topic}":`, err);
              
              // Fallback result
              return {
                topic,
                title: topic,
                description: `${topic}.`,
                keywords: ""
              };
            }
          })
        );
        
        // Add chunk results and update UI immediately
        allResults.push(...chunkResults);
        const newProgress = { current: allResults.length, total: list.length };
        setResults([...allResults]);
        stateRef.current.results = [...allResults];
        setProgress(newProgress);
        stateRef.current.progress = newProgress;
        
        // Also save directly to localStorage (in case component unmounts)
        saveState({
          results: allResults,
          isGenerating: true,
          error: null,
          progress: newProgress
        });
      }
      
      setResults(allResults);
      stateRef.current.results = allResults;
    } catch (err) {
      console.error("Batch generation error:", err);
      let errorMessage = "Unable to generate SEO content. Please try again.";
      
      if (err.message?.includes("free limit") || err.message?.includes("5 free")) {
        errorMessage = err.message;
      } else if (err.message?.includes("401") || err.message?.includes("Not authenticated")) {
        errorMessage = "Please log in to generate SEO content.";
      } else if (err.message?.includes("403") || err.message?.includes("plan")) {
        errorMessage = "Pro plan required.";
      } else if (err.message?.includes("429") || err.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Unable to connect to server. Please try again later.";
      }
      
      setError(errorMessage);
      stateRef.current.error = errorMessage;
      // Save error state
      saveState({
        error: errorMessage,
        isGenerating: false
      });
    } finally {
      setIsGenerating(false);
      stateRef.current.isGenerating = false;
      setProgress({ current: 0, total: 0 });
      stateRef.current.progress = { current: 0, total: 0 };
      // Final save
      saveState({
        isGenerating: false,
        progress: { current: 0, total: 0 }
      });
    }
  }

  function resetBatch() {
    const button = resetButtonRef.current;
    if (button) {
      button.classList.add("button-press");
      setTimeout(() => {
        if (button) {
          button.classList.remove("button-press");
        }
      }, 200);
    }
    updateTopics("");
    updateResults([]);
    updateError(null);
    updateProgress({ current: 0, total: 0 });
    updateIsGenerating(false);
    // Clear localStorage on reset
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

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
        @keyframes copyPulse {
          0% { transform: scale(1); background-color: #22c55e; }
          50% { transform: scale(1.05); background-color: #16a34a; }
          100% { transform: scale(1); background-color: #22c55e; }
        }
        .button-press {
          animation: buttonPress 0.2s ease;
        }
        .copy-pulse {
          animation: copyPulse 0.3s ease;
        }
      `}</style>


      {/* TOPICS INPUT */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Topics (one per line):</label>
        <textarea
          value={topics}
          onChange={e => updateTopics(e.target.value)}
          placeholder="Enter one topic per line&#10;e.g.&#10;Product Name 1&#10;Product Name 2&#10;Product Name 3"
          rows={10}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            background: "#0f172a",
            border: "1px solid #1f2937",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px"
          }}
        />
      </div>

      {/* TIME ESTIMATE MESSAGE */}
      {topics.trim() && (
        <div style={{
          marginBottom: "16px",
          padding: "12px 16px",
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "8px",
          borderLeft: "4px solid #4dabff"
        }}>
          <p style={{ 
            margin: 0, 
            color: "#cbd5e1",
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            <strong style={{ color: "#60a5fa" }}>⏱️ Processing Time:</strong> Generation is working, but may take some time depending on the number of topics. 
            Estimated time: <strong style={{ color: "#22c55e" }}>~{Math.ceil(topics.split("\n").filter(t => t.trim()).length * 35)} seconds ({Math.ceil(topics.split("\n").filter(t => t.trim()).length * 35 / 60)} minutes)</strong> for {topics.split("\n").filter(t => t.trim()).length} topic{topics.split("\n").filter(t => t.trim()).length !== 1 ? 's' : ''}. 
            Please be patient - results will appear as they complete.
          </p>
        </div>
      )}

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        <button
          ref={generateButtonRef}
          disabled={isGenerating || !topics.trim()}
          onClick={generateBatch}
          style={{ 
            padding: "12px 20px", 
            borderRadius: "10px", 
            background: isGenerating ? "#64748b" : "#4dabff", 
            color: "#020617", 
            fontWeight: 700, 
            border: "none", 
            cursor: isGenerating ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            opacity: isGenerating ? 0.7 : 1,
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
            "Generate All"
          )}
        </button>

        <button
          ref={resetButtonRef}
          onClick={resetBatch}
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

        {results.length > 0 && (
          <button
            onClick={() => {
              const csv = [
                ["Topic", "Title", "Description", "Keywords"],
                ...results.map(r => [
                  r.topic || "",
                  r.title || "",
                  r.description || "",
                  Array.isArray(r.keywords) ? r.keywords.join(", ") : (r.keywords || "")
                ])
              ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `seo-batch-${new Date().getTime()}.csv`;
              document.body.appendChild(a);
              a.click();
              // Delay cleanup to avoid interfering with Next.js navigation
              setTimeout(() => {
                try {
                  if (a && a.parentNode) {
                    document.body.removeChild(a);
                  }
                } catch (e) {
                  // Ignore cleanup errors
                }
                window.URL.revokeObjectURL(url);
              }, 100);
            }}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "#22c55e",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s ease, transform 0.1s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
            onMouseOver={(e) => e.target.style.background = "#16a34a"}
            onMouseOut={(e) => e.target.style.background = "#22c55e"}
            onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            📥 Download CSV ({results.length})
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: "12px",
          background: "#7f1d1d",
          border: "1px solid #991b1b",
          borderRadius: "8px",
          color: "#fca5a5",
          marginBottom: "24px"
        }}>
          {error}
        </div>
      )}

      {/* RESULTS */}
      {results.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>
            Results ({results.length} items)
          </h2>
          
          {results.map((r, i) => {
            const titlePx = measurePx(r.title || "", TITLE_FONT, TITLE_ADJUSTMENT);
            const descPx = measurePx(r.description || "", DESC_FONT, DESC_ADJUSTMENT);
            const keywords = Array.isArray(r.keywords) ? r.keywords.join(", ") : (r.keywords || "");
            
            return (
              <div
                key={i}
                style={{
                  marginBottom: "32px",
                  padding: "24px",
                  background: "#0f172a",
                  border: "1px solid #1f2937",
                  borderRadius: "12px"
                }}
              >
                {/* TOPIC */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#9ca3af" }}>
                    Topic:
                  </label>
                  <div style={{
                    padding: "12px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontWeight: 600
                  }}>
                    {r.topic}
                  </div>
                </div>

                {/* TITLE */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px" }}>SEO Title:</label>
                  <input
                    value={r.title || ""}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      border: "1px solid #1f2937",
                      color: "#fff",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400
                    }}
                  />
                  <div style={{ fontSize: "16px", marginTop: "6px", textAlign: "left", color: titlePx > TITLE_TARGET ? "#ef4444" : "#22c55e" }}>
                    {titlePx} / 580 px
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px" }}>Meta Description:</label>
                  <textarea
                    value={r.description || ""}
                    readOnly
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      border: "1px solid #1f2937",
                      color: "#fff",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "1.5"
                    }}
                  />
                  <div style={{ fontSize: "16px", marginTop: "6px", textAlign: "left", color: descPx > DESC_TARGET ? "#ef4444" : "#22c55e" }}>
                    {descPx} / 990 px
                  </div>
                </div>

                {/* KEYWORDS */}
                {keywords && (
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Keywords:</label>
                    <textarea
                      value={keywords}
                      readOnly
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "#0f172a",
                        border: "1px solid #1f2937",
                        color: "#fff",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "1.5",
                        resize: "vertical",
                        overflowWrap: "break-word",
                        wordWrap: "break-word"
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
