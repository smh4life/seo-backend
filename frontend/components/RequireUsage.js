"use client";

import { useState } from "react";
import UpgradeModal from "./UpgradeModal";

export default function RequireUsage({ allowed, current, children }) {
  const [open, setOpen] = useState(false);

  if (current >= allowed) {
    return (
      <>
        <button onClick={() => setOpen(true)}>
          🚫 Usage limit reached — Upgrade
        </button>
        <UpgradeModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return children;
}
