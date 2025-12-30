"use client";

import SidebarItem from "./SidebarItem";

export default function Sidebar() {
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
        <SidebarItem href="/dashboard/billing" label="Billing" />
        <SidebarItem href="/dashboard/contact" label="Contact" />
        <SidebarItem href="/dashboard/about" label="About" />
      </nav>
    </aside>
  );
}
