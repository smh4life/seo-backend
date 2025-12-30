"use client";

import { useState, useEffect } from "react";
import { getToken } from "../../../lib/authClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ 
      maxWidth: "1200px",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "calc(100vh - 79px - 48px)",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "32px", marginBottom: "16px", paddingLeft: "8px" }}>Admin</h1>
      <p style={{ color: "#9ca3af", marginBottom: "32px", paddingLeft: "8px" }}>Administrative tools and controls.</p>

      <div style={{
        maxWidth: "900px",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(20px)"
      }}>
        <div style={{
          padding: "24px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#ef4444", fontSize: "20px", marginBottom: "12px" }}>Admin Tools</h3>
          <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
            Administrative features coming soon. This section will be available to authorized administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
