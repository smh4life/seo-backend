const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiPost(path, body) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || "Request failed";
    } catch {
      const text = await res.text();
      errorMessage = text || "Request failed";
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
