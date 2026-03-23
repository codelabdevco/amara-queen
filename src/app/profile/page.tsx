"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import ProfileSetup from "@/components/ui/ProfileSetup";
import LaurelButton from "@/components/ui/LaurelButton";
import { EASE } from "@/constants/animation";

interface ProfileData {
  profile: {
    nickname: string; firstName: string; lastName: string; birthdate: string;
    gender: string; phone: string; email: string; occupation: string;
  } | null;
  zodiac: {
    western: { signTh: string; elementTh: string; sign: string };
    thai: { signTh: string }; luckyNumber: number; age: number;
    birthDay: { nameTh: string; color: string; planetTh: string };
    personality: string; luckyColor: string; compatibility: string;
  } | null;
  linePictureUrl: string | null;
  credits: number; totalReadings: number;
}

interface ReadingRecord {
  id: string; timestamp: number; topic: string; spread: string; question: string;
  trend: string; summary: string; tokensUsed: number;
}

interface PaymentRecord {
  id: string; createdAt: number; method: string; amount: number; credits: number; status: string;
}

type Tab = "profile" | "history" | "credits";

const TREND_LABEL: Record<string, string> = { very_positive: "ดีมาก", positive: "ดี", neutral: "กลางๆ", caution: "ระวัง", challenging: "ท้าทาย" };

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  function fetchProfile() {
    fetch("/api/auth/profile").then(r => r.ok ? r.json() : null).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchProfile();
    fetch("/api/credits/topup").then(r => r.json()).then(d => setPayments(d.requests || [])).catch(() => {});
    fetch("/api/shop/order").then(r => r.json()).then(d => {
      // Use readings from admin API if available, otherwise empty
    }).catch(() => {});
  }, []);

  // Fetch reading history
  useEffect(() => {
    if (tab === "history") {
      // Get from localStorage history
      try {
        const raw = localStorage.getItem("amara_history");
        if (raw) setReadings(JSON.parse(raw));
      } catch {}
    }
  }, [tab]);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "ข้อมูล" },
    { id: "history", label: "ประวัติดูดวง" },
    { id: "credits", label: "เครดิต" },
  ];

  return (
    <AppShell>
      <motion.div className="flex flex-col h-full px-4 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>

        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-base font-semibold tracking-[0.1em]" style={{ background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer-text 4s ease-in-out infinite" }}>โปรไฟล์</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1"><div className="w-4 h-4 border-2 border-[#8B7A4A]/30 border-t-[#d4af37] rounded-full animate-spin" /></div>
        ) : !data?.profile ? (
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#3A0E0E", border: "1px solid #8B7A4A30" }}>
              <span className="text-[#d4af37] text-3xl">♦</span>
            </div>
            <p className="text-[#8B7A4A]/50 text-sm mb-4">ยังไม่ได้เข้าสู่ระบบ</p>
            <LaurelButton variant="gold" href="/api/auth/line">เข้าสู่ระบบ</LaurelButton>
          </div>
        ) : (
          <>
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
              {data.linePictureUrl ? (
                <img src={data.linePictureUrl} alt="" className="w-12 h-12 rounded-full" style={{ border: "1.5px solid #8B7A4A30" }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#3A0E0E", border: "1.5px solid #8B7A4A30" }}>
                  <span className="text-[#E2D4A0] text-lg">{data.profile.nickname?.charAt(0) || "?"}</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-[#E2D4A0] text-sm font-semibold">{data.profile.nickname}</p>
                {data.zodiac && <p className="text-[#d4af37]/50 text-[0.6rem]">ราศี{data.zodiac.western.signTh} · วัน{data.zodiac.birthDay.nameTh}</p>}
              </div>
              <div className="text-right">
                <p className="text-[#d4af37] text-base font-semibold">{data.credits}</p>
                <p className="text-[#8B7A4A]/40 text-[0.5rem]">เครดิต</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 rounded-lg p-0.5" style={{ background: "#1e0c0c" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-1.5 rounded text-[0.65rem] font-medium transition-all ${tab === t.id ? "text-[#d4af37]" : "text-[#8B7A4A]/40"}`}
                  style={tab === t.id ? { background: "#3A0E0E" } : {}}
                >{t.label}</button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto pb-4">

              {/* ── Profile Tab ── */}
              {tab === "profile" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <StatBox label="ดูดวง" value={String(data.totalReadings)} />
                    <StatBox label="เครดิต" value={String(data.credits)} />
                    <StatBox label="อายุ" value={data.zodiac ? `${data.zodiac.age}` : "-"} />
                  </div>

                  {data.zodiac && (
                    <>
                      <div className="grid grid-cols-3 gap-1.5">
                        <InfoCard label="ราศี" value={data.zodiac.western.signTh} />
                        <InfoCard label="ธาตุ" value={data.zodiac.western.elementTh} />
                        <InfoCard label="นักษัตร" value={data.zodiac.thai.signTh} />
                      </div>
                      <div className="rounded-lg p-2.5" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                        <p className="text-[#8B7A4A]/40 text-[0.5rem] uppercase tracking-wider mb-1">บุคลิกภาพ</p>
                        <p className="text-[#E2D4A0]/50 text-[0.65rem] leading-4">{data.zodiac.personality}</p>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-1">
                    <LaurelButton variant="crimson" onClick={() => setShowEdit(true)} className="flex-1 h-[42px]">แก้ไขข้อมูล</LaurelButton>
                    <LaurelButton variant="crimson" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }} className="h-[42px]">ออก</LaurelButton>
                  </div>
                </div>
              )}

              {/* ── History Tab ── */}
              {tab === "history" && (
                <div className="space-y-2">
                  {readings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#8B7A4A]/40 text-xs">ยังไม่มีประวัติการดูดวง</p>
                    </div>
                  ) : (
                    readings.map((r, i) => (
                      <div key={r.id || i} className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#E2D4A0]/70 text-xs font-medium">{r.topic}</span>
                          <span className="text-[#8B7A4A]/30 text-[0.55rem]">{formatDate(r.timestamp)}</span>
                        </div>
                        <p className="text-[#8B7A4A]/50 text-[0.6rem] mb-1">{r.spread} · {TREND_LABEL[r.trend] || r.trend}</p>
                        {r.question && <p className="text-[#E2D4A0]/30 text-[0.6rem] italic truncate">&quot;{r.question}&quot;</p>}
                        {r.summary && <p className="text-[#E2D4A0]/40 text-[0.6rem] mt-1 line-clamp-2">{r.summary}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Credits Tab ── */}
              {tab === "credits" && (
                <div className="space-y-2">
                  {/* Balance */}
                  <div className="rounded-lg p-3 text-center" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                    <p className="text-[#8B7A4A]/40 text-[0.5rem] uppercase tracking-wider">เครดิตคงเหลือ</p>
                    <p className="text-[#d4af37] text-2xl font-semibold">{data.credits}</p>
                    <p className="text-[#8B7A4A]/30 text-[0.55rem] mt-1">ดูดวงแล้ว {data.totalReadings} ครั้ง</p>
                  </div>

                  {/* Cost reference */}
                  <div className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                    <p className="text-[#8B7A4A]/40 text-[0.5rem] uppercase tracking-wider mb-2">ค่าบริการ</p>
                    <div className="space-y-1">
                      {[{ name: "ไพ่ทาโร่", cost: 3 }, { name: "ไพ่ยิปซี", cost: 2 }, { name: "เซียมซี", cost: 1 }, { name: "ฤกษ์ยาม", cost: 2 }, { name: "วิเคราะห์ AI", cost: 1 }].map(s => (
                        <div key={s.name} className="flex justify-between text-[0.65rem]">
                          <span className="text-[#E2D4A0]/40">{s.name}</span>
                          <span className="text-[#d4af37]/60">★{s.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction history */}
                  <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-wider pt-1">ประวัติเครดิต</p>
                  {payments.length === 0 ? (
                    <p className="text-[#8B7A4A]/30 text-xs text-center py-4">ยังไม่มีประวัติ</p>
                  ) : (
                    payments.map((p, i) => (
                      <div key={p.id || i} className="rounded-lg p-3 flex items-center justify-between" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                        <div>
                          <p className="text-[#E2D4A0]/60 text-xs">{p.method === "credit" ? "ใช้เครดิต" : p.method === "transfer" ? "โอนเงิน" : "เติมเครดิต"}</p>
                          <p className="text-[#8B7A4A]/30 text-[0.55rem]">{formatDate(p.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#d4af37] text-sm font-semibold">+{p.credits}</p>
                          {p.amount > 0 && <p className="text-[#8B7A4A]/30 text-[0.55rem]">฿{p.amount / 100}</p>}
                          <span className={`text-[0.5rem] ${p.status === "successful" || p.status === "approved" ? "text-green-400/50" : p.status === "pending" ? "text-yellow-400/50" : "text-red-400/50"}`}>
                            {p.status === "successful" || p.status === "approved" ? "สำเร็จ" : p.status === "pending" ? "รอ" : "ไม่สำเร็จ"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <ProfileSetup open={showEdit} onClose={() => { setShowEdit(false); fetchProfile(); }} />
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
      <p className="text-[#d4af37] text-base font-semibold">{value}</p>
      <p className="text-[#8B7A4A]/40 text-[0.5rem]">{label}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
      <p className="text-[#8B7A4A]/35 text-[0.45rem] uppercase tracking-wider">{label}</p>
      <p className="text-[#d4af37]/80 text-xs font-semibold mt-0.5">{value}</p>
    </div>
  );
}
