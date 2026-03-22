"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

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
}

const STATUS_CONFIG: Record<
  Transaction["status"],
  { label: string; bg: string; text: string }
> = {
  pending: { label: "รอดำเนินการ", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  successful: { label: "สำเร็จ", bg: "bg-green-500/10", text: "text-green-400" },
  failed: { label: "ล้มเหลว", bg: "bg-red-500/10", text: "text-red-400" },
  expired: { label: "หมดอายุ", bg: "bg-gold/5", text: "text-white/40" },
};

const METHOD_LABELS: Record<string, string> = {
  promptpay: "PromptPay",
  card: "บัตรเครดิต",
  truemoney: "TrueMoney",
  manual: "เติมมือ",
};

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setTransactions(data.transactions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

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

  const successful = transactions.filter((t) => t.status === "successful");
  const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = successful.reduce((sum, t) => sum + t.credits, 0);

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">รายการชำระเงิน</h2>
          <span className="text-white/30 text-sm">
            {transactions.length.toLocaleString()} รายการ
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">
              รายการสำเร็จ
            </div>
            <div className="text-2xl font-semibold text-gold">
              {loading ? "-" : successful.length.toLocaleString()}
            </div>
            <div className="text-white/20 text-xs mt-1">รายการ</div>
          </div>

          <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">
              ยอดรวม
            </div>
            <div className="text-2xl font-semibold text-gold">
              {loading ? "-" : formatAmount(totalRevenue)}
            </div>
            <div className="text-white/20 text-xs mt-1">THB</div>
          </div>

          <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-5">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">
              เครดิตที่เติม
            </div>
            <div className="text-2xl font-semibold text-gold">
              {loading ? "-" : totalCredits.toLocaleString()}
            </div>
            <div className="text-white/20 text-xs mt-1">เครดิต</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl p-10 text-center text-white/20 text-sm">
            ยังไม่มีรายการชำระเงิน
          </div>
        ) : (
          <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_0.8fr_0.8fr] gap-3 px-5 py-3 border-b border-gold/[0.08] text-xs text-white/30 uppercase tracking-wider">
              <span>วันที่</span>
              <span>ผู้ใช้</span>
              <span>วิธีชำระ</span>
              <span className="text-right">จำนวน</span>
              <span className="text-right">เครดิต</span>
              <span className="text-center">สถานะ</span>
            </div>

            {/* Rows */}
            {transactions.map((t) => {
              const statusCfg = STATUS_CONFIG[t.status];
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_0.8fr_0.8fr] gap-3 px-5 py-3 border-b border-gold/[0.06] text-sm hover:bg-gold/[0.02] transition-colors items-center"
                >
                  <span className="text-white/40 text-xs">
                    {formatDate(t.createdAt)}
                  </span>
                  <span className="text-white/70 truncate">
                    {t.username || "-"}
                  </span>
                  <span className="text-white/50 text-xs">
                    {METHOD_LABELS[t.method] ?? t.method}
                  </span>
                  <span className="text-right text-white/70 font-mono text-xs">
                    {formatAmount(t.amount)} ฿
                  </span>
                  <span className="text-right">
                    <span className="inline-block bg-gold/10 text-gold text-xs font-mono px-2 py-0.5 rounded">
                      {t.credits}
                    </span>
                  </span>
                  <span className="text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {statusCfg.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
