"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

type Status = "pending" | "approved" | "rejected";

interface TopUpRequest {
  _id: string;
  username: string;
  userId: string;
  credits: number;
  price: number;
  paymentRef: string;
  status: Status;
  createdAt: string;
  reviewedAt?: string;
}

interface Stats {
  totalPending: number;
  totalIssued: number;
}

export default function AdminCreditsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Status>("pending");
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPending: 0, totalIssued: 0 });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  // Manual credit add
  const [manualUser, setManualUser] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualMsg, setManualMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [addingManual, setAddingManual] = useState(false);

  useEffect(() => {
    fetchRequests(tab);
  }, [tab]);

  function authGuard(res: Response) {
    if (res.status === 401) {
      router.push("/admin/login");
      return false;
    }
    return true;
  }

  async function fetchRequests(status: Status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/topup?status=${status}`);
      if (!authGuard(res)) return;
      const data = await res.json();
      setRequests(data.requests ?? []);
      if (data.stats) setStats(data.stats);
    } catch {}
    setLoading(false);
  }

  async function handleAction(requestId: string, action: "approve" | "reject") {
    setActing(requestId);
    try {
      const res = await fetch("/api/admin/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (!authGuard(res)) return;
      if (res.ok) {
        fetchRequests(tab);
      }
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
      if (!authGuard(res)) return;
      const data = await res.json();
      if (res.ok) {
        setManualMsg({ text: `เพิ่ม ${amount} เครดิตให้ ${manualUser.trim()} สำเร็จ`, ok: true });
        setManualUser("");
        setManualAmount("");
        fetchRequests(tab);
      } else {
        setManualMsg({ text: data.error || "เกิดข้อผิดพลาด", ok: false });
      }
    } catch {
      setManualMsg({ text: "เกิดข้อผิดพลาด", ok: false });
    }
    setAddingManual(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const tabs: { key: Status; label: string }[] = [
    { key: "pending", label: "รออนุมัติ" },
    { key: "approved", label: "อนุมัติแล้ว" },
    { key: "rejected", label: "ปฏิเสธ" },
  ];

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">เครดิต</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2a1215] border border-gold/[0.04] rounded-xl p-4">
            <p className="text-white/30 text-xs mb-1">คำขอรออนุมัติ</p>
            <p className="text-gold text-2xl font-semibold">{stats.totalPending}</p>
          </div>
          <div className="bg-[#2a1215] border border-gold/[0.04] rounded-xl p-4">
            <p className="text-white/30 text-xs mb-1">เครดิตที่ออกทั้งหมด</p>
            <p className="text-gold text-2xl font-semibold">{stats.totalIssued.toLocaleString()}</p>
          </div>
        </div>

        {/* Manual add credits */}
        <div className="bg-[#2a1215] border border-gold/[0.04] rounded-xl p-5 mb-6">
          <p className="text-white/50 text-sm font-medium mb-3">เพิ่มเครดิตด้วยมือ</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="ชื่อผู้ใช้ หรือ User ID"
              value={manualUser}
              onChange={(e) => setManualUser(e.target.value)}
              className="flex-1 bg-[#1e0c0c] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
            />
            <input
              type="number"
              placeholder="จำนวน"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="w-24 bg-[#1e0c0c] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
            />
            <button
              onClick={handleManualAdd}
              disabled={addingManual || !manualUser.trim() || !manualAmount}
              className="px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/[0.1] text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-30"
            >
              {addingManual ? "กำลังเพิ่ม..." : "เพิ่ม"}
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
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                tab === t.key
                  ? "bg-gold/10 text-gold border border-gold/[0.1]"
                  : "text-white/40 hover:text-white/60 hover:bg-gold/[0.03] border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Requests table */}
        {loading ? (
          <div className="flex items-center gap-3 text-white/30 py-8">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#2a1215] border border-gold/[0.04] rounded-xl p-10 text-center text-white/20 text-sm">
            ไม่มีรายการ
          </div>
        ) : (
          <div className="bg-[#2a1215] border border-gold/[0.04] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/[0.04] text-white/30 text-xs">
                  <th className="text-left px-4 py-3 font-normal">ผู้ใช้</th>
                  <th className="text-left px-4 py-3 font-normal">เครดิต</th>
                  <th className="text-left px-4 py-3 font-normal">ราคา</th>
                  <th className="text-left px-4 py-3 font-normal">อ้างอิง</th>
                  <th className="text-left px-4 py-3 font-normal">วันที่</th>
                  {tab === "pending" && <th className="text-right px-4 py-3 font-normal">จัดการ</th>}
                  {tab !== "pending" && <th className="text-left px-4 py-3 font-normal">สถานะ</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-3 text-white/70">{req.username}</td>
                    <td className="px-4 py-3 text-gold font-medium">{req.credits}</td>
                    <td className="px-4 py-3 text-white/50">{req.price} &#3647;</td>
                    <td className="px-4 py-3 text-white/40 max-w-[160px] truncate">{req.paymentRef}</td>
                    <td className="px-4 py-3 text-white/30">{formatDate(req.createdAt)}</td>
                    {tab === "pending" ? (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(req._id, "approve")}
                            disabled={acting === req._id}
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-30"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleAction(req._id, "reject")}
                            disabled={acting === req._id}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-30"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-4 py-3">
                        {req.status === "approved" ? (
                          <span className="text-green-400/70 text-xs bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">อนุมัติ</span>
                        ) : (
                          <span className="text-red-400/70 text-xs bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1">ปฏิเสธ</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
