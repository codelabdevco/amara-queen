"use client";

import { useRef } from "react";

interface Props {
  children: React.ReactNode;
  variant?: "crimson" | "gold";
  onClick?: () => void;
  className?: string;
  href?: string;
}

export default function LaurelButton({ children, variant = "crimson", onClick, className = "", href }: Props) {
  const btnRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  function handleRipple(e: React.MouseEvent) {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(212,196,142,.1);width:10px;height:10px;left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;transform:translate(-50%,-50%) scale(0);animation:qa-ripple .65s ease-out forwards;pointer-events:none;z-index:4`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  const frameId = variant === "gold" ? "#fl-g" : "#fl-c";
  const labelClass = variant === "gold"
    ? "text-[#2A0C10] font-semibold group-hover:text-[#0A0304]"
    : "text-[#E2D4A0] group-hover:text-[#F0E8C8] group-hover:[text-shadow:0_0_10px_rgba(226,214,168,.1)]";
  const shimmerBg = variant === "gold"
    ? "linear-gradient(105deg,transparent 30%,rgba(255,255,255,.08) 44%,rgba(255,255,255,.18) 50%,rgba(255,255,255,.08) 56%,transparent 70%)"
    : "linear-gradient(105deg,transparent 30%,rgba(212,196,142,.06) 44%,rgba(212,196,142,.12) 50%,rgba(212,196,142,.06) 56%,transparent 70%)";
  const glowShadow = variant === "gold"
    ? "0 0 20px rgba(196,173,114,.18),0 0 40px rgba(196,173,114,.06)"
    : "0 0 18px rgba(196,173,114,.1),0 0 36px rgba(122,26,26,.1)";

  const inner = (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none"><use href={frameId} /></svg>
      <div className="absolute inset-[-1px] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" style={{ boxShadow: glowShadow }} />
      <div className="absolute top-0 -left-[130%] w-[60%] h-full z-[1] pointer-events-none group-hover:left-[150%] transition-[left] duration-[850ms] ease-[cubic-bezier(.23,1,.32,1)]" style={{ background: shimmerBg }} />
      <div className="relative z-[2] flex items-center justify-center gap-2">
        <span className={`font-noto font-medium text-sm tracking-wider transition-all duration-300 ${labelClass}`}>
          {children}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        ref={btnRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`group relative inline-flex items-center justify-center cursor-pointer bg-transparent border-none p-0 outline-none w-[200px] h-[52px] transition-all duration-350 ease-[cubic-bezier(.23,1,.32,1)] hover:-translate-y-[2px] hover:brightness-[1.08] active:translate-y-0 active:scale-[0.985] overflow-hidden ${className}`}
        onClick={(e) => { handleRipple(e); }}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={btnRef as React.RefObject<HTMLButtonElement>}
      className={`group relative inline-flex items-center justify-center cursor-pointer bg-transparent border-none p-0 outline-none w-[200px] h-[52px] transition-all duration-350 ease-[cubic-bezier(.23,1,.32,1)] hover:-translate-y-[2px] hover:brightness-[1.08] active:translate-y-0 active:scale-[0.985] overflow-hidden ${className}`}
      onClick={(e) => { handleRipple(e); onClick?.(); }}
    >
      {inner}
    </button>
  );
}
