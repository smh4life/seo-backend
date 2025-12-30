"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getToken, logout as logoutUser } from "../lib/authClient";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    // Check if user is logged in
    const token = getToken();
    setIsLoggedIn(!!token);
  }, [pathname]); // Update when pathname changes

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "79px",
        borderBottom: "1px solid #1f2937",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(5, 8, 22, 0.8)",
        zIndex: 1000,
        color: "#ffffff"
      }}
    >
      {/* LEFT SIDE - LOGO */}
      {!isHomePage && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <Link href="/" style={{ display: "inline-block", cursor: "pointer" }}>
            <img src="/logo.png" alt="MySEOGenerator" height="130" style={{ display: "block" }} />
          </Link>
        </div>
      )}

      {/* CENTER - TITLE */}
      <div style={{ 
        position: isHomePage ? "absolute" : "absolute", 
        left: "50%", 
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: "36px",
            color: "#60a5fa",
            textShadow: "0 0 8px rgba(96,165,250,0.55)",
            filter: "drop-shadow(0 0 8px rgba(96,165,250,0.95))",
            animation: "headerGlowPulse 1.8s ease-in-out infinite"
          }}
        >
          MySEOGenerator
        </span>
      </div>

      {/* RIGHT SIDE - AUTH BUTTONS */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: "flex-end" }}>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid #1f2937",
              color: "#9ca3af",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease-out"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.1)";
              e.target.style.borderColor = "#ef4444";
              e.target.style.color = "#ef4444";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "#1f2937";
              e.target.style.color = "#9ca3af";
            }}
          >
            Sign Out
          </button>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid #1f2937",
                color: "#9ca3af",
                fontWeight: 500,
                textDecoration: "none",
                fontSize: "14px",
                transition: "all 0.2s ease-out",
                display: "inline-block"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(77, 171, 255, 0.1)";
                e.target.style.borderColor = "#4dabff";
                e.target.style.color = "#4dabff";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "#1f2937";
                e.target.style.color = "#9ca3af";
              }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#4dabff",
                border: "none",
                color: "#020617",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "14px",
                transition: "all 0.2s ease-out",
                display: "inline-block",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#3b82f6";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#4dabff";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes headerGlowPulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </header>
  );
}
