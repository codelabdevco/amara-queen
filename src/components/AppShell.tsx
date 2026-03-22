"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GoldenMist from "@/components/effects/GoldenMist";
import DustParticles from "@/components/effects/DustParticles";
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
      <GoldenMist />
      <DustParticles />

      <header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 border-b border-gold/[0.02]"
        style={{
          paddingTop: "max(12px, env(safe-area-inset-top))",
          background: "linear-gradient(180deg, #1a0a0a 0%, rgba(26,10,10,0.95) 100%)",
        }}
      >
        <Link href="/home" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span
            className="text-base font-serif tracking-[0.15em] font-semibold"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer-text 4s ease-in-out infinite",
            }}
          >
            Queen Amara
          </span>
        </Link>
        <div className="flex gap-3 items-center">
          <CreditBadge />
          <UserAuth />
        </div>
      </header>

      <main className="fixed inset-0 z-10 pt-[56px] pb-[72px] overflow-y-auto">
        {backHref && (
          <div className="px-4 pt-2 pb-1">
            <Link href={backHref} className="flex items-center gap-1.5 text-gold/40 hover:text-gold/70 transition-colors w-fit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="text-xs">ย้อนกลับ</span>
            </Link>
          </div>
        )}
        {children}
      </main>

      <BottomNav />
    </>
  );
}
