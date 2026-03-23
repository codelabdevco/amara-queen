"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function AnimatedBg() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const [lottieData, setLottieData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/galdrastafur.json").then(r => r.json()).then(setLottieData).catch(() => {});
  }, []);

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
        <img src="/curtain.svg" alt="" className="w-full h-full object-cover"
          style={{ animation: "curtainSway 12s ease-in-out infinite" }} draggable={false} />
      </div>

      {/* Layer 2: Globe */}
      <div className="fixed z-[1] overflow-hidden" style={{ inset: "-5%" }}>
        <img src="/globe.svg" alt="" className="w-full h-full object-cover opacity-[0.25]"
          style={{ animation: "globeFloat 25s ease-in-out infinite" }} draggable={false} />
      </div>

      {/* Layer 3: Dark overlay */}
      <div className="fixed inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(26,10,10,0.3) 0%, rgba(26,10,10,0.6) 50%, rgba(26,10,10,0.8) 100%)" }} />

      {/* Layer 4: Rune circles — left */}
      {lottieData && (
        <div className="fixed z-[3] pointer-events-none"
          style={{ left: "-15%", top: "50%", transform: "translateY(-50%)", width: "65vw", height: "65vw", maxWidth: "550px", maxHeight: "550px", animation: "circleRotate 180s linear infinite" }}
        >
          <Lottie animationData={lottieData} loop autoplay
            style={{ width: "100%", height: "100%", filter: "sepia(1) hue-rotate(10deg) brightness(1.2)", opacity: 0.05 }} />
        </div>
      )}

      {/* Layer 4b: Rune circles — right (smaller, opposite spin) */}
      {lottieData && (
        <div className="fixed z-[3] pointer-events-none"
          style={{ right: "-20%", top: "30%", transform: "translateY(-50%)", width: "45vw", height: "45vw", maxWidth: "400px", maxHeight: "400px", animation: "circleRotate 240s linear infinite reverse" }}
        >
          <Lottie animationData={lottieData} loop autoplay
            style={{ width: "100%", height: "100%", filter: "sepia(1) hue-rotate(10deg) brightness(1.2)", opacity: 0.03 }} />
        </div>
      )}

      {/* Layer 5: Particles */}
      <div className="fixed inset-0 z-[4] pointer-events-none">
        <div ref={particlesRef} />
      </div>

      {/* Layer 6: Sparkles */}
      <div ref={sparklesRef} className="fixed inset-0 z-[5] pointer-events-none overflow-hidden" />
    </>
  );
}
