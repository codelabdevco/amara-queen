"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

type Status = "pending" | "approved" | "rejected";

interface RequestUser {
  displayName: string;
  pictureUrl: string;
  credits: number;
}

interface TopUpRequest {
  id: string;
  username: string;
  userId: string;
  credits: number;
  price: number;
  paymentRef: string;
  status: Status;
  createdAt: number;
  processedAt?: number;
  user: RequestUser | null;
}

interface Stats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalIssued: number;
  totalRevenue: number;
}

const EMPTY_STATS: Stats = { totalPending: 0, totalApproved: 0, totalRejected: 0, totalIssued: 0, totalRevenue: 0 };

export default function AdminCreditsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Status>("pending");
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Manual credit add
  const [manualUser, setManualUser] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualMsg, setManualMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [addingManual, setAddingManual] = useState(false);

  const fetchRequests = useCallback(
    (p: number) => {
      setLoading(true);
      const params = new URLSearchParams({
        status: tab,
        offset: String((p - 1) * limit),
        limit: String(limit),
      });
      fetch(`/api/admin/topup?${params}`)
        .then((res) => {
          if (res.status === 401) { router.push("/admin/login"); return null; }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setRequests(data.requests ?? []);
            setTotal(data.total ?? 0);
            if (data.stats) setStats(data.stats);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [tab, router]
  );

  useEffect(() => { fetchRequests(page); }, [page, fetchRequests]);
  useEffect(() => { setPage(1); }, [tab]);

  async function handleAction(requestId: string, action: "approve" | "reject") {
    setActing(requestId);
    try {
      const actionMap = { approve: "approved", reject: "rejected" } as const;
      const res = await fetch("/api/admin/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: actionMap[action] }),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (res.ok) fetchRequests(page);
    } catch {}
    setActing(null);
  }

  async function handleManualAdd() {
    const amount = parseInt(manualAmount, 10);
    if (!manualUser.trim() || !amount || amount <= 0) return;
    setAddingManual(true);
    setManualMsg(null);
    try {
      const res = await fetch("/api/admin/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: manualUser.trim(), manualCredits: amount }),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (res.ok) {
        setManualMsg({ text: `เพิ่ม ${amount} เครดิตสำเร็จ (คงเหลือ ${data.newBalance})`, ok: true });
        setManualUser("");
        setManualAmount("");
        fetchRequests(page);
      } else {
        setManualMsg({ text: data.error || "เกิดข้อผิดพลาด", ok: false });
      }
    } catch {
      setManualMsg({ text: "เกิดข้อผิดพลาด", ok: false });
    }
    setAddingManual(false);
  }

  function formatDate(ts: number | string) {
    return new Date(ts).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalPages = Math.ceil(total / limit);

  const tabs: { key: Status; label: string; count: number }[] = [
    { key: "pending", label: "รออนุมัติ", count: stats.totalPending },
    { key: "approved", label: "อนุมัติแล้ว", count: stats.totalApproved },
    { key: "rejected", label: "ปฏิเสธ", count: stats.totalRejected },
  ];

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">เครดิต</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">รออนุมัติ</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.totalPending}</p>
            <p className="text-white/20 text-xs mt-0.5">คำขอ</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">อนุมัติแล้ว</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.totalApproved}</p>
            <p className="text-white/20 text-xs mt-0.5">คำขอ</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">เครดิตที่ออกทั้งหมด</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">{stats.totalIssued.toLocaleString()}</p>
            <p className="text-white/20 text-xs mt-0.5">เครดิต</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">รายได้จากเติมเครดิต</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/20 text-xs mt-0.5">THB</p>
          </div>
        </div>

        {/* Manual add credits */}
        <div className="bg-[#111111] rounded-xl p-5 mb-6">
          <p className="text-white/50 text-sm font-medium mb-3">เพิ่มเครดิตด้วยมือ</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="User ID"
              value={manualUser}
              onChange={(e) => setManualUser(e.target.value)}
              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#d4af37]/30"
            />
            <input
              type="number"
              placeholder="จำนวน"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="w-28 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#d4af37]/30"
            />
            <button
              onClick={handleManualAdd}
              disabled={addingManual || !manualUser.trim() || !manualAmount}
              className="px-4 py-2 rounded-lg bg-[#d4af37]/10 text-[#d4af37] text-sm font-medium hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30"
            >
              {addingManual ? "กำลังเพิ่ม..." : "เพิ่มเครดิต"}
            </button>
          </div>
          {manualMsg && (
            <p className={`text-xs mt-2 ${manualMsg.ok ? "text-green-400" : "text-red-400"}`}>{manualMsg.text}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                tab === t.key
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-[#d4af37]/20" : "bg-white/5"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading && requests.length === 0 ? (
          <div className="flex items-center gap-3 text-white/30 py-8">
            <div className="w-4 h-4 border-2 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#111111] rounded-xl p-10 text-center text-white/20 text-sm">
            ไม่มีรายการ
          </div>
        ) : (
          <>
            <div className="bg-[#111111] rounded-xl overflow-hidden">
              {/* Header */}
              <div className={`grid ${tab === "pending" ? "grid-cols-[200px_1fr_80px_80px_140px_150px]" : "grid-cols-[200px_1fr_80px_80px_140px_100px]"} gap-3 px-5 py-3 text-xs text-white/30 uppercase tracking-wider border-b border-white/5`}>
                <span>ผู้ใช้</span>
                <span>อ้างอิงการชำระ</span>
                <span className="text-right">เครดิต</span>
                <span className="text-right">ราคา</span>
                <span>วันที่</span>
                <span className={tab === "pending" ? "text-right" : "text-center"}>
                  {tab === "pending" ? "จัดการ" : "สถานะ"}
                </span>
              </div>

              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`grid ${tab === "pending" ? "grid-cols-[200px_1fr_80px_80px_140px_150px]" : "grid-cols-[200px_1fr_80px_80px_140px_100px]"} gap-3 px-5 py-3 text-sm items-center border-b border-white/[0.03] hover:bg-[#d4af37]/[0.02] transition-colors`}
                >
                  {/* User */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {req.user?.pictureUrl ? (
                      <img
                        src={req.user.pictureUrl}
                        alt=""
                        className="w-8 h-8 rounded-full shrink-0 object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full shrink-0 bg-white/5 flex items-center justify-center text-white/20 text-xs">
                        {req.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white/70 text-sm truncate">
                        {req.user?.displayName || req.username}
                      </p>
                      <p className="text-white/20 text-[10px]">
                        cr: {req.user?.credits ?? "-"}
                      </p>
                    </div>
                  </div>

                  {/* Payment ref */}
                  <span className="text-white/40 text-xs truncate">{req.paymentRef || "-"}</span>

                  {/* Credits */}
                  <span className="text-right">
                    <span className="inline-block bg-[#d4af37]/10 text-[#d4af37] text-xs font-mono px-2 py-0.5 rounded">
                      +{req.credits}
                    </span>
                  </span>

                  {/* Price */}
                  <span className="text-right text-white/50 text-xs font-mono">{req.price} ฿</span>

                  {/* Date */}
                  <div>
                    <p className="text-white/30 text-xs">{formatDate(req.createdAt)}</p>
                    {req.processedAt && (
                      <p className="text-white/15 text-[10px]">ดำเนินการ: {formatDate(req.processedAt)}</p>
                    )}
                  </div>

                  {/* Actions / Status */}
                  {tab === "pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(req.id, "approve")}
                        disabled={acting === req.id}
                        className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-30"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={acting === req.id}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-30"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  ) : (
                    <span className="text-center">
                      {req.status === "approved" ? (
                        <span className="text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded">อนุมัติ</span>
                      ) : (
                        <span className="text-red-400 text-xs bg-red-500/10 px-2 py-0.5 rounded">ปฏิเสธ</span>
                      )}
                    </span>
                  )}
                </div>
              ))}
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
