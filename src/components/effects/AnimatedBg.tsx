"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBg() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);

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

  // Sparkles
  useEffect(() => {
    const container = sparklesRef.current;
    if (!container) return;

    function createSparkle() {
      if (!container) return;
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.left = `${10 + Math.random() * 80}%`;
      s.style.top = `${10 + Math.random() * 80}%`;
      const size = 1.5 + Math.random() * 2.5;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      const dur = 2 + Math.random() * 3;
      s.style.animationDuration = `${dur}s`;
      s.style.background = `radial-gradient(circle, #d4af37, #8B7A4A00)`;
      s.style.boxShadow = `0 0 ${3 + Math.random() * 4}px #d4af3740`;
      container.appendChild(s);
      setTimeout(() => s.remove(), dur * 1000);
    }

    const interval = setInterval(createSparkle, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Layer 1: Curtain */}
      <div className="fixed z-0 overflow-hidden" style={{ inset: "-5%" }}>
        <img src="/curtain.svg" alt=""
          className="w-full h-full object-cover"
          style={{ animation: "curtainSway 12s ease-in-out infinite" }}
          draggable={false}
        />
      </div>

      {/* Layer 2: Globe */}
      <div className="fixed z-[1] overflow-hidden" style={{ inset: "-5%" }}>
        <img src="/globe.svg" alt=""
          className="w-full h-full object-cover opacity-[0.25]"
          style={{ animation: "globeFloat 25s ease-in-out infinite" }}
          draggable={false}
        />
      </div>

      {/* Layer 3: Dark overlay */}
      <div className="fixed inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(26,10,10,0.3) 0%, rgba(26,10,10,0.6) 50%, rgba(26,10,10,0.8) 100%)" }}
      />

      {/* Layer 4: Mystic circles */}
      <div className="mystic-circle" />
      <svg className="mystic-circle-marks" viewBox="0 0 200 200">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const x = 100 + 95 * Math.cos(angle);
          const y = 100 + 95 * Math.sin(angle);
          return <line key={i} x1={100 + 85 * Math.cos(angle)} y1={100 + 85 * Math.sin(angle)} x2={x} y2={y} stroke="#d4af37" strokeWidth="0.5" opacity="0.2" />;
        })}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = (i * 10) * Math.PI / 180;
          const x = 100 + 92 * Math.cos(angle);
          const y = 100 + 92 * Math.sin(angle);
          return <circle key={`d${i}`} cx={x} cy={y} r="0.7" fill="#d4af37" opacity="0.12" />;
        })}
      </svg>

      {/* Layer 5: Particles */}
      <div className="fixed inset-0 z-[3] pointer-events-none">
        <div ref={particlesRef} />
      </div>

      {/* Layer 5: Sparkles */}
      <div ref={sparklesRef} className="fixed inset-0 z-[4] pointer-events-none overflow-hidden" />
    </>
  );
}
