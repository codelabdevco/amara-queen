"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import AdminDatePicker from "@/components/admin/AdminDatePicker";

interface ReadingUser {
  displayName: string;
  pictureUrl: string;
  credits: number;
}

interface Reading {
  id: string;
  timestamp: number;
  topic: string;
  topicIcon: string;
  spread: string;
  question: string;
  trend: string;
  trendText: string;
  summary: string;
  advice: string;
  userId: string | null;
  cardInsights: string[];
  cards?: { nameTh: string; nameEn: string; isReversed: boolean; positionName: string }[];
  modelUsed?: string;
  tokensUsed?: number;
  ip?: string;
  user: ReadingUser | null;
  creditCost: number;
}

interface ReadingsResponse {
  readings: Reading[];
  total: number;
}

const TREND_MAP: Record<string, { label: string; color: string; bg: string }> = {
  very_positive: { label: "ดีมาก", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  positive: { label: "ดี", color: "text-green-400", bg: "bg-green-400/10" },
  neutral: { label: "กลาง", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  caution: { label: "ระวัง", color: "text-orange-400", bg: "bg-orange-400/10" },
  challenging: { label: "ท้าทาย", color: "text-red-400", bg: "bg-red-400/10" },
};

const TOPICS = ["ความรัก", "การงาน", "การเงิน", "สุขภาพ", "ภาพรวม"];

export default function AdminReadingsPage() {
  const router = useRouter();
  const [data, setData] = useState<ReadingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 20;

  const fetchReadings = useCallback(
    (p: number) => {
      setLoading(true);
      const params = new URLSearchParams({
        offset: String((p - 1) * limit),
        limit: String(limit),
      });
      if (filterTopic) params.set("topic", filterTopic);
      if (filterDate) params.set("date", filterDate);
      if (search) params.set("search", search);

      fetch(`/api/admin/readings?${params}`)
        .then((res) => {
          if (res.status === 401) { router.push("/admin/login"); return null; }
          return res.json();
        })
        .then((d) => { if (d) setData(d); })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [router, filterTopic, filterDate, search]
  );

  useEffect(() => {
    fetchReadings(page);
  }, [page, fetchReadings]);

  useEffect(() => { setPage(1); }, [filterTopic, filterDate, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบคำทำนายนี้?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/readings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchReadings(page);
        if (expandedId === id) setExpandedId(null);
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(iso: string | number) {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalPages = Math.ceil((data?.total || 0) / limit);

  // Stats summary
  const stats = data
    ? {
        total: data.total,
        totalCredits: data.readings.reduce((sum, r) => sum + r.creditCost, 0),
        uniqueUsers: new Set(data.readings.filter((r) => r.userId).map((r) => r.userId)).size,
        trendBreakdown: data.readings.reduce(
          (acc, r) => {
            acc[r.trend] = (acc[r.trend] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      }
    : null;

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">คำทำนาย</h2>
            {data && (
              <p className="text-white/30 text-sm mt-1">
                ทั้งหมด {data.total.toLocaleString()} รายการ
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && data && data.readings.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#111111] rounded-xl p-4">
              <p className="text-white/30 text-xs">รายการในหน้านี้</p>
              <p className="text-2xl font-bold text-white mt-1">{data.readings.length}</p>
            </div>
            <div className="bg-[#111111] rounded-xl p-4">
              <p className="text-white/30 text-xs">เครดิตที่ใช้ (หน้านี้)</p>
              <p className="text-2xl font-bold text-[#d4af37] mt-1">{stats.totalCredits}</p>
            </div>
            <div className="bg-[#111111] rounded-xl p-4">
              <p className="text-white/30 text-xs">ผู้ใช้ (หน้านี้)</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.uniqueUsers}</p>
            </div>
            <div className="bg-[#111111] rounded-xl p-4">
              <p className="text-white/30 text-xs">แนวโน้มส่วนใหญ่</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.entries(stats.trendBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([trend, count]) => {
                    const t = TREND_MAP[trend] || { label: trend, color: "text-white/50", bg: "bg-white/5" };
                    return (
                      <span key={trend} className={`${t.bg} ${t.color} text-xs px-2 py-0.5 rounded`}>
                        {t.label} ({count})
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="ค้นหาคำถาม..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/30 w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
            >
              ค้นหา
            </button>
          </form>

          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-[#d4af37]/30"
          >
            <option value="">ทุกหัวข้อ</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <AdminDatePicker value={filterDate} onChange={setFilterDate} placeholder="เลือกวันที่" />

          {(filterTopic || filterDate || search) && (
            <button
              onClick={() => {
                setFilterTopic("");
                setFilterDate("");
                setSearch("");
                setSearchInput("");
              }}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Table */}
        {loading && !data ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : !data ? (
          <p className="text-white/40">ไม่สามารถโหลดข้อมูลได้</p>
        ) : (
          <>
            <div className="bg-[#111111] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[180px_200px_1fr_100px_80px_60px] gap-3 px-5 py-3 text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                <span>ผู้ใช้</span>
                <span>หัวข้อ / การ์ด</span>
                <span>คำถาม</span>
                <span>แนวโน้ม</span>
                <span>เครดิต</span>
                <span></span>
              </div>

              {data.readings.length === 0 && (
                <div className="px-5 py-10 text-center text-white/20 text-sm">ยังไม่มีคำทำนาย</div>
              )}

              {data.readings.map((r) => {
                const trend = TREND_MAP[r.trend] || { label: r.trend, color: "text-white/50", bg: "bg-white/5" };

                return (
                  <div key={r.id}>
                    <div
                      className="grid grid-cols-[180px_200px_1fr_100px_80px_60px] gap-3 px-5 py-3 text-sm hover:bg-[#d4af37]/[0.02] cursor-pointer transition-colors items-center border-b border-white/[0.03]"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                      {/* User */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {r.user?.pictureUrl ? (
                          <img
                            src={r.user.pictureUrl}
                            alt=""
                            className="w-8 h-8 rounded-full shrink-0 object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full shrink-0 bg-white/5 flex items-center justify-center text-white/20 text-xs">
                            ?
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white/70 text-sm truncate">
                            {r.user?.displayName || "Guest"}
                          </p>
                          <p className="text-white/25 text-[10px]">{formatDate(r.timestamp)}</p>
                        </div>
                      </div>

                      {/* Topic + Spread */}
                      <div className="min-w-0">
                        <p className="text-white/70 text-sm truncate">
                          {r.topicIcon} {r.topic}
                        </p>
                        <p className="text-white/30 text-xs truncate">{r.spread}</p>
                      </div>

                      {/* Question */}
                      <p className="text-white/50 text-sm truncate">{r.question}</p>

                      {/* Trend */}
                      <span className={`${trend.bg} ${trend.color} text-xs px-2 py-0.5 rounded w-fit`}>
                        {trend.label}
                      </span>

                      {/* Credits */}
                      <span className="text-[#d4af37]/60 text-xs">-{r.creditCost} cr</span>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.id);
                        }}
                        disabled={deleting === r.id}
                        className="text-red-400/30 hover:text-red-400 text-xs transition-colors disabled:opacity-30"
                      >
                        {deleting === r.id ? "..." : "ลบ"}
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {expandedId === r.id && (
                      <div className="px-5 py-4 bg-white/[0.01] border-b border-white/[0.03]">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Left — User + Reading info */}
                          <div className="space-y-4">
                            {/* User card */}
                            {r.user && (
                              <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                                {r.user.pictureUrl ? (
                                  <img
                                    src={r.user.pictureUrl}
                                    alt=""
                                    className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                    ?
                                  </div>
                                )}
                                <div>
                                  <p className="text-white/80 font-medium">{r.user.displayName}</p>
                                  <p className="text-[#d4af37]/50 text-xs">
                                    เครดิตคงเหลือ: {r.user.credits}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Question */}
                            <div>
                              <p className="text-white/30 text-xs mb-1">คำถาม</p>
                              <p className="text-white/70 text-sm">{r.question}</p>
                            </div>

                            {/* Cards */}
                            {r.cardInsights && r.cardInsights.length > 0 && (
                              <div>
                                <p className="text-white/30 text-xs mb-1.5">ไพ่ที่ได้</p>
                                <div className="space-y-1.5">
                                  {r.cardInsights.map((c, i) => (
                                    <div key={i} className="flex gap-2">
                                      <span className="text-[#d4af37]/40 text-xs shrink-0 mt-0.5">
                                        {r.cards?.[i]?.positionName || `ใบที่ ${i + 1}`}
                                      </span>
                                      <p className="text-white/50 text-xs leading-relaxed">{c}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right — AI Response */}
                          <div className="space-y-4">
                            {r.trendText && (
                              <div>
                                <p className="text-white/30 text-xs mb-1">แนวโน้ม</p>
                                <p className={`text-sm ${TREND_MAP[r.trend]?.color || "text-white/50"}`}>
                                  {r.trendText}
                                </p>
                              </div>
                            )}

                            {r.summary && (
                              <div>
                                <p className="text-white/30 text-xs mb-1">คำทำนาย</p>
                                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                                  {r.summary}
                                </p>
                              </div>
                            )}

                            {r.advice && (
                              <div>
                                <p className="text-white/30 text-xs mb-1">คำแนะนำ</p>
                                <p className="text-white/60 text-sm leading-relaxed">{r.advice}</p>
                              </div>
                            )}

                            {/* Meta info */}
                            <div className="flex gap-4 pt-2 border-t border-white/5">
                              {r.modelUsed && (
                                <span className="text-white/15 text-[10px]">Model: {r.modelUsed}</span>
                              )}
                              {r.tokensUsed && (
                                <span className="text-white/15 text-[10px]">
                                  Tokens: {r.tokensUsed.toLocaleString()}
                                </span>
                              )}
                              <span className="text-white/15 text-[10px]">
                                เครดิต: -{r.creditCost}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <span className="text-white/40 text-sm px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
