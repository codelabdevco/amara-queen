"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "แดชบอร์ด", icon: "◉" },
  { href: "/admin/readings", label: "คำทำนาย", icon: "♠" },
  { href: "/admin/users", label: "ผู้ใช้", icon: "♦" },
  { href: "/admin/credits", label: "เครดิต", icon: "★" },
  { href: "/admin/transactions", label: "ธุรกรรม", icon: "฿" },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: "☰" },
  { href: "/admin/products", label: "สินค้า", icon: "✧" },
  { href: "/admin/settings", label: "ตั้งค่า", icon: "⚙" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-56 flex flex-col p-4 pt-6 z-50"
      style={{ background: "#0e0e0e", borderRight: "1px solid #ffffff06" }}
    >
      <h1 className="text-white/90 text-base font-semibold mb-0.5 tracking-wide">Queen Amara</h1>
      <p className="text-white/20 text-xs mb-6">Admin Panel</p>
      <div className="w-full h-[1px] mb-4" style={{ background: "#ffffff08" }} />
      <div className="space-y-0.5 flex-1">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === n.href
                ? "bg-white/[0.06] text-[#d4af37]"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
            }`}
          >
            <span className="text-sm opacity-60">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </div>
      <div className="w-full h-[1px] mb-3" style={{ background: "#ffffff08" }} />
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/admin/login";
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400/40 hover:text-red-400/70 hover:bg-red-400/[0.03] transition-colors"
      >
        <span className="text-sm">⏻</span>
        ออกจากระบบ
      </button>
    </nav>
  );
}
