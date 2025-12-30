"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/authClient";
import { hasPlanAccess } from "../../../lib/userPlan";
import DistributorCard from "./DistributorCard";
import TemplateCard from "./TemplateCard";
import SeoProGeneratorCard from "./SeoProGeneratorCard";
import TrainingPanel from "../../../components/TrainingPanel";

export default function SeoProPage() {
  const [showManagement, setShowManagement] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const generatorRef = useRef(null);
  const router = useRouter();
  
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    
    if (!hasPlanAccess("seoPro")) {
      router.push("/dashboard/billing");
      return;
    }
  }, [router]);

  const handleDistributorAdded = () => {
    // Refresh distributor list in generator
    if (generatorRef.current && generatorRef.current.refreshDistributors) {
      generatorRef.current.refreshDistributors();
    }
  };

  return (
    <>
    <div style={{ 
      width: "100%", 
      minWidth: 0, 
      maxWidth: showTraining ? "calc(100% - 360px)" : "100%",
      overflow: "visible",
      marginRight: showTraining ? "360px" : "0",
      transition: "margin-right 0.3s ease, max-width 0.3s ease"
    }}>
      {/* Header with Title and Buttons */}
      <div style={{ 
        marginBottom: "16px", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        justifyContent: "space-between",
        position: "relative",
        zIndex: 999,
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px"
      }}>
        <div>
          <h1 style={{ fontSize: "32px", marginBottom: "16px", marginTop: 0 }}>SEO-Pro Generator</h1>
          <p style={{ color: "#9ca3af", marginBottom: "32px", marginTop: 0 }}>Upload CSV files and generate SEO metadata for multiple products at once.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative", zIndex: 999 }}>
          <button
            onClick={() => setShowManagement(!showManagement)}
            style={{
              padding: "8px 16px",
              backgroundColor: showManagement ? "#3b82f6" : "#1f2937",
              color: "#ffffff",
              border: "1px solid #3b82f6",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              height: "fit-content",
              minWidth: "fit-content",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              if (!showManagement) {
                e.target.style.backgroundColor = "#374151";
              }
            }}
            onMouseOut={(e) => {
              if (!showManagement) {
                e.target.style.backgroundColor = "#1f2937";
              }
            }}
          >
            {showManagement ? "Hide Management" : "Show Management"}
          </button>
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
              minWidth: "fit-content",
              whiteSpace: "nowrap",
              flexShrink: 0
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
      </div>

      {/* Main SEO-Pro Generator */}
      <SeoProGeneratorCard ref={generatorRef} />

      {/* Management Cards (Collapsible) */}
      {showManagement && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "24px", 
          marginTop: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px"
        }}>
          <DistributorCard onDistributorAdded={handleDistributorAdded} />
          <TemplateCard />
        </div>
      )}
    </div>
    {showTraining && <TrainingPanel type="seo-pro" />}
    </>
  );
}
