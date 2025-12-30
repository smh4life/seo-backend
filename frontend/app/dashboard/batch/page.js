"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/authClient";
import { hasPlanAccess } from "../../../lib/userPlan";
import BatchGeneratorCard from "./BatchGeneratorCard";
import TrainingPanel from "../../../components/TrainingPanel";

export default function BatchPage() {
  const [showTraining, setShowTraining] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    
    if (!hasPlanAccess("batch")) {
      router.push("/dashboard/billing");
      return;
    }
  }, [router]);

  return (
    <>
    <div style={{ 
      width: "100%",
      maxWidth: showTraining ? "calc(100% - 360px)" : "100%",
      marginRight: showTraining ? "360px" : "0",
      transition: "margin-right 0.3s ease, max-width 0.3s ease",
      overflow: "visible"
    }}>
      {/* Header with Title and Button */}
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
          <h1 style={{ fontSize: "32px", marginBottom: "16px", marginTop: 0 }}>Batch Generator</h1>
          <p style={{ color: "#9ca3af", marginBottom: "32px", marginTop: 0 }}>Generate SEO metadata for multiple pages at once.</p>
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
      <BatchGeneratorCard />
    </div>
    {showTraining && <TrainingPanel type="batch" />}
    </>
  );
}
