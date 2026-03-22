"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Stats {
  totalReadings: number;
  todayReadings: number;
  userCount: number;
  estimatedCost: number;
  totalRevenue: number;
  totalCreditsIssued: number;
  pendingPayments: number;
  methodBreakdown: Record<string, { count: number; amount: number }>;
  last7: { date: string; count: number; tokens: number }[];
  topTopics: [string, number][];
  topSpreads: [string, number][];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const maxDayCount = stats?.last7 ? Math.max(...stats.last7.map((d) => d.count), 1) : 1;

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <h2 className="text-xl font-semibold mb-6">แดชบอร์ด</h2>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : !stats ? (
          <p className="text-white/40">ไม่สามารถโหลดข้อมูลได้</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="คำทำนายทั้งหมด" value={stats.totalReadings.toLocaleString()} />
              <StatCard label="วันนี้" value={stats.todayReadings.toLocaleString()} />
              <StatCard label="ผู้ใช้ทั้งหมด" value={(stats.userCount || 0).toLocaleString()} />
              <StatCard label="ค่าใช้จ่ายโดยประมาณ" value={`$${(stats.estimatedCost || 0).toFixed(2)}`} />
            </div>

            {/* Payment Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard label="รายได้รวม" value={`฿${(stats.totalRevenue || 0).toLocaleString()}`} />
              <StatCard label="เครดิตที่ออก" value={(stats.totalCreditsIssued || 0).toLocaleString()} />
              {(stats.pendingPayments || 0) > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
                  <p className="text-yellow-400/60 text-xs mb-2 uppercase tracking-wider">ธุรกรรมรอดำเนินการ</p>
                  <p className="text-yellow-400 text-2xl font-semibold">{stats.pendingPayments.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Method Breakdown */}
            {stats.methodBreakdown && Object.keys(stats.methodBreakdown).length > 0 && (
              <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5 mb-8">
                <h3 className="text-sm text-white/50 mb-4">วิธีชำระเงิน</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.methodBreakdown).map(([method, data]) => (
                    <div key={method} className="bg-[#1e0c0c] border border-white/10 rounded-lg p-4">
                      <p className="text-white/60 text-sm font-medium mb-2 capitalize">{method}</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-gold text-lg font-semibold">฿{data.amount.toLocaleString()}</span>
                        <span className="text-white/30 text-xs">{data.count} รายการ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
                <h3 className="text-sm text-white/50 mb-5">7 วันล่าสุด</h3>
                <div className="flex items-end gap-3 h-40">
                  {(stats.last7 || []).map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-white/40">{day.count}</span>
                      <div
                        className="w-full bg-gold/20 rounded-t-md transition-all"
                        style={{
                          height: `${(day.count / maxDayCount) * 100}%`,
                          minHeight: day.count > 0 ? "4px" : "0px",
                        }}
                      />
                      <span className="text-[10px] text-white/30">
                        {new Date(day.date + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Topics & Spreads */}
              <div className="space-y-6">
                <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
                  <h3 className="text-sm text-white/50 mb-4">หัวข้อยอดนิยม</h3>
                  <div className="space-y-3">
                    {(!stats.topTopics || stats.topTopics.length === 0) && (
                      <p className="text-white/20 text-sm">ยังไม่มีข้อมูล</p>
                    )}
                    {(stats.topTopics || []).map(([name, count], i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70 truncate mr-3">{name}</span>
                        <span className="text-gold text-xs font-mono">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
                  <h3 className="text-sm text-white/50 mb-4">Spread ยอดนิยม</h3>
                  <div className="space-y-3">
                    {(!stats.topSpreads || stats.topSpreads.length === 0) && (
                      <p className="text-white/20 text-sm">ยังไม่มีข้อมูล</p>
                    )}
                    {(stats.topSpreads || []).map(([name, count], i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70 truncate mr-3">{name}</span>
                        <span className="text-gold text-xs font-mono">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
      <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">{label}</p>
      <p className="text-gold text-2xl font-semibold">{value}</p>
    </div>
  );
}
