"use client";

import { useUsage } from "../lib/useUsage";

export default function UsageMeter() {
  const usage = useUsage();

  return (
    <div style={{ fontSize: "12px", opacity: 0.8 }}>
      Single: {usage.single} | Batch: {usage.batch}
    </div>
  );
}
