// Safe API base URL getter with fallbacks
export function getApiBase() {
  if (typeof window === "undefined") {
    // Server-side: use env var or default
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }
  
  // Client-side: check env var first (set at build time)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "http://localhost:3000") {
    return apiUrl;
  }
  
  // Fallback: detect production environment
  const hostname = window.location.hostname;
  if (hostname === "myseogenerator.com" || hostname === "www.myseogenerator.com" || hostname.includes("render.com")) {
    return "https://seo-backend-51av.onrender.com";
  }
  
  // Default to localhost for development
  return "http://localhost:3000";
}

