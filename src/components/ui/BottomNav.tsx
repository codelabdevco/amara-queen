"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/home", label: "หน้าแรก", icon: "◉" },
  { href: "/tarot", label: "ดูดวง", icon: "☽" },
  { href: "/shop", label: "ร้านค้า", icon: "❖" },
  { href: "/booking", label: "นัดหมอ", icon: "☷" },
  { href: "/profile", label: "โปรไฟล์", icon: "♦" },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100]"
      style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
    >
      {/* Gold ornament line */}
      <div className="h-[1px] relative">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, #8B7A4A40, #d4af3760, #8B7A4A40, transparent)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-2 h-2 rotate-45" style={{ background: "#8B7A4A", opacity: 0.3 }} />
      </div>

      <div className="flex items-center justify-around px-1 pt-2 pb-1"
        style={{ background: "linear-gradient(135deg, #2D0A0A, #3A0E0E, #2D0A0A)" }}
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/home" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
            >
              {isActive && (
                <motion.div
                  className="absolute -top-2.5 w-6 h-[1.5px] rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }}
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`text-base transition-all duration-300 ${
                  isActive ? "text-[#d4af37] drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]" : "text-[#5A4E34]"
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[0.5rem] transition-colors duration-300 ${
                  isActive ? "text-[#d4af37]" : "text-[#5A4E34]"
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
