"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { getToken } from "../lib/authClient";
import Link from "next/link";

const STORAGE_KEY = "seo_generator_single_state";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LandingPage() {
  // Initialize with empty state (server-side safe)
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [url, setUrl] = useState("www.example.com");
  const [freeUsageRemaining, setFreeUsageRemaining] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
        .then(res => res.json())
        .then(data => {
          setFreeUsageRemaining(data.freeUsageRemaining);
        })
        .catch(err => console.error("Failed to check free usage:", err));
    }
  }, []);
  
  // Use ref to track latest state for saving
  const stateRef = useRef({ topic, title, description, keywords, url });
  
  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = { topic, title, description, keywords, url };
  }, [topic, title, description, keywords, url]);
  
  // Helper to save state immediately
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Wrapped setter for isGenerating that also saves
  const updateIsGenerating = (value) => {
    setIsGenerating(value);
    saveState({ isGenerating: value });
  };
  
  const generateButtonRef = useRef(null);
  const previewTitleRef = useRef(null);
  const previewUrlRef = useRef(null);
  const previewDescRef = useRef(null);

  const TITLE_TARGET = 580;
  const DESC_TARGET = 990;
  const TITLE_FONT = "600 18px Arial, sans-serif";
  const DESC_FONT = "400 14px Arial, sans-serif";
  const TITLE_ADJUSTMENT = 1.027;
  const DESC_ADJUSTMENT = 1.0;

  function measurePx(text, font, adjustment) {
    if (typeof window === "undefined" || !text) return 0;
    const cleanText = text.trim();
    const canvas = measurePx.canvas || (measurePx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    const measurement = ctx.measureText(cleanText).width;
    return Math.round(measurement * adjustment);
  }

  useLayoutEffect(() => {
    setTitlePx(measurePx(title, TITLE_FONT, TITLE_ADJUSTMENT));
    setDescPx(measurePx(description, DESC_FONT, DESC_ADJUSTMENT));
    
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

  const handleGenerate = () => {
    if (isGenerating || !topic.trim()) return;
    
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

      updateTitle(t);
      updateDescription(d);
      updateKeywords(k);
      updateIsGenerating(false);
      saveState({ title: t, description: d, keywords: k, isGenerating: false });
    })
    .catch(err => {
      console.error("Generation error:", err);
      alert(err.message || "Failed to generate SEO content. Please try again.");
      updateIsGenerating(false);
      saveState({ isGenerating: false });
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      padding: "0px 20px",
      paddingTop: "0px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <style>{`
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

      {/* Logo - Big and Dominant */}
      <div style={{ 
        marginBottom: "0px",
        textAlign: "center",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: "-20px"
      }}>
        <img 
          src="/logo.png" 
          alt="MySEOGenerator" 
          style={{ 
            height: "675px",
            maxWidth: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 20px rgba(96, 165, 250, 0.3))"
          }} 
        />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: "48px",
        fontWeight: "700",
        marginBottom: "16px",
        marginTop: "-40px",
        textAlign: "center",
        background: "linear-gradient(135deg, #60a5fa 0%, #34d399 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textShadow: "0 2px 20px rgba(96, 165, 250, 0.3)",
        lineHeight: "1.2"
      }}>
        SERP Snippet Optimization Tool
      </h1>

      <p style={{
        fontSize: "20px",
        color: "#cbd5e1",
        textAlign: "center",
        marginBottom: "40px",
        maxWidth: "700px",
        lineHeight: "1.6"
      }}>
        Generate pixel-perfect SEO titles, descriptions, and keywords that match Google's exact specifications
      </p>

      {/* Try It Free Banner */}
      {!isAuthenticated && (
        <div style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          padding: "16px 32px",
          borderRadius: "12px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <span style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#ffffff"
          }}>
            🎉 Try It Free - {freeUsageRemaining !== null ? `${freeUsageRemaining} free generates remaining` : "5 free generates available"}
          </span>
          <Link href="/login" style={{
            padding: "10px 24px",
            background: "transparent",
            border: "2px solid #ffffff",
            color: "#ffffff",
            borderRadius: "8px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.background = "transparent";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          }}
          >
            Sign In
          </Link>
          <Link href="/register" style={{
            padding: "10px 24px",
            background: "#ffffff",
            color: "#3b82f6",
            borderRadius: "8px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          }}
          >
            Sign Up
          </Link>
        </div>
      )}

      {/* Single Generator Card */}
      <div style={{
        maxWidth: "900px",
        width: "100%",
        background: "rgba(15, 23, 42, 0.95)",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        backdropFilter: "blur(20px)",
        marginBottom: "40px"
      }}>
        {/* Topic Input */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#ffffff"
          }}>
            Enter Your Topic:
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => updateTopic(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !isGenerating && topic.trim()) {
                handleGenerate();
              }
            }}
            placeholder="e.g., winter boots, blog post about SEO, product name..."
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "8px",
              background: "#0f172a",
              border: "1px solid #1f2937",
              color: "#fff",
              fontSize: "18px",
              fontFamily: "Arial, sans-serif",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Generate Button */}
        <button
          ref={generateButtonRef}
          disabled={isGenerating || !topic.trim()}
          onClick={handleGenerate}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "8px",
            background: isGenerating || !topic.trim() 
              ? "#374151" 
              : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            color: "#fff",
            fontWeight: "600",
            border: "none",
            cursor: isGenerating || !topic.trim() ? "not-allowed" : "pointer",
            fontSize: "18px",
            transition: "all 0.2s ease",
            boxShadow: isGenerating || !topic.trim() 
              ? "none" 
              : "0 4px 16px rgba(59, 130, 246, 0.4)",
            marginBottom: "32px",
            boxSizing: "border-box"
          }}
          onMouseOver={(e) => {
            if (!isGenerating && topic.trim()) {
              e.target.style.transform = "scale(1.02)";
              e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = isGenerating || !topic.trim() 
              ? "none" 
              : "0 4px 16px rgba(59, 130, 246, 0.4)";
          }}
        >
          {isGenerating ? "Generating SEO Content..." : "Generate SEO Content"}
        </button>

        {/* Reset Button */}
        {(title || description || keywords || topic) && (
          <button
            onClick={() => {
              updateTopic("");
              updateTitle("");
              updateDescription("");
              updateKeywords("");
              updateUrl("www.example.com");
              saveState({ topic: "", title: "", description: "", keywords: "", url: "www.example.com" });
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid #22c55e",
              color: "#22c55e",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s ease",
              marginBottom: "32px"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(34, 197, 94, 0.1)";
              e.target.style.borderColor = "#16a34a";
              e.target.style.color = "#16a34a";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "#22c55e";
              e.target.style.color = "#22c55e";
            }}
          >
            Reset
          </button>
        )}

        {/* Results */}
        {(title || description || keywords) && (
          <>
            {/* SEO Title */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff"
              }}>
                SEO Title:
                <span style={{
                  marginLeft: "12px",
                  fontSize: "14px",
                  fontWeight: "400",
                  color: titlePx <= TITLE_TARGET ? "#22c55e" : "#ef4444"
                }}>
                  {titlePx}px / {TITLE_TARGET}px
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => updateTitle(e.target.value)}
                placeholder="SEO title will appear here..."
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: `1px solid ${titlePx <= TITLE_TARGET ? "#22c55e" : "#ef4444"}`,
                  color: "#fff",
                  fontSize: "18px",
                  fontFamily: "Arial, sans-serif",
                  boxSizing: "border-box"
                }}
              />
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
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                >
                  {titleCopied ? "✓ Copied!" : "Copy Title"}
                </button>
              )}
            </div>

            {/* Meta Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff"
              }}>
                Meta Description:
                <span style={{
                  marginLeft: "12px",
                  fontSize: "14px",
                  fontWeight: "400",
                  color: descPx <= DESC_TARGET ? "#22c55e" : "#ef4444"
                }}>
                  {descPx}px / {DESC_TARGET}px
                </span>
              </label>
              <textarea
                value={description}
                onChange={e => updateDescription(e.target.value)}
                placeholder="Meta description will appear here..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: `1px solid ${descPx <= DESC_TARGET ? "#22c55e" : "#ef4444"}`,
                  color: "#fff",
                  fontSize: "18px",
                  fontFamily: "Arial, sans-serif",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />
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
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                >
                  {descCopied ? "✓ Copied!" : "Copy Description"}
                </button>
              )}
            </div>

            {/* Keywords */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff"
              }}>
                Keywords:
              </label>
              <textarea
                value={keywords}
                onChange={e => updateKeywords(e.target.value)}
                placeholder="Keywords will appear here..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "1px solid #22c55e",
                  color: "#fff",
                  fontSize: "18px",
                  fontFamily: "Arial, sans-serif",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />
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
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                >
                  {keywordsCopied ? "✓ Copied!" : "Copy Keywords"}
                </button>
              )}
            </div>

            {/* Google SERP Preview */}
            {(title || description) && (
              <div style={{ marginTop: "32px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#ffffff"
                }}>
                  Google SERP Preview:
                </label>
                <div style={{
                  padding: "20px",
                  background: "rgba(15, 18, 35, 0.7)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  maxWidth: "1030px",
                  width: "100%",
                  backdropFilter: "blur(14px)",
                  boxSizing: "border-box"
                }}>
                  {/* Title */}
                  <div style={{
                    width: "100%",
                    maxWidth: "580px",
                    overflow: "hidden",
                    marginBottom: "3px"
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
                  
                  {/* URL */}
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
                  
                  {/* Description */}
                  <div style={{
                    width: "100%",
                    maxWidth: "990px",
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
                        e.target.style.WebkitLineClamp = "unset";
                        e.target.style.maxHeight = "none";
                      }}
                      onBlur={(e) => {
                        const newDesc = e.target.textContent.trim();
                        if (newDesc !== description) {
                          updateDescription(newDesc);
                        }
                        e.target.style.borderBottomColor = "transparent";
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
                        width: "100%",
                        maxWidth: "990px",
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
          </>
        )}

        {/* CTA to Dashboard - Only show if authenticated */}
        {isAuthenticated && (
          <div style={{
            marginTop: "40px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(59, 130, 246, 0.2)",
            textAlign: "center"
          }}>
            <p style={{
              color: "#cbd5e1",
              marginBottom: "16px",
              fontSize: "16px"
            }}>
              Want more features? Access batch generation, CSV uploads, and more!
            </p>
            <Link href="/dashboard" style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: "600",
              textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.4)";
            }}
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
