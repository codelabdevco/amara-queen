"use client";

import { useEffect } from "react";

export default function DustParticles() {
  useEffect(() => {
    const interval = setInterval(() => {
      const d = document.createElement("div");
      d.className = "dust-particle";
      d.style.left = Math.random() * 100 + "%";
      d.style.animationDuration = 6 + Math.random() * 8 + "s";
      document.getElementById("dust-container")?.appendChild(d);
      setTimeout(() => d.remove(), 14000);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <div id="dust-container" className="fixed inset-0 z-[2] pointer-events-none overflow-hidden" />;
}
