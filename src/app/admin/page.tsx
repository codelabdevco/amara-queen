"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import Icon from "@/components/ui/Icon";

interface Activity { type: string; text: string; time: number; color: string; }

interface Stats {
  totalReadings: number;
  todayReadings: number;
  userCount: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalCreditsHeld: number;
  estimatedCost: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCreditsIssued: number;
  pendingPayments: number;
  methodBreakdown: Record<string, { count: number; amount: number }>;
  last7: { date: string; count: number; tokens: number }[];
  revenueLast7: { date: string; amount: number }[];
  topTopics: [string, number][];
  topSpreads: [string, number][];
  bookingStats: { total: number; todayBookings: number; upcoming: number; completed: number; cancelled: number; totalCreditsEarned: number };
  healerStats: { total: number; active: number };
  pendingTopUps: number;
  pendingOrders: number;
  totalTokens?: number;
  todayTokens?: number;
  activeSubs: number;
  recentActivity: Activity[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<"readings" | "revenue">("readings");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json(); })
      .then((d) => { if (d) setS(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6">
        {loading ? (
          <div className="flex items-center gap-3 text-white/30 pt-20 justify-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#d4af37] rounded-full animate-spin" />
          </div>
        ) : <p className="text-white/40 text-center pt-20">ไม่สามารถโหลดข้อมูลได้</p>}
      </main>
    </div>
  );

  const chartData = chartMode === "readings" ? s.last7 : s.revenueLast7;
  const chartValues = chartMode === "readings" ? s.last7.map(d => d.count) : (s.revenueLast7 || []).map(d => d.amount);
  const maxChart = Math.max(...chartValues, 1);

  // Pending alerts count
  const alertCount = (s.pendingPayments || 0) + (s.pendingTopUps || 0) + (s.pendingOrders || 0);

  return (
    <div className="min-h-screen text-white/80" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white/90">แดชบอร์ด</h2>
            <p className="text-[10px] text-white/20 mt-0.5">
              {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {alertCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/15">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs text-yellow-400/80">{alertCount} รายการรอดำเนินการ</span>
            </div>
          )}
        </div>

        {/* ─── Row 1: Key metrics ─── */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <MetricCard icon="scroll-text" label="คำทำนาย" value={s.totalReadings} today={s.todayReadings} color="#d4af37" href="/admin/readings" />
          <MetricCard icon="users" label="ผู้ใช้" value={s.userCount} today={s.newUsersToday} todayLabel="ใหม่วันนี้" color="#8b5cf6" href="/admin/users" />
          <MetricCard icon="coins" label="รายได้" value={`฿${s.totalRevenue.toLocaleString()}`} today={s.todayRevenue > 0 ? `+฿${s.todayRevenue.toLocaleString()}` : undefined} color="#22c55e" href="/admin/transactions" />
          <MetricCard icon="calendar-check" label="การจอง" value={s.bookingStats.total} today={s.bookingStats.upcoming} todayLabel="กำลังจะมา" color="#3b82f6" href="/admin/bookings" />
        </div>

        {/* ─── Row 2: Alerts ─── */}
        {alertCount > 0 && (
          <div className="flex gap-3 mb-4">
            {s.pendingPayments > 0 && (
              <AlertBadge href="/admin/transactions" color="yellow" count={s.pendingPayments} label="ธุรกรรมรอตรวจสอบ" />
            )}
            {s.pendingTopUps > 0 && (
              <AlertBadge href="/admin/credits" color="orange" count={s.pendingTopUps} label="คำขอเติมเครดิตรอ" />
            )}
            {s.pendingOrders > 0 && (
              <AlertBadge href="/admin/orders" color="blue" count={s.pendingOrders} label="คำสั่งซื้อรอจัดส่ง" />
            )}
          </div>
        )}

        {/* ─── Row 3: Chart + Sidebar ─── */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Chart */}
          <div className="col-span-2 rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs text-white/40 uppercase tracking-wider">7 วันล่าสุด</h3>
              <div className="flex gap-1">
                <button onClick={() => setChartMode("readings")}
                  className={`px-3 py-1 rounded-md text-[10px] transition-colors ${chartMode === "readings" ? "bg-[#d4af37]/15 text-[#d4af37]" : "text-white/25 hover:text-white/40"}`}>
                  คำทำนาย
                </button>
                <button onClick={() => setChartMode("revenue")}
                  className={`px-3 py-1 rounded-md text-[10px] transition-colors ${chartMode === "revenue" ? "bg-[#22c55e]/15 text-[#22c55e]" : "text-white/25 hover:text-white/40"}`}>
                  รายได้
                </button>
              </div>
            </div>
            <div className="flex items-end gap-2 h-44">
              {chartData.map((day, i) => {
                const val = chartValues[i];
                const pct = (val / maxChart) * 100;
                const barColor = chartMode === "readings" ? "#d4af37" : "#22c55e";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      {chartMode === "revenue" ? `฿${val.toLocaleString()}` : val}
                    </span>
                    <div className="w-full rounded-t-md transition-all relative"
                      style={{ height: `${Math.max(pct, val > 0 ? 3 : 0)}%`, background: `${barColor}20` }}>
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md transition-all"
                        style={{ height: "100%", background: `${barColor}40` }} />
                    </div>
                    <span className="text-[9px] text-white/20">
                      {new Date(day.date + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar mini cards */}
          <div className="space-y-3">
            <MiniCard label="เครดิตในระบบ" value={s.totalCreditsHeld.toLocaleString()} sub="คงเหลือรวมทุกผู้ใช้" color="#f59e0b" />
            <MiniCard label="เครดิตที่ออก" value={s.totalCreditsIssued.toLocaleString()} sub="จากการชำระเงิน" color="#d4af37" />
            <MiniCard label="หมอดู" value={`${s.healerStats.active} / ${s.healerStats.total}`} sub={`สมาชิกจอง ${s.bookingStats.completed} ครั้ง`} color="#8b5cf6" />
            <MiniCard label="สมาชิกรายเดือน" value={`${s.activeSubs}`} sub="Subscription ที่ active" color="#3b82f6" />
          </div>
        </div>

        {/* ─── Row 4: Topics + Activity ─── */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Topics */}
          <div className="rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]">
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">หัวข้อยอดนิยม</h3>
            <div className="space-y-2.5">
              {(!s.topTopics || s.topTopics.length === 0) ? (
                <p className="text-white/15 text-xs">ยังไม่มีข้อมูล</p>
              ) : s.topTopics.map(([name, count], i) => {
                const maxTopic = s.topTopics[0][1];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">{name}</span>
                      <span className="text-[10px] text-[#d4af37]/50 font-mono">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-[#d4af37]/30" style={{ width: `${(count / maxTopic) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spreads */}
          <div className="rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]">
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">รูปแบบยอดนิยม</h3>
            <div className="space-y-2.5">
              {(!s.topSpreads || s.topSpreads.length === 0) ? (
                <p className="text-white/15 text-xs">ยังไม่มีข้อมูล</p>
              ) : s.topSpreads.map(([name, count], i) => {
                const maxSpread = s.topSpreads[0][1];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">{name}</span>
                      <span className="text-[10px] text-[#d4af37]/50 font-mono">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-[#8b5cf6]/30" style={{ width: `${(count / maxSpread) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]">
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">กิจกรรมล่าสุด</h3>
            <div className="space-y-3">
              {(!s.recentActivity || s.recentActivity.length === 0) ? (
                <p className="text-white/15 text-xs">ยังไม่มีกิจกรรม</p>
              ) : s.recentActivity.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/60 truncate">{a.text}</p>
                    <p className="text-[9px] text-white/20">{timeAgo(a.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Row 5: Payment breakdown + Quick actions ─── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Payment methods */}
          {s.methodBreakdown && Object.keys(s.methodBreakdown).length > 0 && (
            <div className="col-span-2 rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">วิธีชำระเงิน</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(s.methodBreakdown).map(([method, data]) => {
                  const LABELS: Record<string, string> = { promptpay: "PromptPay", card: "บัตรเครดิต", truemoney: "TrueMoney", manual: "เติมเครดิต" };
                  return (
                    <div key={method} className="rounded-lg p-4 bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-xs text-white/50 mb-1">{LABELS[method] || method}</p>
                      <p className="text-[#d4af37] text-lg font-bold">฿{data.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-white/20">{data.count} รายการ</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]">
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">ทางลัด</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/healers", label: "จัดการหมอดู", icon: "sparkles" },
                { href: "/admin/bookings", label: "ดูการจอง", icon: "calendar-check" },
                { href: "/admin/credits", label: "เครดิต", icon: "star" },
                { href: "/admin/products", label: "สินค้า", icon: "sparkle" },
                { href: "/admin/orders", label: "คำสั่งซื้อ", icon: "package" },
                { href: "/admin/settings", label: "ตั้งค่า", icon: "settings" },
              ].map((q) => (
                <Link key={q.href} href={q.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                  <Icon name={q.icon} size={14} className="text-white/25" />
                  <span className="text-[11px] text-white/50">{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ─── AI Cost note ─── */}
        <div className="mt-4 flex items-center justify-between rounded-lg px-4 py-2.5 bg-white/[0.015] border border-white/[0.03]">
          <span className="text-[10px] text-white/20">ค่าใช้จ่าย AI (ประมาณ): ${s.estimatedCost.toFixed(2)} • Tokens: {s.totalTokens?.toLocaleString?.() || "0"}</span>
          <span className="text-[10px] text-white/15">ผู้ใช้ใหม่สัปดาห์นี้: {s.newUsersWeek}</span>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, today, todayLabel, color, href }: {
  icon: string; label: string; value: number | string; today?: number | string; todayLabel?: string; color: string; href: string;
}) {
  return (
    <Link href={href} className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <Icon name={icon} size={16} className="text-white/15 group-hover:text-white/25 transition-colors" />
        <span className="text-[9px] text-white/15 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {today !== undefined && (
        <p className="text-[10px] text-white/25 mt-1">
          {typeof today === "number" ? `+${today}` : today} {todayLabel || "วันนี้"}
        </p>
      )}
    </Link>
  );
}

function MiniCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl px-4 py-3 border border-white/[0.04] bg-white/[0.02]">
      <p className="text-[9px] text-white/25 uppercase tracking-wider">{label}</p>
      <p className="text-base font-bold mt-0.5" style={{ color }}>{value}</p>
      <p className="text-[9px] text-white/15 mt-0.5">{sub}</p>
    </div>
  );
}

function AlertBadge({ href, color, count, label }: { href: string; color: string; count: number; label: string }) {
  const colors: Record<string, string> = {
    yellow: "bg-yellow-400/[0.06] border-yellow-400/15 text-yellow-400/80",
    orange: "bg-orange-400/[0.06] border-orange-400/15 text-orange-400/80",
    blue: "bg-blue-400/[0.06] border-blue-400/15 text-blue-400/80",
    red: "bg-red-400/[0.06] border-red-400/15 text-red-400/80",
  };
  const dotColors: Record<string, string> = { yellow: "bg-yellow-400", orange: "bg-orange-400", blue: "bg-blue-400", red: "bg-red-400" };
  return (
    <Link href={href} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-opacity hover:opacity-80 ${colors[color]}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${dotColors[color]}`} />
      <span className="text-xs font-medium">{count}</span>
      <span className="text-xs">{label}</span>
    </Link>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
