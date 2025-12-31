"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request");
        setIsLoading(false);
        return;
      }

      setSuccess("Reset token generated. Check your email or use the token below.");
      setResetToken(data.resetToken || "");
      setIsLoading(false);
    } catch (error) {
      setError("Failed to process request. Please try again.");
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
          Forgot Password
        </h1>
        <p style={{ 
          color: "#9ca3af", 
          marginBottom: "32px",
          fontSize: "14px"
        }}>
          Enter your email to receive a password reset link
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

        {success && (
          <div style={{
            padding: "12px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            color: "#22c55e",
            marginBottom: "24px",
            fontSize: "14px"
          }}>
            {success}
            {resetToken && (
              <div style={{ marginTop: "12px", fontSize: "12px", wordBreak: "break-all" }}>
                <strong>Reset Token:</strong> {resetToken}
                <br />
                <Link href={`/reset-password?token=${resetToken}`} style={{ color: "#4dabff", textDecoration: "underline" }}>
                  Click here to reset password
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
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
            {isLoading ? "Processing..." : "Send Reset Link"}
          </button>

          <div style={{ textAlign: "center" }}>
            <Link href="/login" style={{ color: "#4dabff", textDecoration: "none", fontSize: "14px" }}>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

