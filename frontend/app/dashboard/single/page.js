"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { getToken } from "../../../lib/authClient";
import Link from "next/link";
import TrainingPanel from "../../../components/TrainingPanel";

import { getApiBase } from "../../../lib/getApiBase";

const STORAGE_KEY = "seo_generator_single_state";
const API_BASE = getApiBase();

export default function SingleGeneratorPage() {
  // Initialize with empty state (server-side safe)
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [url, setUrl] = useState("www.example.com");
  const [freeUsageRemaining, setFreeUsageRemaining] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check authentication and free usage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const token = getToken();
    setIsAuthenticated(!!token);
    
    // Load state from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loaded = JSON.parse(saved);
        setTopic(loaded.topic || "");
        setTitle(loaded.title || "");
        setDescription(loaded.description || "");
        setKeywords(loaded.keywords || "");
        setUrl(loaded.url || "www.example.com");
        setIsGenerating(loaded.isGenerating || false);
      }
    } catch (e) {
      console.error("Failed to load state:", e);
    }
    
    // Check free usage if not authenticated
    if (!token) {
      fetch(`${API_BASE}/usage/free`, {
        credentials: "include"
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then(data => {
          setFreeUsageRemaining(data.freeUsageRemaining);
        })
        .catch(err => {
          console.error("Failed to check free usage:", err);
          // Don't crash the page - just set to null
          setFreeUsageRemaining(null);
        });
    }
  }, []); // Only run once on mount
  
  // Use ref to track latest state for saving
  const stateRef = useRef({ topic, title, description, keywords, url });
  
  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = { topic, title, description, keywords, url };
  }, [topic, title, description, keywords, url]);
  
  // Helper to save state immediately (uses ref to get latest values)
  const saveState = (updates) => {
    if (typeof window === "undefined") return;
    try {
      const current = { ...stateRef.current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  };

  // Wrapped setters that save immediately
  const updateTopic = (value) => {
    setTopic(value);
    stateRef.current.topic = value;
    saveState({ topic: value });
  };
  const updateTitle = (value) => {
    setTitle(value);
    stateRef.current.title = value;
    saveState({ title: value });
  };
  const updateDescription = (value) => {
    setDescription(value);
    stateRef.current.description = value;
    saveState({ description: value });
  };
  const updateKeywords = (value) => {
    setKeywords(value);
    stateRef.current.keywords = value;
    saveState({ keywords: value });
  };
  const updateUrl = (value) => {
    setUrl(value);
    stateRef.current.url = value;
    saveState({ url: value });
  };

  const [titlePx, setTitlePx] = useState(0);
  const [descPx, setDescPx] = useState(0);
  
  const [titleCopied, setTitleCopied] = useState(false);
  const [descCopied, setDescCopied] = useState(false);
  const [keywordsCopied, setKeywordsCopied] = useState(false);
  
  // Wrapped setter for isGenerating that also saves
  const updateIsGenerating = (value) => {
    setIsGenerating(value);
    saveState({ isGenerating: value });
  };
  
  const generateButtonRef = useRef(null);
  const resetButtonRef = useRef(null);
  const previewTitleRef = useRef(null);
  const previewUrlRef = useRef(null);
  const previewDescRef = useRef(null);

  const TITLE_TARGET = 580;
  const DESC_TARGET = 990;
  const TOLERANCE = 4;

  // Google SERP font settings (must match exactly):
  // Title: Arial, 18px, bold (600 weight)
  // Description: Arial, 14px, normal (400 weight) - CORRECT, leave alone
  const TITLE_FONT = "600 18px Arial, sans-serif";
  const DESC_FONT = "400 14px Arial, sans-serif";
  
  // FINAL CALIBRATION: Google shows 467px, frontend was showing 478px with 1.051
  // Base canvas: 478 / 1.051 = 454.8px
  // To get 467px: 467 / 454.8 = 1.027
  const TITLE_ADJUSTMENT = 1.027; // Calibrated to match Google's 467px (was 478px with 1.051)
  const DESC_ADJUSTMENT = 1.0; // Description is correct - leave alone

  function measurePx(text, font, adjustment) {
    if (typeof window === "undefined" || !text) return 0;
    const cleanText = text.trim();
    const canvas = measurePx.canvas || (measurePx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    const measurement = ctx.measureText(cleanText).width;
    // Direct measurement - no adjustment multiplier
    return Math.round(measurement * adjustment);
  }

  useLayoutEffect(() => {
    setTitlePx(measurePx(title, TITLE_FONT, TITLE_ADJUSTMENT));
    setDescPx(measurePx(description, DESC_FONT, DESC_ADJUSTMENT));
    
    // Update preview contentEditable elements when state changes (only if not focused)
    if (previewTitleRef.current && document.activeElement !== previewTitleRef.current) {
      previewTitleRef.current.textContent = title || "Enter title here";
    }
    if (previewUrlRef.current && document.activeElement !== previewUrlRef.current) {
      previewUrlRef.current.textContent = url || "www.example.com";
    }
    if (previewDescRef.current && document.activeElement !== previewDescRef.current) {
      previewDescRef.current.textContent = description || "Enter description here";
    }
  }, [title, description, url]);

  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
    <div style={{ 
      maxWidth: "900px",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      padding: "20px",
      marginRight: showTraining ? "360px" : "0",
      transition: "margin-right 0.3s ease"
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
      <div style={{ 
        marginBottom: "16px", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        justifyContent: "space-between"
      }}>
        <div>
          <h1 style={{ fontSize: "32px", marginBottom: "16px", marginTop: 0 }}>Single Generator</h1>
          <p style={{ color: "#9ca3af", marginBottom: "32px", marginTop: 0 }}>Generate SEO metadata for a single page.</p>
        </div>
        <button
          onClick={() => setShowTraining(!showTraining)}
          style={{
            padding: "8px 16px",
            backgroundColor: showTraining ? "#3b82f6" : "#1f2937",
            color: "#ffffff",
            border: "1px solid #3b82f6",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s",
            height: "fit-content",
            position: "relative",
            zIndex: 999
          }}
          onMouseOver={(e) => {
            if (!showTraining) {
              e.target.style.backgroundColor = "#374151";
            }
          }}
          onMouseOut={(e) => {
            if (!showTraining) {
              e.target.style.backgroundColor = "#1f2937";
            }
          }}
        >
          {showTraining ? "Hide Training Mode" : "Show Training Mode"}
        </button>
      </div>
      
      {/* Free Usage Display */}
      {!isAuthenticated && freeUsageRemaining !== null && (
        <div style={{
          marginBottom: "24px",
          padding: "16px",
          background: freeUsageRemaining === 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
          border: `1px solid ${freeUsageRemaining === 0 ? "#ef4444" : "#22c55e"}`,
          borderRadius: "8px",
          color: "#e2e8f0"
        }}>
          {freeUsageRemaining === 0 ? (
            <div>
              <p style={{ margin: "0 0 12px 0", fontWeight: 600, color: "#ef4444" }}>
                ⚠️ You've used all 5 free generates!
              </p>
              <p style={{ margin: "0 0 12px 0" }}>
                Sign up for unlimited access to all generators.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/register" style={{
                  padding: "10px 20px",
                  background: "#60a5fa",
                  color: "#0f172a",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-block"
                }}>
                  Sign Up Free
                </Link>
                <Link href="/login" style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: "#60a5fa",
                  border: "1px solid #60a5fa",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-block"
                }}>
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0 }}>
              <strong>{freeUsageRemaining}</strong> of <strong>5</strong> free generates remaining.{" "}
              <Link href="/register" style={{ color: "#60a5fa", textDecoration: "underline" }}>
                Sign up
              </Link> for unlimited access.
            </p>
          )}
        </div>
      )}

      {/* TOPIC */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Topic:</label>
        <input
          value={topic}
          onChange={e => updateTopic(e.target.value)}
          placeholder="e.g. Best hiking boots for beginners:"
          style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #1f2937", color: "#fff" }}
        />
      </div>

      {/* TITLE */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>SEO Title:</label>
        <input
          value={title}
          onChange={e => updateTitle(e.target.value)}
          placeholder="SEO Title will Display here:"
          style={{
            width: "100%", padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #1f2937", color: "#fff",
            fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: 400
          }}
        />
        {/* Pixel counter moved to the left side */}
        <div style={{ fontSize: "16px", marginTop: "6px", textAlign: "left", color: titlePx > TITLE_TARGET ? "#ef4444" : "#22c55e" }}>
          {titlePx} / 580 px
        </div>
        {/* Copy button */}
        {title && (
          <button
            onClick={() => copyToClipboard(title, setTitleCopied)}
            className={titleCopied ? "copy-pulse" : ""}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "6px",
              background: titleCopied ? "#16a34a" : "#22c55e",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxShadow: titleCopied ? "0 0 10px rgba(34, 197, 94, 0.5)" : "none"
            }}
          >
            {titleCopied ? "✓ Copied!" : "Copy Title"}
          </button>
        )}
      </div>

      {/* DESCRIPTION */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Meta Description:</label>
        <textarea
          value={description}
          onChange={e => updateDescription(e.target.value)}
          placeholder="Meta Description will Display here:"
          rows={4}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #1f2937", color: "#fff",
            fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: "1.5"
          }}
        />
        {/* Pixel counter moved to the left side */}
        <div style={{ fontSize: "16px", marginTop: "6px", textAlign: "left", color: descPx > DESC_TARGET ? "#ef4444" : "#22c55e" }}>
          {descPx} / 990 px
        </div>
        {/* Copy button */}
        {description && (
          <button
            onClick={() => copyToClipboard(description, setDescCopied)}
            className={descCopied ? "copy-pulse" : ""}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "6px",
              background: descCopied ? "#16a34a" : "#22c55e",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxShadow: descCopied ? "0 0 10px rgba(34, 197, 94, 0.5)" : "none"
            }}
          >
            {descCopied ? "✓ Copied!" : "Copy Description"}
          </button>
        )}
      </div>

      {/* KEYWORDS */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Keywords:</label>
        <textarea
          value={keywords}
          onChange={e => updateKeywords(e.target.value)}
          placeholder="keyword1, keyword2, keyword3..."
          rows={3}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #1f2937", color: "#fff",
            fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: "1.5",
            resize: "vertical", overflowWrap: "break-word", wordWrap: "break-word"
          }}
        />
        {/* Copy button */}
        {keywords && (
          <button
            onClick={() => copyToClipboard(keywords, setKeywordsCopied)}
            className={keywordsCopied ? "copy-pulse" : ""}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "6px",
              background: keywordsCopied ? "#16a34a" : "#22c55e",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxShadow: keywordsCopied ? "0 0 10px rgba(34, 197, 94, 0.5)" : "none"
            }}
          >
            {keywordsCopied ? "✓ Copied!" : "Copy Keywords"}
          </button>
        )}
      </div>

      {/* PREVIEW SNIPPET */}
      {(title || description) && (
        <div style={{ marginBottom: "24px", marginTop: "32px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>
            Google SERP Preview:
          </label>
          <div style={{
            padding: "20px",
            background: "rgba(15, 18, 35, 0.7)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            width: "1030px",
            maxWidth: "100%",
            backdropFilter: "blur(14px)",
            boxSizing: "border-box",
            overflow: "hidden"
          }}>
            {/* Title - Editable with clipping */}
            <div style={{
              width: "580px",
              overflow: "hidden",
              marginBottom: "3px",
              position: "relative"
            }}>
              <div
                ref={previewTitleRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={(e) => {
                  e.target.style.borderBottomColor = "#60a5fa";
                }}
                onBlur={(e) => {
                  const newTitle = e.target.textContent.trim();
                  if (newTitle !== title) {
                    updateTitle(newTitle);
                  }
                  e.target.style.borderBottomColor = "transparent";
                }}
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: "Arial, sans-serif",
                  color: "#60a5fa",
                  lineHeight: "1.3",
                  cursor: "text",
                  outline: "none",
                  minHeight: "26px",
                  padding: "2px 0",
                  borderBottom: "1px solid transparent",
                  transition: "border-color 0.2s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "clip",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                {title || "Enter title here"}
              </div>
            </div>
            
            {/* URL - Editable */}
            <div
              ref={previewUrlRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={(e) => {
                e.target.style.borderBottomColor = "#34d399";
              }}
              onBlur={(e) => {
                    const newUrl = e.target.textContent.trim();
                    if (newUrl !== url) {
                      updateUrl(newUrl);
                    }
                e.target.style.borderBottomColor = "transparent";
              }}
              style={{
                fontSize: "14px",
                fontFamily: "Arial, sans-serif",
                color: "#34d399",
                lineHeight: "1.3",
                marginBottom: "3px",
                cursor: "text",
                outline: "none",
                minHeight: "20px",
                padding: "2px 0",
                borderBottom: "1px solid transparent",
                transition: "border-color 0.2s"
              }}
            >
              {url || "www.example.com"}
            </div>
            
            {/* Description - Editable with clipping (Google-style ellipsis) */}
            <div style={{
              width: "990px",
              maxWidth: "100%",
              overflow: "hidden",
              marginTop: "3px",
              boxSizing: "border-box"
            }}>
              <div
                ref={previewDescRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={(e) => {
                  e.target.style.borderBottomColor = "#cbd5e1";
                  // Remove clamp when editing so user can see full text
                  e.target.style.WebkitLineClamp = "unset";
                  e.target.style.maxHeight = "none";
                }}
                onBlur={(e) => {
                  const newDesc = e.target.textContent.trim();
                  if (newDesc !== description) {
                    updateDescription(newDesc);
                  }
                  e.target.style.borderBottomColor = "transparent";
                  // Restore clamp when not editing
                  e.target.style.WebkitLineClamp = "2";
                  e.target.style.maxHeight = "calc(14px * 1.58 * 2)";
                }}
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  fontFamily: "Arial, sans-serif",
                  color: "#cbd5e1",
                  lineHeight: "1.58",
                  cursor: "text",
                  outline: "none",
                  minHeight: "44px",
                  padding: "2px 0",
                  borderBottom: "1px solid transparent",
                  transition: "border-color 0.2s",
                  width: "990px",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxSizing: "border-box",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  marginTop: "3px",
                  maxHeight: "calc(14px * 1.58 * 2)"
                }}
              >
                {description || "Enter description here"}
              </div>
            </div>
          </div>
          <p style={{ 
            fontSize: "12px", 
            color: "#9ca3af", 
            marginTop: "8px",
            fontStyle: "italic"
          }}>
            Click on any field to edit. Changes will update the fields above.
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          ref={generateButtonRef}
          disabled={isGenerating || !topic.trim()}
          onClick={(e) => {
            if (isGenerating || !topic.trim()) return;
            
            const button = generateButtonRef.current || e.currentTarget;
            if (button) {
              button.classList.add("button-press");
              setTimeout(() => {
                if (button) {
                  button.classList.remove("button-press");
                }
              }, 200);
            }
            
            updateIsGenerating(true);
            // Save topic when starting generation
            saveState({ topic, isGenerating: true });
            
            const token = getToken();
            fetch(`${API_BASE}/generate/single`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` })
              },
              credentials: "include",
              body: JSON.stringify({ topic })
            })
            .then(res => {
              if (!res.ok) {
                return res.json().then(errData => {
                  // Check if it's a free usage limit error
                  if (errData.error === "Free limit reached" || res.status === 403) {
                    setFreeUsageRemaining(0);
                    throw new Error(errData.message || "You've used all 5 free generates. Please sign up for unlimited access.");
                  }
                  throw new Error(errData.error || errData.message || `HTTP ${res.status}`);
                });
              }
              return res.json();
            })
            .then(data => {
              // Update free usage remaining if provided
              if (data.freeUsageRemaining !== undefined) {
                setFreeUsageRemaining(data.freeUsageRemaining);
              }
              if (!data || (!data.title && !data.description)) {
                throw new Error("Invalid response from server");
              }
              let t = (data.title || "").trim();
              let d = (data.description || "").trim();
              let k = Array.isArray(data.keywords) 
                ? data.keywords.join(", ") 
                : (data.keywords || "");

              const autoTune = (text, target, font, adj, isTitle) => {
                let current = text.trim();
                let width = measurePx(current, font, adj);
                
                // If it fits, just ensure punctuation
                if (width <= target) {
                  if (!/[.!?]$/.test(current)) {
                    const withPeriod = current + ".";
                    if (measurePx(withPeriod, font, adj) <= target) {
                      current = withPeriod;
                    }
                  }
                  return current;
                }
                
                // If too long, trim at word boundaries
                // First try to find complete sentences
                const sentences = current.match(/[^.!?]+[.!?]+/g) || [];
                if (sentences.length > 0) {
                  let result = "";
                  for (const sentence of sentences) {
                    const testText = result + (result ? " " : "") + sentence.trim();
                    const testPx = measurePx(testText, font, adj);
                    if (testPx <= target) {
                      result = testText;
                    } else {
                      break;
                    }
                  }
                  if (result) {
                    if (!/[.!?]$/.test(result)) {
                      result = result + ".";
                    }
                    return result;
                  }
                }
                
                // If no sentences or all too long, trim word by word
                const words = current.split(/\s+/);
                if (words.length === 0) return current;
                
                current = words[0];
                width = measurePx(current, font, adj);
                
                for (let i = 1; i < words.length; i++) {
                  const testText = current + " " + words[i];
                  const testPx = measurePx(testText, font, adj);
                  if (testPx <= target) {
                    current = testText;
                    width = testPx;
                  } else {
                    break;
                  }
                }
                
                // Ensure it ends with punctuation
                if (!/[.!?]$/.test(current)) {
                  const withPeriod = current + ".";
                  if (measurePx(withPeriod, font, adj) <= target) {
                    current = withPeriod;
                  } else {
                    // Remove last word and add period
                    const currentWords = current.split(/\s+/);
                    if (currentWords.length > 1) {
                      currentWords.pop();
                      current = currentWords.join(" ") + ".";
                      // If still too long, keep removing words
                      while (currentWords.length > 0 && measurePx(current, font, adj) > target) {
                        currentWords.pop();
                        current = currentWords.join(" ") + ".";
                      }
                    } else {
                      current = current + ".";
                    }
                  }
                }
                
                return current;
              };

              const finalTitle = autoTune(t, TITLE_TARGET, TITLE_FONT, TITLE_ADJUSTMENT, true);
              const finalDesc = autoTune(d, DESC_TARGET, DESC_FONT, DESC_ADJUSTMENT, false);
              
              // Update state
              updateTitle(finalTitle);
              updateDescription(finalDesc);
              updateKeywords(k);
              
              // Also save directly to localStorage (in case component unmounts)
              saveState({
                topic,
                title: finalTitle,
                description: finalDesc,
                keywords: k,
                isGenerating: false
              });
            })
            .catch(err => {
              console.error("Generation error:", err);
              // Save error state
              saveState({ isGenerating: false });
              let errorMessage = "Unable to generate SEO content. Please try again.";
              if (err.message?.includes("free limit") || err.message?.includes("5 free")) {
                errorMessage = err.message;
              } else if (err.message?.includes("401") || err.message?.includes("Not authenticated")) {
                errorMessage = "Please log in to generate SEO content.";
              } else if (err.message?.includes("403") || err.message?.includes("plan")) {
                errorMessage = "Pro plan required.";
              } else if (err.message?.includes("429") || err.message?.includes("rate limit")) {
                errorMessage = "Too many requests. Please wait a moment and try again.";
              }
              alert(errorMessage);
            })
            .finally(() => {
              updateIsGenerating(false);
            });
          }}
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
              Generating...
            </span>
          ) : (
            "Generate SEO"
          )}
        </button>

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
                 updateTopic(""); 
                 updateTitle(""); 
                 updateDescription(""); 
                 updateKeywords("");
                 updateUrl("www.example.com");
                 setTitleCopied(false);
                 setDescCopied(false);
                 setKeywordsCopied(false);
                 // Clear localStorage on reset
                 if (typeof window !== "undefined") {
                   localStorage.removeItem(STORAGE_KEY);
                 }
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
    </div>
    {showTraining && <TrainingPanel type="single" />}
    </>
  );
}