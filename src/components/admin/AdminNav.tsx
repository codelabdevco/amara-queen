"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface NavItem { href: string; label: string; icon: string; }
interface NavGroup { title: string; items: NavItem[]; }

const GROUPS: NavGroup[] = [
  {
    title: "",
    items: [
      { href: "/admin", label: "แดชบอร์ด", icon: "home" },
    ],
  },
  {
    title: "ดูดวง",
    items: [
      { href: "/admin/readings", label: "คำทำนาย", icon: "scroll-text" },
      { href: "/admin/healers", label: "หมอดู", icon: "sparkles" },
      { href: "/admin/bookings", label: "การจอง", icon: "calendar-check" },
    ],
  },
  {
    title: "ผู้ใช้ & เครดิต",
    items: [
      { href: "/admin/users", label: "ผู้ใช้", icon: "users" },
      { href: "/admin/credits", label: "เครดิต", icon: "star" },
      { href: "/admin/transactions", label: "ธุรกรรม", icon: "receipt" },
    ],
  },
  {
    title: "ร้านค้า",
    items: [
      { href: "/admin/products", label: "สินค้า", icon: "sparkle" },
      { href: "/admin/orders", label: "คำสั่งซื้อ", icon: "package" },
    ],
  },
  {
    title: "",
    items: [
      { href: "/admin/settings", label: "ตั้งค่า", icon: "settings" },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-56 flex flex-col p-4 pt-6 z-50 overflow-y-auto"
      style={{ background: "#0e0e0e", borderRight: "1px solid #ffffff06" }}
    >
      <h1 className="text-white/90 text-base font-semibold mb-0.5 tracking-wide">Queen Amara</h1>
      <p className="text-white/20 text-xs mb-5">Admin Panel</p>

      <div className="flex-1 space-y-1">
        {GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="text-[9px] text-white/15 uppercase tracking-widest px-3 pt-4 pb-1.5">{group.title}</p>
            )}
            {!group.title && gi > 0 && (
              <div className="h-px my-2" style={{ background: "#ffffff06" }} />
            )}
            {group.items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === n.href
                    ? "bg-white/[0.06] text-[#d4af37]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                <Icon name={n.icon} size={16} className="opacity-60" />
                {n.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="h-px my-2" style={{ background: "#ffffff06" }} />
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/admin/login";
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400/40 hover:text-red-400/70 hover:bg-red-400/[0.03] transition-colors"
      >
        <Icon name="log-out" size={16} />
        ออกจากระบบ
      </button>
    </nav>
  );
}
