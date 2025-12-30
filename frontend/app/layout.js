"use client";

import { usePathname } from "next/navigation";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  useEffect(() => {
    // Only run once on mount - don't interfere with navigation
    try {
      if (typeof document !== "undefined" && document.head) {
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(link => {
          try {
            if (link && link.parentNode) {
              link.remove();
            }
          } catch (e) {
            // Ignore errors removing individual links
          }
        });

        const faviconPath = `/favicon_io/Picture.png`;
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = faviconPath;
        if (document.head) {
          document.head.appendChild(link);
        }
      }
    } catch (error) {
      // Silently fail - favicon isn't critical
      console.error("Favicon error:", error);
    }
  }, []); // Only run once
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon_io/Picture.png" />
        <link rel="shortcut icon" href="/favicon_io/Picture.png" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: isHomePage
            ? "transparent"
            : "linear-gradient(135deg, #050816 0%, #0b0f2a 55%, #1a0b3d 100%)",
          color: "#ffffff",
        }}
      >
        {!isHomePage && <NavBar />}
        {!isHomePage && <Sidebar />}
        <main style={isHomePage ? {
          margin: 0,
          padding: 0,
          width: "100%",
          minHeight: "100vh"
        } : {
          marginLeft: "182px", 
          marginTop: "79px", 
          padding: "24px 32px 24px 48px",
          minHeight: "calc(100vh - 79px)",
          width: "calc(100% - 182px)",
          boxSizing: "border-box",
          overflowX: "auto",
          overflowY: "auto"
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
