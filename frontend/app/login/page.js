"use client";

import { useState } from "react";
import { login } from "../../lib/authClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to login. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div style={{ 
      maxWidth: "1200px",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0f172a inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
        }
      `}</style>
      <div style={{
        maxWidth: "450px",
        width: "100%",
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "40px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
      }}>
        <h1 style={{ 
          fontSize: "32px", 
          marginBottom: "8px",
          color: "#ffffff",
          fontWeight: "600"
        }}>
          Sign In
        </h1>
        <p style={{ 
          color: "#9ca3af", 
          marginBottom: "32px",
          fontSize: "14px"
        }}>
          Welcome back to MySEOGenerator
        </p>

        {error && (
          <div style={{
            padding: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#ef4444",
            marginBottom: "24px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              color: "#9ca3af",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "8px",
                background: "#0f172a",
                border: "1px solid #22c55e",
                color: "#ffffff",
                fontSize: "18px",
                fontFamily: "Arial, sans-serif",
                boxSizing: "border-box"
              }}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              color: "#9ca3af",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "8px",
                background: "#0f172a",
                border: "1px solid #22c55e",
                color: "#ffffff",
                fontSize: "18px",
                fontFamily: "Arial, sans-serif",
                boxSizing: "border-box"
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "8px",
              background: isLoading 
                ? "#374151" 
                : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              color: "#ffffff",
              fontWeight: "600",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: isLoading 
                ? "none" 
                : "0 4px 16px rgba(59, 130, 246, 0.4)",
              fontSize: "18px",
              marginBottom: "24px",
              opacity: isLoading ? 0.7 : 1,
              boxSizing: "border-box"
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>
              Don't have an account?{" "}
              <Link href="/register" style={{ color: "#4dabff", textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
