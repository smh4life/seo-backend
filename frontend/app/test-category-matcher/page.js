"use client";

import CategoryMatcherTest from "./CategoryMatcherTest";

export default function TestCategoryMatcherPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050816 0%, #0b0f2a 55%, #1a0b3d 100%)",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        <h1 style={{
          color: "#ffffff",
          fontSize: "32px",
          marginBottom: "8px",
          textAlign: "center"
        }}>
          Category Matcher - Test Page
        </h1>
        <p style={{
          color: "#9ca3af",
          textAlign: "center",
          marginBottom: "32px"
        }}>
          Standalone test page for category import and CSV matching
        </p>
        <CategoryMatcherTest />
      </div>
    </div>
  );
}

