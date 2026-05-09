"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";
import Icon from "@/components/ui/Icon";

interface Healer {
  id: string;
  name: string;
  title: string;
  pictureUrl: string;
  bio: string;
  specialties: string[];
  priceCredits: number;
  sessionMinutes: number;
  rating: number;
  totalBookings: number;
}

interface SlotInfo {
  time: string;
  available: boolean;
}

interface MyBooking {
  id: string;
  healerId: string;
  date: string;
  timeSlot: string;
  sessionMinutes: number;
  creditCost: number;
  status: string;
  note: string;
  createdAt: number;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  no_show: "ไม่มา",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
  no_show: "#f97316",
};

type Step = "healers" | "datetime" | "confirm" | "done" | "history";

export default function BookingScreen() {
  const [step, setStep] = useState<Step>("healers");
  const [healers, setHealers] = useState<Healer[]>([]);
  const [selected, setSelected] = useState<Healer | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [healerMap, setHealerMap] = useState<Record<string, Healer>>({});

  useEffect(() => {
    fetch("/api/booking?action=healers")
      .then((r) => r.json())
      .then((d) => {
        const h = d.healers || [];
        setHealers(h);
        const map: Record<string, Healer> = {};
        h.forEach((healer: Healer) => { map[healer.id] = healer; });
        setHealerMap(map);
      })
      .catch(() => {});
  }, []);

  function loadSlots(healerId: string, d: string) {
    if (!healerId || !d) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot("");
    fetch(`/api/booking?action=slots&healerId=${healerId}&date=${d}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => {})
      .finally(() => setSlotsLoading(false));
  }

  function loadMyBookings() {
    fetch("/api/booking?action=my")
      .then((r) => r.json())
      .then((d) => setMyBookings(d.bookings || []))
      .catch(() => {});
  }

  async function handleConfirm() {
    if (!selected || !date || !selectedSlot) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ healerId: selected.id, date, timeSlot: selectedSlot, note }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "เกิดข้อผิดพลาด");
        setLoading(false);
        return;
      }
      setStep("done");
    } catch {
      setError("ไม่สามารถจองได้ ลองใหม่อีกครั้ง");
    }
    setLoading(false);
  }

  // Generate next 14 days
  const dates: { value: string; label: string; dayName: string }[] = [];
  const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const val = d.toISOString().slice(0, 10);
    dates.push({
      value: val,
      label: `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`,
      dayName: THAI_DAYS[d.getDay()],
    });
  }

  const cardBg = "background: #1a0808; border: 0.5px solid #8B7A4A15;";
  const goldGrad = "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)";

  return (
    <motion.div className="flex flex-col h-full px-4 pt-2 pb-4 overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: "#3A0E0E", border: "1px solid #8B7A4A20" }}>
          <Icon name="calendar" size={22} className="text-[#d4af37]" />
        </div>
        <h2 className="text-sm font-semibold tracking-[0.08em]"
          style={{ background: goldGrad, backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          นัดหมอดู
        </h2>
        <p className="text-[#8B7A4A]/40 text-[10px] mt-0.5">จองคิวดูดวงกับหมอดูตัวจริง</p>
      </div>

      {/* Tab: booking vs history */}
      <div className="flex gap-2 mb-4 justify-center">
        <button onClick={() => { setStep("healers"); setSelected(null); setDate(""); setSelectedSlot(""); setError(""); }}
          className={`px-4 py-1.5 rounded-full text-xs transition-colors ${step !== "history" ? "bg-[#d4af37]/15 text-[#d4af37]" : "text-[#8B7A4A]/40"}`}>
          จองคิว
        </button>
        <button onClick={() => { setStep("history"); loadMyBookings(); }}
          className={`px-4 py-1.5 rounded-full text-xs transition-colors ${step === "history" ? "bg-[#d4af37]/15 text-[#d4af37]" : "text-[#8B7A4A]/40"}`}>
          การจองของฉัน
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Choose healer */}
        {step === "healers" && (
          <motion.div key="healers" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            {healers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#8B7A4A]/40 text-xs">ยังไม่มีหมอดูในระบบ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {healers.map((h) => (
                  <button key={h.id} onClick={() => { setSelected(h); setStep("datetime"); }}
                    className="w-full text-left rounded-xl p-4 transition-all active:scale-[0.98]"
                    style={{ background: "#1a0808", border: "0.5px solid #8B7A4A15" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ background: "#3A0E0E", border: "1px solid #8B7A4A20" }}>
                        {h.pictureUrl ? (
                          <img src={h.pictureUrl} alt={h.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🔮</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#E2D4A0]/90 font-medium">{h.title} {h.name}</p>
                        <p className="text-[10px] text-[#8B7A4A]/40 mt-0.5 line-clamp-2">{h.bio}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {h.specialties.slice(0, 3).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full text-[9px] bg-[#d4af37]/10 text-[#d4af37]/60">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8B7A4A]/40">
                          <span className="text-[#d4af37]/70 font-medium">{h.priceCredits} เครดิต</span>
                          <span>{h.sessionMinutes} นาที</span>
                          <span>จองแล้ว {h.totalBookings} ครั้ง</span>
                        </div>
                      </div>
                      <Icon name="chevron-right" size={16} className="text-[#8B7A4A]/20 mt-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Choose date & time */}
        {step === "datetime" && selected && (
          <motion.div key="datetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <button onClick={() => setStep("healers")} className="flex items-center gap-1 text-xs text-[#d4af37]/50 mb-3">
              <Icon name="chevron-left" size={14} /> เลือกหมอดูอื่น
            </button>

            {/* Selected healer mini card */}
            <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
              style={{ background: "#1a0808", border: "0.5px solid #8B7A4A15" }}>
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: "#3A0E0E", border: "1px solid #8B7A4A20" }}>
                {selected.pictureUrl ? (
                  <img src={selected.pictureUrl} alt="" className="w-full h-full object-cover" />
                ) : <span>🔮</span>}
              </div>
              <div>
                <p className="text-xs text-[#E2D4A0]/80 font-medium">{selected.title} {selected.name}</p>
                <p className="text-[10px] text-[#8B7A4A]/40">{selected.priceCredits} เครดิต • {selected.sessionMinutes} นาที</p>
              </div>
            </div>

            {/* Date selector */}
            <p className="text-xs text-[#8B7A4A]/50 mb-2">เลือกวัน</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {dates.map((d) => (
                <button key={d.value} onClick={() => { setDate(d.value); loadSlots(selected.id, d.value); }}
                  className={`flex-shrink-0 w-16 rounded-xl py-2.5 text-center transition-all ${
                    date === d.value ? "bg-[#d4af37]/15 border-[#d4af37]/30" : "bg-[#1a0808] border-[#8B7A4A]/10"
                  } border`}>
                  <p className={`text-[9px] ${date === d.value ? "text-[#d4af37]/80" : "text-[#8B7A4A]/30"}`}>{d.dayName}</p>
                  <p className={`text-sm font-medium ${date === d.value ? "text-[#d4af37]" : "text-[#E2D4A0]/50"}`}>{d.label.split(" ")[0]}</p>
                  <p className={`text-[9px] ${date === d.value ? "text-[#d4af37]/60" : "text-[#8B7A4A]/25"}`}>{d.label.split(" ")[1]}</p>
                </button>
              ))}
            </div>

            {/* Time slots */}
            {date && (
              <div className="mt-4">
                <p className="text-xs text-[#8B7A4A]/50 mb-2">เลือกเวลา</p>
                {slotsLoading ? (
                  <p className="text-[#8B7A4A]/30 text-xs text-center py-4">กำลังโหลด...</p>
                ) : slots.length === 0 ? (
                  <p className="text-[#8B7A4A]/30 text-xs text-center py-4">ไม่มีช่วงเวลาว่างในวันนี้</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button key={s.time} disabled={!s.available}
                        onClick={() => setSelectedSlot(s.time)}
                        className={`rounded-lg py-2.5 text-xs text-center transition-all ${
                          !s.available ? "opacity-20 cursor-not-allowed bg-[#1a0808] text-[#8B7A4A]/30 line-through" :
                          selectedSlot === s.time ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30" :
                          "bg-[#1a0808] text-[#E2D4A0]/60 border border-[#8B7A4A]/10 active:scale-95"
                        }`}>
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            {selectedSlot && (
              <div className="mt-4">
                <p className="text-xs text-[#8B7A4A]/50 mb-2">โน้ตถึงหมอดู (ไม่บังคับ)</p>
                <textarea
                  className="w-full rounded-xl p-3 text-xs text-[#E2D4A0]/80 placeholder-[#8B7A4A]/25 resize-none h-20 focus:outline-none focus:border-[#d4af37]/30"
                  style={{ background: "#1a0808", border: "0.5px solid #8B7A4A15" }}
                  placeholder="คำถามหรือเรื่องที่อยากปรึกษา..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}

            {/* Next button */}
            {selectedSlot && (
              <div className="mt-4">
                <LaurelButton variant="gold" onClick={() => setStep("confirm")}>ยืนยันการจอง</LaurelButton>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && selected && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="rounded-xl p-5 space-y-4" style={{ background: "#1a0808", border: "0.5px solid #8B7A4A15" }}>
              <h3 className="text-sm text-[#d4af37] font-medium text-center">ยืนยันการจอง</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B7A4A]/50">หมอดู</span>
                  <span className="text-[#E2D4A0]/80">{selected.title} {selected.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B7A4A]/50">วันที่</span>
                  <span className="text-[#E2D4A0]/80">
                    {(() => {
                      const d = new Date(date + "T00:00:00");
                      return `${THAI_DAYS[d.getDay()]} ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B7A4A]/50">เวลา</span>
                  <span className="text-[#E2D4A0]/80">{selectedSlot} น. ({selected.sessionMinutes} นาที)</span>
                </div>
                <div className="w-full h-px bg-[#8B7A4A]/10" />
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B7A4A]/50">ค่าบริการ</span>
                  <span className="text-[#d4af37] font-medium">{selected.priceCredits} เครดิต</span>
                </div>
                {note && (
                  <>
                    <div className="w-full h-px bg-[#8B7A4A]/10" />
                    <div>
                      <p className="text-[10px] text-[#8B7A4A]/40 mb-1">โน้ต</p>
                      <p className="text-xs text-[#E2D4A0]/60">{note}</p>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400/80 text-center bg-red-400/10 rounded-lg py-2">{error}</p>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setStep("datetime"); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-xs text-[#8B7A4A]/40 border border-[#8B7A4A]/10 transition-colors">
                  ย้อนกลับ
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20 transition-colors disabled:opacity-50">
                  {loading ? "กำลังจอง..." : "ยืนยัน"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#0a2e1a", border: "1px solid #22c55e30" }}>
                <Icon name="check" size={28} className="text-green-400" />
              </div>
              <h3 className="text-sm text-green-400 font-medium mb-1">จองสำเร็จ!</h3>
              <p className="text-[10px] text-[#8B7A4A]/40 mb-4">
                {selected && `${selected.title} ${selected.name} • ${date} เวลา ${selectedSlot} น.`}
              </p>
              <p className="text-[10px] text-[#8B7A4A]/30 mb-6">คุณจะได้รับการแจ้งเตือนก่อนถึงเวลานัด</p>
              <div className="flex gap-2 justify-center">
                <LaurelButton variant="crimson" onClick={() => { setStep("history"); loadMyBookings(); }}>ดูการจองของฉัน</LaurelButton>
                <LaurelButton variant="gold" onClick={() => { setStep("healers"); setSelected(null); setDate(""); setSelectedSlot(""); setNote(""); setError(""); }}>จองเพิ่ม</LaurelButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* History tab */}
        {step === "history" && (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {myBookings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#8B7A4A]/40 text-xs mb-4">ยังไม่มีการจอง</p>
                <LaurelButton variant="gold" onClick={() => setStep("healers")}>จองตอนนี้</LaurelButton>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => {
                  const healer = healerMap[b.healerId];
                  return (
                    <div key={b.id} className="rounded-xl p-4"
                      style={{ background: "#1a0808", border: "0.5px solid #8B7A4A15" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#E2D4A0]/70 font-medium">
                          {healer ? `${healer.title} ${healer.name}` : "หมอดู"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ color: STATUS_COLOR[b.status] || "#888", background: (STATUS_COLOR[b.status] || "#888") + "15" }}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8B7A4A]/40 space-y-0.5">
                        <p>{b.date} เวลา {b.timeSlot} น. ({b.sessionMinutes} นาที)</p>
                        <p>{b.creditCost} เครดิต</p>
                        {b.note && <p className="text-[#8B7A4A]/30 mt-1">"{b.note}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
