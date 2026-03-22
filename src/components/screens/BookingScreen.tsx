"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

/* ── Types ── */
interface Teller {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  price: string;
  rating: number;
  color: string;
}

/* ── Data ── */
const TELLERS: Teller[] = [
  { id: "chang", name: "หมอช้าง", initials: "ช", specialty: "เชี่ยวชาญดวงจีน ประสบการณ์ 20 ปี", price: "฿500/30นาที", rating: 5, color: "#e8d48b" },
  { id: "mod", name: "อาจารย์มด", initials: "ม", specialty: "ไพ่ทาโร่ + ไพ่ยิปซี", price: "฿300/30นาที", rating: 4, color: "#b48bd4" },
  { id: "jane", name: "แม่หมอเจน", initials: "จ", specialty: "ดวงไทย ลายมือ", price: "฿400/30นาที", rating: 5, color: "#4a9e6e" },
];

const TIME_SLOTS = ["10:00", "13:00", "15:00", "17:00"];

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "text-gold text-[0.65rem]" : "text-white/15 text-[0.65rem]"}>&#9733;</span>
      ))}
    </span>
  );
}

function getNextDays(n: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

/* ── Component ── */
export default function BookingScreen() {
  
  const [selectedTeller, setSelectedTeller] = useState<Teller | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const nextDays = useMemo(() => getNextDays(7), []);

  // Available slots per day (mock: remove 1-2 slots randomly based on date)
  function getSlots(date: Date): string[] {
    const seed = date.getDate();
    return TIME_SLOTS.filter((_, i) => (seed + i) % 5 !== 0);
  }

  function handleConfirm() {
    setShowConfirm(false);
    setShowSuccess(true);
  }

  function handleReset() {
    setSelectedTeller(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowSuccess(false);
    setShowConfirm(false);
  }

  // Step view
  type Step = "list" | "slots" | "confirm" | "success";
  const step: Step = showSuccess
    ? "success"
    : showConfirm
    ? "confirm"
    : selectedTeller
    ? "slots"
    : "list";

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Back */}
      <motion.button
        className="fixed top-3 left-3 z-[110] w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:bg-white/10 backdrop-blur-sm"
        style={{ top: "max(12px, env(safe-area-inset-top))" }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          if (step === "slots") { setSelectedTeller(null); setSelectedDate(null); setSelectedTime(null); }
          else if (step === "confirm") { setShowConfirm(false); }
          else { window.location.href = "/home"; }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </motion.button>

      {/* Header */}
      <motion.div
        className="text-center mb-5"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <h2 className="text-lg text-gold font-semibold tracking-wide">นัดหมอดู</h2>
        <p className="text-white/25 text-xs mt-1">จองคิวดูดวงกับหมอดูตัวจริง</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Teller List ── */}
        {step === "list" && (
          <motion.div
            key="list"
            className="w-full max-w-md space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {TELLERS.map((teller, idx) => (
              <motion.button
                key={teller.id}
                className="w-full rounded-2xl border border-white/[0.06] bg-[#0c0d14]/90 p-4 text-left active:scale-[0.98] transition-transform"
                style={{ borderColor: `${teller.color}20` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.06, duration: 0.4, ease: EASE }}
                onClick={() => setSelectedTeller(teller)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: `${teller.color}18`, border: `2px solid ${teller.color}40`, color: teller.color }}
                  >
                    {teller.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white/85 text-sm font-semibold">{teller.name}</p>
                      <Stars count={teller.rating} />
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">{teller.specialty}</p>
                    <p className="text-xs mt-1" style={{ color: teller.color }}>{teller.price}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── Time Slots ── */}
        {step === "slots" && selectedTeller && (
          <motion.div
            key="slots"
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {/* Selected teller info */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl border border-white/[0.06] bg-[#0c0d14]/90">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: `${selectedTeller.color}18`, border: `2px solid ${selectedTeller.color}40`, color: selectedTeller.color }}
              >
                {selectedTeller.initials}
              </div>
              <div>
                <p className="text-white/80 text-sm font-semibold">{selectedTeller.name}</p>
                <p className="text-white/30 text-[0.65rem]">{selectedTeller.price}</p>
              </div>
            </div>

            {/* Date selection */}
            <p className="text-white/40 text-xs mb-2">เลือกวัน</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
              {nextDays.map((day, idx) => {
                const isSel = selectedDate?.toDateString() === day.toDateString();
                return (
                  <button
                    key={idx}
                    className={`flex-shrink-0 w-14 rounded-xl p-2 flex flex-col items-center gap-0.5 border transition-colors ${
                      isSel ? "border-gold/60 bg-gold/10" : "border-white/[0.06] bg-[#0c0d14]/90"
                    }`}
                    onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                  >
                    <span className="text-[0.6rem] text-white/35">{THAI_DAYS[day.getDay()]}</span>
                    <span className={`text-sm font-semibold ${isSel ? "text-gold" : "text-white/70"}`}>{day.getDate()}</span>
                    <span className="text-[0.55rem] text-white/25">
                      {day.toLocaleDateString("th-TH", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <p className="text-white/40 text-xs mb-2">เลือกเวลา</p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {getSlots(selectedDate).map((slot) => {
                    const isSel = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
                          isSel
                            ? "border-gold/60 bg-gold/10 text-gold"
                            : "border-white/[0.06] bg-[#0c0d14]/90 text-white/50 active:bg-white/5"
                        }`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Confirm button */}
            {selectedTime && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button onClick={() => setShowConfirm(true)}>ยืนยันการจอง</Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Confirmation ── */}
        {step === "confirm" && selectedTeller && selectedDate && selectedTime && (
          <motion.div
            key="confirm"
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c0d14]/95 p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h3 className="text-gold text-sm font-semibold text-center mb-4">ยืนยันการจอง</h3>
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-white/40">หมอดู</span>
                <span className="text-white/80">{selectedTeller.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">วันที่</span>
                <span className="text-white/80">
                  {selectedDate.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">เวลา</span>
                <span className="text-white/80">{selectedTime} น.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">ราคา</span>
                <span className="text-gold font-semibold">{selectedTeller.price}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>ยกเลิก</Button>
              <Button onClick={handleConfirm}>ยืนยัน</Button>
            </div>
          </motion.div>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <motion.div
            key="success"
            className="w-full max-w-md flex flex-col items-center py-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-gold text-sm font-semibold mb-1">จองสำเร็จ!</p>
            <p className="text-white/40 text-xs text-center mb-6">รอการยืนยันจากหมอดู</p>
            <Button variant="outline" onClick={handleReset}>จองอีกครั้ง</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
