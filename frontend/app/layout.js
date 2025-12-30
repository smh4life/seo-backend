"use client";

import { usePathname } from "next/navigation";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  // Removed favicon manipulation - Next.js handles it automatically via <head> tags
  
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
