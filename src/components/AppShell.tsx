"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Starfield from "@/components/canvas/Starfield";
import GoldenMist from "@/components/effects/GoldenMist";
import DustParticles from "@/components/effects/DustParticles";
import UserAuth from "@/components/ui/UserAuth";
import CreditBadge from "@/components/ui/CreditBadge";
import { THEME } from "@/constants/theme";

const BACK_MAP: Record<string, string> = {
  "/home": "/",
  "/tarot": "/home",
  "/gypsy": "/home",
  "/siamsi": "/home",
  "/auspicious": "/home",
  "/calendar": "/home",
  "/booking": "/home",
  "/shop": "/home",
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const backHref = BACK_MAP[pathname] || null;

  return (
    <>
      {THEME.backgroundImage && (
        <div className="fixed inset-0 z-0">
          <img src={THEME.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <Starfield />
      <GoldenMist />
      <DustParticles />

      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-[#08090e] border-b border-white/[0.04]" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <Link href="/home" className="text-sm text-gold/70 tracking-[0.2em] font-medium hover:text-gold/90 transition-colors">
          Amara Queen
        </Link>
        <div className="flex gap-3 items-center">
          <CreditBadge />
          <UserAuth />
        </div>
      </header>

      <main className="fixed inset-0 z-10 pt-[56px] pb-8 overflow-y-auto">
        {backHref && (
          <div className="px-4 pt-2 pb-1">
            <Link href={backHref} className="flex items-center gap-1.5 text-white/35 hover:text-white/60 transition-colors w-fit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="text-xs">ย้อนกลับ</span>
            </Link>
          </div>
        )}
        {children}
      </main>
    </>
  );
}
