"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import AdminDatePicker from "@/components/admin/AdminDatePicker";

interface TransactionUser {
  displayName: string;
  pictureUrl: string;
  credits: number;
}

interface Transaction {
  id: string;
  userId: string;
  username: string;
  chargeId: string;
  method: string;
  amount: number;
  credits: number;
  status: "pending" | "successful" | "failed" | "expired";
  createdAt: number;
  completedAt?: number;
  user: TransactionUser | null;
}

const STATUS_CONFIG: Record<
  Transaction["status"],
  { label: string; bg: string; text: string }
> = {
  pending: { label: "รอดำเนินการ", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  successful: { label: "สำเร็จ", bg: "bg-green-500/10", text: "text-green-400" },
  failed: { label: "ล้มเหลว", bg: "bg-red-500/10", text: "text-red-400" },
  expired: { label: "หมดอายุ", bg: "bg-white/5", text: "text-white/40" },
};

const METHOD_LABELS: Record<string, string> = {
  promptpay: "PromptPay",
  card: "บัตรเครดิต",
  truemoney: "TrueMoney",
  manual: "เติมมือ",
};

type QuickRange = "today" | "week" | "month" | "";

function getDateRange(range: QuickRange): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  if (range === "today") return { from: to, to };
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { from: d.toISOString().slice(0, 10), to };
  }
  if (range === "month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { from: d.toISOString().slice(0, 10), to };
  }
  return { from: "", to: "" };
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [quickRange, setQuickRange] = useState<QuickRange>("");
  const limit = 20;

  const fetchData = useCallback(
    (p: number) => {
      setLoading(true);
      const params = new URLSearchParams({
        offset: String((p - 1) * limit),
        limit: String(limit),
      });
      if (filterStatus) params.set("status", filterStatus);
      if (filterMethod) params.set("method", filterMethod);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (search) params.set("search", search);

      fetch(`/api/admin/transactions?${params}`)
        .then((res) => {
          if (res.status === 401) { router.push("/admin/login"); return null; }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setTransactions(data.transactions ?? []);
            setTotal(data.total ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [router, filterStatus, filterMethod, dateFrom, dateTo, search]
  );

  useEffect(() => { fetchData(page); }, [page, fetchData]);
  useEffect(() => { setPage(1); }, [filterStatus, filterMethod, dateFrom, dateTo, search]);

  function handleQuickRange(range: QuickRange) {
    if (quickRange === range) {
      setQuickRange("");
      setDateFrom("");
      setDateTo("");
    } else {
      setQuickRange(range);
      const { from, to } = getDateRange(range);
      setDateFrom(from);
      setDateTo(to);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function clearFilters() {
    setFilterStatus("");
    setFilterMethod("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSearchInput("");
    setQuickRange("");
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatAmount(satang: number) {
    return (satang / 100).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const hasFilters = filterStatus || filterMethod || dateFrom || dateTo || search;
  const totalPages = Math.ceil(total / limit);

  // Stats from current page data
  const successful = transactions.filter((t) => t.status === "successful");
  const pending = transactions.filter((t) => t.status === "pending");
  const failed = transactions.filter((t) => t.status === "failed");
  const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = successful.reduce((sum, t) => sum + t.credits, 0);
  const avgAmount = successful.length > 0 ? totalRevenue / successful.length : 0;

  // Revenue by method
  const revenueByMethod: Record<string, { amount: number; count: number }> = {};
  for (const t of successful) {
    if (!revenueByMethod[t.method]) revenueByMethod[t.method] = { amount: 0, count: 0 };
    revenueByMethod[t.method].amount += t.amount;
    revenueByMethod[t.method].count++;
  }

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">รายการชำระเงิน</h2>
            <p className="text-white/30 text-sm mt-1">ทั้งหมด {total.toLocaleString()} รายการ</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">รายได้รวม</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">{formatAmount(totalRevenue)}</p>
            <p className="text-white/20 text-xs mt-0.5">THB</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">เครดิตที่เติม</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCredits.toLocaleString()}</p>
            <p className="text-white/20 text-xs mt-0.5">เครดิต</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">เฉลี่ยต่อรายการ</p>
            <p className="text-2xl font-bold text-white mt-1">{formatAmount(avgAmount)}</p>
            <p className="text-white/20 text-xs mt-0.5">THB</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">สถานะ</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded">
                สำเร็จ {successful.length}
              </span>
              {pending.length > 0 && (
                <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-0.5 rounded">
                  รอ {pending.length}
                </span>
              )}
              {failed.length > 0 && (
                <span className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded">
                  ล้มเหลว {failed.length}
                </span>
              )}
            </div>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">รายได้ตามช่องทาง</p>
            <div className="space-y-1 mt-2">
              {Object.entries(revenueByMethod)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([method, data]) => (
                  <div key={method} className="flex justify-between text-xs">
                    <span className="text-white/50">{METHOD_LABELS[method] || method}</span>
                    <span className="text-[#d4af37]/70 font-mono">{formatAmount(data.amount)}฿ ({data.count})</span>
                  </div>
                ))}
              {Object.keys(revenueByMethod).length === 0 && (
                <span className="text-white/15 text-xs">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Range + Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Quick Range Buttons */}
          <div className="flex gap-1.5">
            {([["today", "วันนี้"], ["week", "7 วัน"], ["month", "30 วัน"]] as [QuickRange, string][]).map(
              ([range, label]) => (
                <button
                  key={range}
                  onClick={() => handleQuickRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    quickRange === range
                      ? "bg-[#d4af37]/20 text-[#d4af37]"
                      : "bg-[#111111] text-white/40 hover:text-white/60"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/30 w-44"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
            >
              ค้นหา
            </button>
          </form>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-[#d4af37]/30"
          >
            <option value="">ทุกสถานะ</option>
            <option value="successful">สำเร็จ</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="failed">ล้มเหลว</option>
            <option value="expired">หมดอายุ</option>
          </select>

          {/* Method filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-[#d4af37]/30"
          >
            <option value="">ทุกวิธีชำระ</option>
            <option value="promptpay">PromptPay</option>
            <option value="card">บัตรเครดิต</option>
            <option value="truemoney">TrueMoney</option>
            <option value="manual">เติมมือ</option>
          </select>

          {/* Date range */}
          <AdminDatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); setQuickRange(""); }} placeholder="จากวันที่" />
          <AdminDatePicker value={dateTo} onChange={(v) => { setDateTo(v); setQuickRange(""); }} placeholder="ถึงวันที่" />

          {hasFilters && (
            <button onClick={clearFilters} className="text-white/30 hover:text-white/60 text-xs transition-colors">
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Table */}
        {loading && transactions.length === 0 ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-[#111111] rounded-xl p-10 text-center text-white/20 text-sm">
            ไม่พบรายการ
          </div>
        ) : (
          <>
            <div className="bg-[#111111] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[180px_1fr_100px_100px_80px_90px] gap-3 px-5 py-3 text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                <span>ผู้ใช้</span>
                <span>วิธีชำระ</span>
                <span className="text-right">จำนวน</span>
                <span className="text-right">เครดิต</span>
                <span className="text-center">สถานะ</span>
                <span className="text-right">เวลา</span>
              </div>

              {transactions.map((t) => {
                const statusCfg = STATUS_CONFIG[t.status];
                return (
                  <div key={t.id}>
                    <div
                      className="grid grid-cols-[180px_1fr_100px_100px_80px_90px] gap-3 px-5 py-3 text-sm hover:bg-[#d4af37]/[0.02] cursor-pointer transition-colors items-center border-b border-white/[0.03]"
                      onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    >
                      {/* User */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {t.user?.pictureUrl ? (
                          <img
                            src={t.user.pictureUrl}
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
                            {t.user?.displayName || t.username || "-"}
                          </p>
                          <p className="text-white/20 text-[10px] truncate">{t.userId?.slice(0, 8)}</p>
                        </div>
                      </div>

                      {/* Method */}
                      <span className="text-white/50 text-xs">
                        {METHOD_LABELS[t.method] ?? t.method}
                      </span>

                      {/* Amount */}
                      <span className="text-right text-white/70 font-mono text-xs">
                        {formatAmount(t.amount)} ฿
                      </span>

                      {/* Credits */}
                      <span className="text-right">
                        <span className="inline-block bg-[#d4af37]/10 text-[#d4af37] text-xs font-mono px-2 py-0.5 rounded">
                          +{t.credits}
                        </span>
                      </span>

                      {/* Status */}
                      <span className="text-center">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </span>

                      {/* Date */}
                      <span className="text-white/30 text-[11px] text-right">{formatDate(t.createdAt)}</span>
                    </div>

                    {/* Expanded */}
                    {expandedId === t.id && (
                      <div className="px-5 py-4 bg-white/[0.01] border-b border-white/[0.03]">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Left — User info */}
                          <div className="space-y-3">
                            {t.user && (
                              <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                                {t.user.pictureUrl ? (
                                  <img
                                    src={t.user.pictureUrl}
                                    alt=""
                                    className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                    ?
                                  </div>
                                )}
                                <div>
                                  <p className="text-white/80 font-medium">{t.user.displayName}</p>
                                  <p className="text-[#d4af37]/50 text-xs">เครดิตคงเหลือ: {t.user.credits}</p>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">User ID</p>
                                <p className="text-white/50 text-xs font-mono break-all">{t.userId}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">Username</p>
                                <p className="text-white/50 text-xs">{t.username || "-"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right — Transaction details */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">Charge ID</p>
                                <p className="text-white/50 text-xs font-mono break-all">{t.chargeId || "-"}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">วิธีชำระ</p>
                                <p className="text-white/50 text-xs">{METHOD_LABELS[t.method] ?? t.method}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">จำนวนเงิน</p>
                                <p className="text-white/70 text-sm font-mono">{formatAmount(t.amount)} ฿</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">เครดิตที่ได้</p>
                                <p className="text-[#d4af37] text-sm font-mono">+{t.credits}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">สร้างเมื่อ</p>
                                <p className="text-white/50 text-xs">{formatDate(t.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">สำเร็จเมื่อ</p>
                                <p className="text-white/50 text-xs">
                                  {t.completedAt ? formatDate(t.completedAt) : "-"}
                                </p>
                              </div>
                            </div>
                            {t.completedAt && t.createdAt && (
                              <div>
                                <p className="text-white/30 text-xs mb-0.5">ระยะเวลา</p>
                                <p className="text-white/40 text-xs">
                                  {Math.round((t.completedAt - t.createdAt) / 1000)} วินาที
                                </p>
                              </div>
                            )}
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
