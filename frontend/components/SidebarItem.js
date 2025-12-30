"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({ href, label }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      style={{
        color: "#ffffff",
        textDecoration: "none",
        fontSize: "25px",
        padding: "8px 10px",
        borderRadius: "6px",
        background: isActive ? "rgba(77,171,255,0.15)" : "transparent",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
      onMouseEnter={e => {

        e.currentTarget.style.background = "rgba(77,171,255,0.25)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(77,171,255,0.55)";
      }}
      onMouseLeave={e => {
       e.currentTarget.style.background = isActive
          ? "rgba(77,171,255,0.45)"
          : "transparent";
          e.currentTarget.style.boxShadow = isActive
    ? "0 0 10px rgba(77,171,255,0.35)"
    : "none";
      }}
    >
      {label}
    </Link>
  );
}
