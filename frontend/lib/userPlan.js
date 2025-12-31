const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Decode JWT token to get user plan and admin status
export function getUserPlanFromToken() {
  if (typeof window === "undefined") return "free";
  
  try {
    const token = localStorage.getItem("token");
    if (!token) return "free";
    
    // Decode JWT token (base64)
    const parts = token.split(".");
    if (parts.length !== 3) return "free";
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.plan || "free";
  } catch (e) {
    // Silently fail and return free plan
    return "free";
  }
}

// Check if user is admin
export function isAdmin() {
  if (typeof window === "undefined") return false;
  
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.isAdmin === true;
  } catch (e) {
    return false;
  }
}

// Check if user has access to a feature based on plan
export function hasPlanAccess(feature) {
  // Admins have access to everything
  if (isAdmin()) {
    return true;
  }
  
  const plan = getUserPlanFromToken();
  
  // Plan access rules
  const planAccess = {
    free: {
      single: true,  // Free users get 5 free single generates
      batch: false,
      seoPro: false,
      categoryMatcher: false
    },
    single: {
      single: true,
      batch: false,
      seoPro: false,
      categoryMatcher: false
    },
    batch: {
      single: true,
      batch: true,
      seoPro: false,
      categoryMatcher: false
    },
    pro: {
      single: true,
      batch: true,
      seoPro: true,
      categoryMatcher: true
    }
  };
  
  const userPlan = plan || "free";
  return planAccess[userPlan]?.[feature] || false;
}

// Get current user info from API
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to get user:", e);
    return null;
  }
}

