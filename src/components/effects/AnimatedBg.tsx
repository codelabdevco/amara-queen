"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBg() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Create floating gold particles
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
    <div className="bg-scene">
      <img
        src="/bg-main.svg"
        alt=""
        className="bg-scene__img"
        draggable={false}
      />
      <div className="bg-scene__overlay" />
      <div ref={particlesRef} className="bg-scene__particles" />
    </div>
  );
}
