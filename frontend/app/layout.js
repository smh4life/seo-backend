"use client";

import { usePathname } from "next/navigation";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  useEffect(() => {
    // Force update favicon links with multiple sizes for better quality
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());

    // Add multiple favicon sizes - browsers will pick the best one
    const timestamp = Date.now();
    const faviconPath = `/favicon_io/Picture.png?t=${timestamp}`;
    const sizes = [
      { size: '512x512', href: faviconPath },
      { size: '256x256', href: faviconPath },
      { size: '128x128', href: faviconPath },
      { size: '64x64', href: faviconPath },
      { size: '32x32', href: faviconPath },
      { size: '16x16', href: faviconPath }
    ];

    sizes.forEach(({ size, href }) => {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.sizes = size;
      link.href = href;
      document.head.appendChild(link);
    });

    // Also add shortcut icon
    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.href = faviconPath;
    document.head.appendChild(shortcut);
  }, []);
  
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
