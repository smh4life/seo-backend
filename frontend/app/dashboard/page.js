"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/authClient";
import { hasPlanAccess, getUserPlanFromToken } from "../../lib/userPlan";
import Link from "next/link";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = getToken();
      setIsAuthenticated(!!token);
      if (token) {
        setUserPlan(getUserPlanFromToken());
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      // Don't crash - just set defaults
      setIsAuthenticated(false);
      setUserPlan("free");
    }
  }, []);

  return (
    <div style={{ 
      maxWidth: "1100px",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "calc(100vh - 79px - 48px)",
      padding: "20px"
    }}>
      {/* INTRO */}
      <section style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "12px", paddingLeft: "20px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "18px", color: "#cbd5f5", lineHeight: 1.6, paddingLeft: "20px" }}>
          This dashboard is your control center for generating SEO metadata.
          Choose a tool below to create optimized titles, descriptions, and
          structured data based on your content type and scale.
        </p>
        {!isAuthenticated && (
          <div style={{
            marginTop: "24px",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "600px",
            padding: "14px 20px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            color: "#e2e8f0",
            textAlign: "center"
          }}>
            <p style={{ margin: 0 }}>
              <strong>Try it free!</strong> Get 5 free single generates.{" "}
              <Link href="/register" style={{ color: "#60a5fa", textDecoration: "underline" }}>
                Sign up
              </Link> for unlimited access.
            </p>
          </div>
        )}
      </section>

      {/* WINDOWS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginLeft: "20px",
          marginRight: "20px"
        }}
      >
        {/* SINGLE */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Single Generator</h2>
          <p style={cardText}>
            Generate SEO metadata for a single page at a time. Ideal for blog
            posts, landing pages, service pages, and individual products.
          </p>
          <ul style={cardList}>
            <li>Pixel-accurate title & description</li>
            <li>Manual review and refinement</li>
            <li>Best for focused, one-off pages</li>
          </ul>
          <Link href="/dashboard/single" style={cardButton}>
            Open Single Generator →
          </Link>
        </div>

        {/* BATCH */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Batch Generator</h2>
          <p style={cardText}>
            Create SEO metadata for multiple pages at once using CSV uploads.
            Designed for scale and speed.
          </p>
          <ul style={cardList}>
            <li>Upload and map CSV columns</li>
            <li>Bulk SEO generation</li>
            <li>Export results instantly</li>
          </ul>
          {!isAuthenticated ? (
            <div>
              <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                ⚠️ Sign up required
              </p>
              <Link href="/register" style={cardButton}>
                Sign Up to Access →
              </Link>
            </div>
          ) : !hasPlanAccess("batch") ? (
            <div>
              <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                ⚠️ Batch plan required
              </p>
              <Link href="/dashboard/billing" style={cardButton}>
                Upgrade to Batch Plan →
              </Link>
            </div>
          ) : (
            <Link href="/dashboard/batch" style={cardButton}>
              Open Batch Generator →
            </Link>
          )}
        </div>

        {/* SEO PRO */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>SEO-Pro</h2>
          <p style={cardText}>
            Advanced SEO workflows for distributors, product catalogs, and
            structured data automation.
          </p>
          <ul style={cardList}>
            <li>Distributor & template management</li>
            <li>JSON-LD & internal links</li>
            <li>Built for large-scale SEO systems</li>
          </ul>
          {!isAuthenticated ? (
            <div>
              <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                ⚠️ Sign up required
              </p>
              <Link href="/register" style={cardButton}>
                Sign Up to Access →
              </Link>
            </div>
          ) : !hasPlanAccess("seoPro") ? (
            <div>
              <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                ⚠️ Pro plan required
              </p>
              <Link href="/dashboard/billing" style={cardButton}>
                Upgrade to Pro Plan →
              </Link>
            </div>
          ) : (
            <Link href="/dashboard/seo-pro" style={cardButton}>
              Open SEO-Pro →
            </Link>
          )}
        </div>

{/* QUICK ACTIONS */}
<div style={cardStyle}>
  <h2 style={cardTitle}>Quick Actions</h2>
  <p style={cardText}>
    Jump back in or check your recent activity.
  </p>

  <ul style={cardList}>
    <li>Last run: Today</li>
    <li>Mode: Single Generator</li>
    <li>Status: Ready</li>
  </ul>

  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
    <Link href="/dashboard/single" style={cardButton}>Run Single →</Link>
    {!isAuthenticated ? (
      <Link href="/register" style={cardButton}>Sign Up for Batch →</Link>
    ) : !hasPlanAccess("batch") ? (
      <Link href="/dashboard/billing" style={cardButton}>Upgrade for Batch →</Link>
    ) : (
      <Link href="/dashboard/batch" style={cardButton}>Run Batch →</Link>
    )}
  </div>
</div>

      </div>
    </div>
  );
}

/* STYLES */

const cardStyle = {
  background: "rgba(15, 18, 35, 0.55)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "24px",
  backdropFilter: "blur(14px)",
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const cardTitle = {
  fontSize: "22px",
  fontWeight: 700
};

const cardText = {
  color: "#d1d5ff",
  lineHeight: 1.6
};

const cardList = {
  paddingLeft: "18px",
  color: "#c7d2fe",
  lineHeight: 1.6
};

const cardButton = {
  marginTop: "auto",
  alignSelf: "flex-start",
  textDecoration: "none",
  fontWeight: 600,
  color: "#7dd3fc"
};
