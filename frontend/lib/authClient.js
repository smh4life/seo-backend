function getApiBase() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }
  // In browser, check if we have the env var, otherwise try to detect
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return apiUrl;
  
  // Fallback: if we're on the production domain, use production API
  if (window.location.hostname === "myseogenerator.com" || window.location.hostname.includes("render.com")) {
    return "https://seo-backend-51av.onrender.com";
  }
  
  return "http://localhost:3000";
}

const API_BASE = getApiBase();

export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(error.error || "Login failed");
    }

    const data = await res.json();

    // 🔑 THIS WAS MISSING
    localStorage.setItem("token", data.token);

    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}
