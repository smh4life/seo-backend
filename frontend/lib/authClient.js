const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function login(email, password) {
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
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}
