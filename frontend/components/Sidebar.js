"use client";

import { useEffect, useState } from "react";
import SidebarItem from "./SidebarItem";
import { hasPlanAccess } from "../lib/userPlan";

export default function Sidebar() {
  const [showCategoryMatcher, setShowCategoryMatcher] = useState(false);

  useEffect(() => {
    // Check if user has Pro plan access
    setShowCategoryMatcher(hasPlanAccess("categoryMatcher"));
  }, []);

  return (
    <aside
      style={{
        position: "fixed",
        top: "79px",
        left: 0,
        bottom: 0,
        width: "182px",
        borderRight: "1px solid #1f2937",
        padding: "24px",
        backgroundColor: "rgba(5, 8, 22, 0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 999,
        overflowY: "auto"
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <SidebarItem href="/dashboard" label="Dashboard" />
        <SidebarItem href="/dashboard/single" label="Single" />
        <SidebarItem href="/dashboard/batch" label="Batch" />
        <SidebarItem href="/dashboard/seo-pro" label="SEO-Pro" />
        {showCategoryMatcher && (
          <SidebarItem href="/test-category-matcher" label="Category Matcher" />
        )}
        <SidebarItem href="/dashboard/billing" label="Billing" />
        <SidebarItem href="/dashboard/contact" label="Contact" />
        <SidebarItem href="/dashboard/about" label="About" />
      </nav>
    </aside>
  );
}
