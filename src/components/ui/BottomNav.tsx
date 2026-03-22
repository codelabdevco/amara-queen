"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/home", label: "หน้าแรก", icon: "◉", activeIcon: "◉" },
  { href: "/tarot", label: "ดูดวง", icon: "☽", activeIcon: "☽" },
  { href: "/shop", label: "ร้านค้า", icon: "✧", activeIcon: "✧" },
  { href: "/booking", label: "นัดหมอ", icon: "☎", activeIcon: "☎" },
  { href: "/profile", label: "โปรไฟล์", icon: "♦", activeIcon: "♦" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on landing, admin
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md border-t border-gold/[0.08]"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))", background: "linear-gradient(180deg, rgba(26,10,10,0.97), #1a0a0a)" }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/home" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 relative"
            >
              {isActive && (
                <motion.div
                  className="absolute -top-1.5 w-8 h-[2px] bg-gold rounded-full"
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`text-lg transition-colors ${
                  isActive ? "text-gold" : "text-gold/25"
                }`}
              >
                {isActive ? tab.activeIcon : tab.icon}
              </span>
              <span
                className={`text-[0.55rem] transition-colors ${
                  isActive ? "text-gold" : "text-white/20"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
