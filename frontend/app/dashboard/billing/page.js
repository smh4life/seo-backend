"use client";

import PlanCard from "./PlanCard";
import { getToken } from "../../../lib/authClient";

export default function BillingPage() {
  async function checkout(plan) {
    const token = getToken();
    const res = await fetch("http://localhost:3000/billing/checkout", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({ plan })
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Failed to create checkout session" }));
      alert(error.error || "Failed to start checkout. Please try again.");
      return;
    }
    
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to get checkout URL");
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
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "32px", marginBottom: "16px", paddingLeft: "8px" }}>Billing</h1>
      <p style={{ color: "#9ca3af", marginBottom: "32px", paddingLeft: "8px" }}>Choose a plan that fits your needs.</p>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <PlanCard
          plan="Single"
          price="$9/mo"
          features={["Unlimited Single"]}
          onSelect={checkout}
        />
        <PlanCard
          plan="Batch"
          price="$19/mo"
          features={["Single", "Batch", "CSV"]}
          onSelect={checkout}
        />
        <PlanCard
          plan="Pro"
          price="$39/mo"
          features={["Everything", "SEO-Pro", "Templates", "Category Matcher"]}
          onSelect={checkout}
        />
      </div>
    </div>
  );
}
