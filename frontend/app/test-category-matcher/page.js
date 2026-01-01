"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryMatcherTest from "./CategoryMatcherTest";
import TrainingPanel from "../../components/TrainingPanel";
import { getToken } from "../../lib/authClient";
import { hasPlanAccess } from "../../lib/userPlan";

export default function TestCategoryMatcherPage() {
  const [showTraining, setShowTraining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      
      if (!hasPlanAccess("categoryMatcher")) {
        router.push("/dashboard/billing");
        return;
      }
    } catch (error) {
      console.error("Category Matcher page error:", error);
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050816 0%, #0b0f2a 55%, #1a0b3d 100%)",
        padding: "20px",
        width: "100%",
        maxWidth: showTraining ? "calc(100% - 360px)" : "100%",
        marginRight: showTraining ? "360px" : "0",
        transition: "margin-right 0.3s ease, max-width 0.3s ease"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px"
          }}>
            <div>
              <h1 style={{
                color: "#ffffff",
                fontSize: "32px",
                marginBottom: "8px",
                marginTop: 0
              }}>
                Category Matcher
              </h1>
              <p style={{
                color: "#9ca3af",
                marginBottom: "32px",
                marginTop: 0
              }}>
                Automatically match products from distributor CSVs to your custom category structure
              </p>
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
          <CategoryMatcherTest />
        </div>
      </div>
      {showTraining && <TrainingPanel type="category-matcher" />}
    </>
  );
}

