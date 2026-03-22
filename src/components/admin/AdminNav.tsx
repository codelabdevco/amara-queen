"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "แดชบอร์ด", icon: "◉" },
  { href: "/admin/readings", label: "คำทำนาย", icon: "♠" },
  { href: "/admin/users", label: "ผู้ใช้", icon: "♦" },
  { href: "/admin/credits", label: "เครดิต", icon: "★" },
  { href: "/admin/transactions", label: "ธุรกรรม", icon: "฿" },
  { href: "/admin/settings", label: "ตั้งค่า", icon: "⚙" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-56 bg-[#2a1215] border-r border-gold/[0.02] flex flex-col p-4 pt-6 z-50">
      <h1 className="text-gold text-lg font-semibold mb-1 tracking-wide">Amara Queen</h1>
      <p className="text-white/25 text-xs mb-8">Admin Panel</p>
      <div className="space-y-1 flex-1">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === n.href
                ? "bg-gold/10 text-gold"
                : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
            }`}
          >
            <span className="text-base">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </div>
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/admin/login";
        }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/[0.05] transition-colors"
      >
        <span className="text-base">⏻</span>
        ออกจากระบบ
      </button>
    </nav>
  );
}
