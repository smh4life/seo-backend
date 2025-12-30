"use client";

import { useEffect, useState } from "react";

export function useUsage() {
  const [usage, setUsage] = useState({ single: 0, batch: 0 });

  useEffect(() => {
    fetch("http://localhost:3000/usage")
      .then(r => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  return usage;
}
