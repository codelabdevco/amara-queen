"use client";

import { useEffect, useState, useMemo } from "react";
import AdminNav from "@/components/admin/AdminNav";
import AdminDatePicker from "@/components/admin/AdminDatePicker";

interface Booking {
  id: string;
  userId: string;
  healerId: string;
  date: string;
  timeSlot: string;
  sessionMinutes: number;
  creditCost: number;
  status: string;
  note: string;
  adminNote: string;
  createdAt: number;
  updatedAt: number;
  userName: string;
  userPicture: string;
  healerName: string;
  healerTitle: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalCredits: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "รอยืนยัน", color: "text-yellow-400 bg-yellow-400/10" },
  confirmed: { label: "ยืนยันแล้ว", color: "text-blue-400 bg-blue-400/10" },
  completed: { label: "เสร็จสิ้น", color: "text-green-400 bg-green-400/10" },
  cancelled: { label: "ยกเลิก", color: "text-red-400 bg-red-400/10" },
  no_show: { label: "ไม่มา", color: "text-orange-400 bg-orange-400/10" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  function refresh() {
    const params = new URLSearchParams();
    params.set("limit", "9999");
    if (statusFilter) params.set("status", statusFilter);
    if (dateFilter) params.set("date", dateFilter);
    if (search) params.set("search", search);

    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setBookings(d.bookings || []);
        setStats(d.stats || stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, [statusFilter, dateFilter]);

  async function handleStatusChange(bookingId: string, status: string, adminNote?: string) {
    await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status, adminNote }),
    });
    refresh();
  }

  const filtered = useMemo(() => {
    if (!search) return bookings;
    const s = search.toLowerCase();
    return bookings.filter((b) =>
      b.userName.toLowerCase().includes(s) ||
      b.healerName.toLowerCase().includes(s) ||
      b.note.toLowerCase().includes(s)
    );
  }, [bookings, search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const cardClass = "rounded-xl p-4 border border-white/[0.04]";

  return (
    <div className="min-h-screen text-white/80" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6">
        <h2 className="text-lg font-semibold text-white/90 mb-6">การจองทั้งหมด</h2>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: "ทั้งหมด", value: stats.total, color: "#d4af37" },
            { label: "รอยืนยัน", value: stats.pending, color: "#eab308" },
            { label: "ยืนยันแล้ว", value: stats.confirmed, color: "#3b82f6" },
            { label: "เสร็จสิ้น", value: stats.completed, color: "#22c55e" },
            { label: "ยกเลิก", value: stats.cancelled, color: "#ef4444" },
            { label: "เครดิตรวม", value: stats.totalCredits, color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className={`${cardClass} bg-white/[0.02]`}>
              <p className="text-[10px] text-white/40 mb-1">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <input
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 w-64 focus:outline-none focus:border-[#d4af37]/40"
            placeholder="ค้นหาชื่อ / หมอดู / โน้ต..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#d4af37]/40"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">สถานะทั้งหมด</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <AdminDatePicker value={dateFilter} onChange={(v) => { setDateFilter(v); setPage(1); }} placeholder="วันที่" />
        </div>

        {loading ? (
          <p className="text-center text-white/30 py-20">กำลังโหลด...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center text-white/30 py-20">ไม่พบการจอง</p>
        ) : (
          <div className="space-y-2">
            {paginated.map((b) => {
              const st = STATUS_MAP[b.status] || { label: b.status, color: "text-white/40 bg-white/[0.04]" };
              const isExpanded = expanded === b.id;

              return (
                <div key={b.id} className={`${cardClass} bg-white/[0.02] hover:bg-white/[0.03] transition-colors cursor-pointer`}
                  onClick={() => setExpanded(isExpanded ? null : b.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {b.userPicture ? (
                        <img src={b.userPicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/20 text-sm">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80 font-medium">{b.userName}</span>
                        <span className="text-xs text-white/30">→</span>
                        <span className="text-sm text-[#d4af37]/70">{b.healerTitle} {b.healerName}</span>
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {b.date} เวลา {b.timeSlot} ({b.sessionMinutes} นาที) • {b.creditCost} เครดิต
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs ${st.color}`}>{st.label}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-3" onClick={(e) => e.stopPropagation()}>
                      {b.note && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">โน้ตจากผู้ใช้</p>
                          <p className="text-sm text-white/70 bg-white/[0.02] rounded-lg p-3">{b.note}</p>
                        </div>
                      )}
                      <div className="text-xs text-white/30">
                        สร้างเมื่อ: {new Date(b.createdAt).toLocaleString("th-TH")}
                        {b.updatedAt !== b.createdAt && ` • อัปเดต: ${new Date(b.updatedAt).toLocaleString("th-TH")}`}
                      </div>
                      <div className="flex gap-2">
                        {b.status === "confirmed" && (
                          <>
                            <button onClick={() => handleStatusChange(b.id, "completed")}
                              className="px-3 py-1.5 rounded-lg text-xs bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors">
                              เสร็จสิ้น
                            </button>
                            <button onClick={() => handleStatusChange(b.id, "no_show")}
                              className="px-3 py-1.5 rounded-lg text-xs bg-orange-400/10 text-orange-400 hover:bg-orange-400/20 transition-colors">
                              ไม่มา
                            </button>
                          </>
                        )}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <button onClick={() => { if (confirm("ยืนยันยกเลิก? เครดิตจะถูกคืน")) handleStatusChange(b.id, "cancelled"); }}
                            className="px-3 py-1.5 rounded-lg text-xs bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                            ยกเลิก (คืนเครดิต)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors">
              ← ก่อนหน้า
            </button>
            <span className="text-xs text-white/40">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors">
              ถัดไป →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
