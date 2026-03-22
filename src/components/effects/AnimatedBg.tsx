"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBg() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const p = document.createElement("div");
      p.className = "bg-particle";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${12 + Math.random() * 18}s`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.width = `${1 + Math.random() * 2}px`;
      p.style.height = p.style.width;
      p.style.opacity = "0";
      container.appendChild(p);
    }

    return () => { container.innerHTML = ""; };
  }, []);

  return (
    <>
      {/* Layer 1: Curtain — back-most, gentle sway */}
      <div className="fixed z-0 overflow-hidden" style={{ inset: "-3%" }}>
        <img src="/curtain.svg" alt=""
          className="w-full h-full object-cover"
          style={{ animation: "curtainSway 15s ease-in-out infinite" }}
          draggable={false}
        />
      </div>

      {/* Layer 2: Globe — slow rotate */}
      <div className="fixed z-[1] overflow-hidden" style={{ inset: "-2%" }}>
        <img src="/globe.svg" alt=""
          className="w-full h-full object-cover opacity-[0.25]"
          style={{ animation: "globeFloat 25s ease-in-out infinite" }}
          draggable={false}
        />
      </div>

      {/* Layer 3: Dark overlay for readability */}
      <div className="fixed inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(26,10,10,0.3) 0%, rgba(26,10,10,0.6) 50%, rgba(26,10,10,0.8) 100%)" }}
      />

      {/* Layer 4: Particles */}
      <div className="fixed inset-0 z-[3] pointer-events-none">
        <div ref={particlesRef} />
      </div>
    </>
  );
}
