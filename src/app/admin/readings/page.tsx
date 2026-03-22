"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Reading {
  _id: string;
  createdAt: string;
  topic: string;
  spread: string;
  question: string;
  trend: string;
  user: string;
  answer?: string;
  cards?: string[];
}

interface ReadingsResponse {
  readings: Reading[];
  total: number;
  page: number;
  pages: number;
}

export default function AdminReadingsPage() {
  const router = useRouter();
  const [data, setData] = useState<ReadingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReadings = useCallback(
    (p: number) => {
      setLoading(true);
      fetch(`/api/admin/readings?page=${p}&limit=20`)
        .then((res) => {
          if (res.status === 401) {
            router.push("/admin/login");
            return null;
          }
          return res.json();
        })
        .then((d) => {
          if (d) setData(d);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [router]
  );

  useEffect(() => {
    fetchReadings(page);
  }, [page, fetchReadings]);

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบคำทำนายนี้?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/readings?id=${id}`, { method: "DELETE" });
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

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">คำทำนาย</h2>
          {data && (
            <span className="text-white/30 text-sm">{data.total.toLocaleString()} รายการ</span>
          )}
        </div>

        {loading && !data ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : !data ? (
          <p className="text-white/40">ไม่สามารถโหลดข้อมูลได้</p>
        ) : (
          <>
            <div className="bg-[#2a1215] border border-gold/[0.08] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[160px_1fr_1fr_2fr_100px_120px_60px] gap-3 px-5 py-3 border-b border-gold/[0.08] text-xs text-white/30 uppercase tracking-wider">
                <span>วันที่</span>
                <span>หัวข้อ</span>
                <span>การ์ด</span>
                <span>คำถาม</span>
                <span>แนวโน้ม</span>
                <span>ผู้ใช้</span>
                <span></span>
              </div>

              {data.readings.length === 0 && (
                <div className="px-5 py-10 text-center text-white/20 text-sm">ยังไม่มีคำทำนาย</div>
              )}

              {data.readings.map((r) => (
                <div key={r._id}>
                  <div
                    className="grid grid-cols-[160px_1fr_1fr_2fr_100px_120px_60px] gap-3 px-5 py-3 border-b border-gold/[0.06] text-sm hover:bg-gold/[0.02] cursor-pointer transition-colors items-center"
                    onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                  >
                    <span className="text-white/40 text-xs">{formatDate(r.createdAt)}</span>
                    <span className="text-white/70 truncate">{r.topic}</span>
                    <span className="text-white/50 truncate">{r.spread}</span>
                    <span className="text-white/60 truncate">{r.question}</span>
                    <span className="text-gold/70 text-xs">{r.trend}</span>
                    <span className="text-white/40 text-xs truncate">{r.user || "-"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r._id);
                      }}
                      disabled={deleting === r._id}
                      className="text-red-400/40 hover:text-red-400 text-xs transition-colors disabled:opacity-30"
                    >
                      {deleting === r._id ? "..." : "ลบ"}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === r._id && (
                    <div className="px-5 py-4 border-b border-gold/[0.06] bg-white/[0.01] space-y-3">
                      <div>
                        <p className="text-white/30 text-xs mb-1">คำถาม</p>
                        <p className="text-white/70 text-sm">{r.question}</p>
                      </div>
                      {r.cards && r.cards.length > 0 && (
                        <div>
                          <p className="text-white/30 text-xs mb-1">ไพ่ที่ได้</p>
                          <div className="flex flex-wrap gap-1.5">
                            {r.cards.map((c, i) => (
                              <span
                                key={i}
                                className="bg-gold/10 text-gold/80 text-xs px-2 py-0.5 rounded"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {r.answer && (
                        <div>
                          <p className="text-white/30 text-xs mb-1">คำทำนาย</p>
                          <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                            {r.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <span className="text-white/40 text-sm px-3">
                  {page} / {data.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page >= data.pages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
