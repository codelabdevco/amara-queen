"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AnimatedBg from "@/components/effects/AnimatedBg";
import UserAuth from "@/components/ui/UserAuth";
import CreditBadge from "@/components/ui/CreditBadge";
import BottomNav from "@/components/ui/BottomNav";

const BACK_MAP: Record<string, string> = {
  "/siamsi": "/home",
  "/auspicious": "/home",
  "/calendar": "/home",
  "/booking": "/home",
  "/shop": "/home",
  "/profile": "/home",
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const backHref = BACK_MAP[pathname] || null;

  return (
    <>
      <AnimatedBg />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: "linear-gradient(135deg, #2D0A0A, #3A0E0E, #2D0A0A)" }}
        >
          <Link href="/home" className="hover:opacity-90 transition-opacity">
            <span
              className="text-[0.85rem] tracking-[0.2em] font-medium"
              style={{
                background: "linear-gradient(135deg, #8B7A4A, #d4af37, #f0d78c, #d4af37, #8B7A4A)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer-text 4s ease-in-out infinite",
              }}
            >
              Queen Amara
            </span>
          </Link>
          <div className="flex gap-2.5 items-center">
            <CreditBadge />
            <UserAuth />
          </div>
        </div>
        {/* Gold ornament line */}
        <div className="h-[1px] relative">
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, #8B7A4A40, #d4af3760, #8B7A4A40, transparent)" }} />
          <div className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-2 h-2 rotate-45" style={{ background: "#8B7A4A", opacity: 0.3 }} />
        </div>
      </header>

      <main className="fixed inset-0 z-10 pt-[48px] pb-[64px] overflow-y-auto">
        {backHref && (
          <div className="px-4 pt-2 pb-1">
            <Link href={backHref} className="flex items-center gap-1.5 text-[#8B7A4A]/40 hover:text-[#d4af37]/70 transition-colors w-fit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="text-[0.65rem]">ย้อนกลับ</span>
            </Link>
          </div>
        )}
        {children}
      </main>

      <BottomNav />
    </>
  );
}
