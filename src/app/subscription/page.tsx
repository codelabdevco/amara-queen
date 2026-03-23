"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import LaurelButton from "@/components/ui/LaurelButton";
import { EASE } from "@/constants/animation";

interface SubPackage { name: string; credits: number; desc: string; content: string }
interface Subscription {
  id: string; package: string; status: string; startDate: number; endDate: number; autoRenew: boolean; paidCredits: number;
}

const PKG_ICONS: Record<string, string> = { daily: "☀", weekly: "☽", monthly: "☆", all: "✦" };

export default function SubscriptionPage() {
  const [packages, setPackages] = useState<Record<string, SubPackage>>({});
  const [sub, setSub] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  function fetchData() {
    fetch("/api/subscription").then(r => r.json()).then(d => {
      setPackages(d.packages || {});
      setSub(d.subscription || null);
      setCredits(d.credits || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubscribe(pkgId: string) {
    if (!confirm(`สมัครแพ็กเกจ ${packages[pkgId]?.name}? จะหัก ${packages[pkgId]?.credits} เครดิต`)) return;
    setSubscribing(true);
    const res = await fetch("/api/subscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: pkgId }),
    });
    const data = await res.json();
    if (data.ok) { fetchData(); }
    else { alert(data.error); }
    setSubscribing(false);
  }

  async function handleToggleRenew() {
    await fetch("/api/subscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleRenew" }),
    });
    fetchData();
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  }

  function daysLeft(endDate: number) {
    return Math.max(0, Math.ceil((endDate - Date.now()) / (24 * 60 * 60 * 1000)));
  }

  return (
    <AppShell>
      <motion.div className="flex flex-col h-full px-4 pt-2 overflow-y-auto pb-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-base font-semibold tracking-[0.1em]"
            style={{ background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer-text 4s ease-in-out infinite" }}
          >แพ็กเกจดวงรายงวด</h2>
          <p className="text-[#8B7A4A]/50 text-[0.65rem]">รับดวงส่งตรงถึง LINE ทุกเช้า</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-4 h-4 border-2 border-[#8B7A4A]/30 border-t-[#d4af37] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Active subscription */}
            {sub && (
              <motion.div className="rounded-lg p-4 mb-4" style={{ background: "#2a1215", border: "1px solid #8B7A4A20" }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#d4af37] text-lg">{PKG_ICONS[sub.package]}</span>
                    <div>
                      <p className="text-[#E2D4A0] text-sm font-semibold">{packages[sub.package]?.name}</p>
                      <p className="text-[#8B7A4A]/40 text-[0.55rem]">ใช้งานอยู่</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#d4af37] text-sm font-semibold">{daysLeft(sub.endDate)} วัน</p>
                    <p className="text-[#8B7A4A]/30 text-[0.5rem]">เหลือ</p>
                  </div>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "#1e0c0c" }}>
                  <div className="h-full rounded-full" style={{
                    background: "#d4af37",
                    width: `${Math.min(100, (daysLeft(sub.endDate) / 30) * 100)}%`,
                  }} />
                </div>

                <div className="flex justify-between text-[0.6rem] mb-3">
                  <span className="text-[#8B7A4A]/40">เริ่ม {formatDate(sub.startDate)}</span>
                  <span className="text-[#8B7A4A]/40">หมด {formatDate(sub.endDate)}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg p-2" style={{ background: "#1e0c0c" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8B7A4A]/50 text-xs">ต่ออายุอัตโนมัติ</span>
                  </div>
                  <button onClick={handleToggleRenew}
                    className={`relative w-10 h-5 rounded-full transition-colors ${sub.autoRenew ? "bg-[#d4af37]/30" : "bg-[#1e0c0c]"}`}
                    style={{ border: "1px solid #8B7A4A20" }}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${sub.autoRenew ? "left-[22px] bg-[#d4af37]" : "left-0.5 bg-[#8B7A4A]/40"}`} />
                  </button>
                </div>

                {!sub.autoRenew && daysLeft(sub.endDate) <= 7 && (
                  <p className="text-[#7a2020]/60 text-[0.6rem] mt-2 text-center">
                    ⚠ แพ็กเกจจะหมดอายุใน {daysLeft(sub.endDate)} วัน กรุณาต่ออายุ
                  </p>
                )}
              </motion.div>
            )}

            {/* Package list */}
            <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-[0.2em] mb-2">
              {sub ? "เปลี่ยนแพ็กเกจ" : "เลือกแพ็กเกจ"}
            </p>
            <div className="space-y-2 mb-4">
              {Object.entries(packages).map(([id, pkg]) => {
                const isActive = sub?.package === id;
                return (
                  <motion.div key={id} className="rounded-lg p-3.5 flex items-center gap-3"
                    style={{ background: isActive ? "#3A0E0E" : "#2a1215", border: isActive ? "1px solid #8B7A4A30" : "0.5px solid #8B7A4A10" }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-xl flex-shrink-0" style={{ color: isActive ? "#d4af37" : "#8B7A4A" }}>{PKG_ICONS[id]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#E2D4A0]/80 text-xs font-medium">{pkg.name}</p>
                        {isActive && <span className="text-[#d4af37] text-[0.5rem]">ใช้อยู่</span>}
                        {id === "all" && !isActive && <span className="text-[#d4af37]/40 text-[0.5rem]">คุ้มสุด</span>}
                      </div>
                      <p className="text-[#8B7A4A]/40 text-[0.55rem]">{pkg.desc}</p>
                      <p className="text-[#8B7A4A]/30 text-[0.5rem]">{pkg.content}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#d4af37] text-sm font-semibold">★{pkg.credits}</p>
                      <p className="text-[#8B7A4A]/30 text-[0.5rem]">/เดือน</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Subscribe button */}
            {!sub && (
              <div className="space-y-2">
                {Object.entries(packages).map(([id, pkg]) => (
                  <LaurelButton key={id} variant={id === "all" ? "gold" : "crimson"} onClick={() => handleSubscribe(id)} className="w-full h-[46px]">
                    {subscribing ? "..." : `สมัคร ${pkg.name} — ★${pkg.credits}`}
                  </LaurelButton>
                ))}
              </div>
            )}

            {sub && (
              <p className="text-[#8B7A4A]/25 text-[0.5rem] text-center mt-2">
                เครดิตคงเหลือ: {credits} · กดที่แพ็กเกจเพื่อเปลี่ยน
              </p>
            )}
          </>
        )}
      </motion.div>
    </AppShell>
  );
}
