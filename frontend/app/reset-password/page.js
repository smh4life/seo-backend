"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!token) {
      setError("Reset token is required");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setError("Failed to reset password. Please try again.");
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
          Reset Password
        </h1>
        <p style={{ 
          color: "#9ca3af", 
          marginBottom: "32px",
          fontSize: "14px"
        }}>
          Enter your new password
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
          </div>
        )}

        {!token && (
          <div style={{
            padding: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#ef4444",
            marginBottom: "24px",
            fontSize: "14px"
          }}>
            No reset token found. Please use the link from your email.
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
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              placeholder="Enter new password (min 6 characters)"
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
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "8px",
              background: isLoading || !token
                ? "#374151" 
                : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              color: "#ffffff",
              fontWeight: "600",
              border: "none",
              cursor: isLoading || !token ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: isLoading || !token
                ? "none" 
                : "0 4px 16px rgba(59, 130, 246, 0.4)",
              fontSize: "18px",
              marginBottom: "24px",
              opacity: isLoading || !token ? 0.7 : 1,
              boxSizing: "border-box"
            }}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
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
        <div style={{ color: "#ffffff" }}>Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

