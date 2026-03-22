"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

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
  { id: "chang", name: "หมอช้าง", initials: "ช", specialty: "เชี่ยวชาญดวงจีน ประสบการณ์ 20 ปี", price: "฿500/30นาที", rating: 5, color: "#d4af37" },
  { id: "mod", name: "อาจารย์มด", initials: "ม", specialty: "ไพ่ทาโร่ + ไพ่ยิปซี", price: "฿300/30นาที", rating: 4, color: "#C4AD72" },
  { id: "jane", name: "แม่หมอเจน", initials: "จ", specialty: "ดวงไทย ลายมือ", price: "฿400/30นาที", rating: 5, color: "#8B7A4A" },
];

const TIME_SLOTS = ["10:00", "13:00", "15:00", "17:00"];

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "text-[#d4af37] text-[0.6rem]" : "text-[#3A0E0E] text-[0.6rem]"}>&#9733;</span>
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

interface ProfileData {
  profile: { nickname: string; firstName: string; lastName: string } | null;
  zodiac: { western: { signTh: string }; age: number } | null;
  linePictureUrl: string | null;
  credits: number;
  totalReadings: number;
}

/* ── Component ── */
export default function BookingScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  useEffect(() => {
    fetch("/api/auth/profile").then(r => r.ok ? r.json() : null).then(d => { if (d) setProfileData(d); }).catch(() => {});
  }, []);

  const [selectedTeller, setSelectedTeller] = useState<Teller | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const nextDays = useMemo(() => getNextDays(7), []);

  function getSlots(date: Date): string[] {
    const seed = date.getDate();
    return TIME_SLOTS.filter((_, i) => (seed + i) % 5 !== 0);
  }

  function handleConfirm() { setShowConfirm(false); setShowSuccess(true); }
  function handleReset() { setSelectedTeller(null); setSelectedDate(null); setSelectedTime(null); setShowSuccess(false); setShowConfirm(false); }

  type Step = "list" | "slots" | "confirm" | "success";
  const step: Step = showSuccess ? "success" : showConfirm ? "confirm" : selectedTeller ? "slots" : "list";

  return (
    <motion.div className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Profile Card */}
      {profileData?.profile && (
        <motion.div className="w-full max-w-md mb-5 bg-[#2a1215] rounded-lg p-4"
          style={{ border: "0.5px solid #8B7A4A20" }}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="flex items-center gap-3">
            {profileData.linePictureUrl ? (
              <img src={profileData.linePictureUrl} alt="" className="w-11 h-11 rounded-full" style={{ border: "1px solid #8B7A4A30" }} />
            ) : (
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#3A0E0E", border: "1px solid #8B7A4A30" }}>
                <span className="text-[#E2D4A0] text-base">{profileData.profile.nickname?.charAt(0) || "?"}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[#E2D4A0] font-medium text-sm truncate">{profileData.profile.nickname}</p>
              {profileData.zodiac && <p className="text-[#8B7A4A]/50 text-[0.65rem]">ราศี{profileData.zodiac.western.signTh} · อายุ {profileData.zodiac.age} ปี</p>}
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-[#d4af37] text-sm font-semibold">{profileData.totalReadings}</p>
                <p className="text-[#8B7A4A]/40 text-[0.5rem]">ดูดวง</p>
              </div>
              <div className="text-center">
                <p className="text-[#d4af37] text-sm font-semibold">{profileData.credits}</p>
                <p className="text-[#8B7A4A]/40 text-[0.5rem]">เครดิต</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div className="text-center mb-5" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }}>
        <h2 className="text-lg font-semibold tracking-[0.1em] mb-1"
          style={{ background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer-text 4s ease-in-out infinite" }}
        >นัดหมอดู</h2>
        <p className="text-[#8B7A4A]/50 text-xs">จองคิวดูดวงกับหมอดูตัวจริง</p>
        <motion.div className="w-16 h-[1px] mx-auto mt-3" style={{ background: "linear-gradient(90deg, transparent, #8B7A4A, transparent)" }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Teller List ── */}
        {step === "list" && (
          <motion.div key="list" className="w-full max-w-md space-y-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }}
          >
            {TELLERS.map((teller, idx) => (
              <motion.button key={teller.id} className="w-full text-left"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: EASE }}
                onClick={() => setSelectedTeller(teller)}
              >
                <div className="bg-[#2a1215] rounded-lg p-4 active:scale-[0.98] transition-transform" style={{ border: "0.5px solid #8B7A4A15" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{ background: "#3A0E0E", border: `1.5px solid ${teller.color}40`, color: teller.color }}
                    >{teller.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[#E2D4A0] text-sm font-semibold">{teller.name}</p>
                        <Stars count={teller.rating} />
                      </div>
                      <p className="text-[#8B7A4A]/50 text-xs mt-0.5">{teller.specialty}</p>
                      <p className="text-[#d4af37]/70 text-xs mt-1 font-medium">{teller.price}</p>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── Time Slots ── */}
        {step === "slots" && selectedTeller && (
          <motion.div key="slots" className="w-full max-w-md"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-[#2a1215]" style={{ border: "0.5px solid #8B7A4A15" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "#3A0E0E", border: `1.5px solid ${selectedTeller.color}40`, color: selectedTeller.color }}
              >{selectedTeller.initials}</div>
              <div>
                <p className="text-[#E2D4A0] text-sm font-semibold">{selectedTeller.name}</p>
                <p className="text-[#8B7A4A]/50 text-[0.65rem]">{selectedTeller.price}</p>
              </div>
            </div>

            <p className="text-[#8B7A4A]/50 text-xs mb-2">เลือกวัน</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
              {nextDays.map((day: Date, idx: number) => {
                const isSel = selectedDate?.toDateString() === day.toDateString();
                return (
                  <button key={idx}
                    className={`flex-shrink-0 w-14 rounded-lg p-2 flex flex-col items-center gap-0.5 transition-all ${
                      isSel ? "bg-[#3A0E0E] shadow-[0_0_12px_rgba(212,175,55,0.08)]" : "bg-[#2a1215]"
                    }`}
                    style={{ border: isSel ? "1px solid #8B7A4A40" : "0.5px solid #8B7A4A15" }}
                    onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                  >
                    <span className="text-[0.6rem] text-[#8B7A4A]/40">{THAI_DAYS[day.getDay()]}</span>
                    <span className={`text-sm font-semibold ${isSel ? "text-[#d4af37]" : "text-[#E2D4A0]/60"}`}>{day.getDate()}</span>
                    <span className="text-[0.55rem] text-[#8B7A4A]/30">
                      {day.toLocaleDateString("th-TH", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                <p className="text-[#8B7A4A]/50 text-xs mb-2">เลือกเวลา</p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {getSlots(selectedDate).map((slot) => {
                    const isSel = selectedTime === slot;
                    return (
                      <button key={slot}
                        className={`rounded-lg py-2.5 text-xs font-medium transition-all ${
                          isSel ? "bg-[#3A0E0E] text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.08)]" : "bg-[#2a1215] text-[#E2D4A0]/40 active:bg-[#3A0E0E]"
                        }`}
                        style={{ border: isSel ? "1px solid #8B7A4A40" : "0.5px solid #8B7A4A15" }}
                        onClick={() => setSelectedTime(slot)}
                      >{slot}</button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedTime && (
              <motion.div className="flex justify-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <LaurelButton variant="gold" onClick={() => setShowConfirm(true)}>ยืนยันการจอง</LaurelButton>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Confirmation ── */}
        {step === "confirm" && selectedTeller && selectedDate && selectedTime && (
          <motion.div key="confirm" className="w-full max-w-md rounded-lg bg-[#2a1215] p-6"
            style={{ border: "0.5px solid #8B7A4A20" }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h3 className="text-[#d4af37] text-sm font-semibold text-center mb-4">ยืนยันการจอง</h3>
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between"><span className="text-[#8B7A4A]/50">หมอดู</span><span className="text-[#E2D4A0]">{selectedTeller.name}</span></div>
              <div className="flex justify-between"><span className="text-[#8B7A4A]/50">วันที่</span><span className="text-[#E2D4A0]">{selectedDate.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}</span></div>
              <div className="flex justify-between"><span className="text-[#8B7A4A]/50">เวลา</span><span className="text-[#E2D4A0]">{selectedTime} น.</span></div>
              <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #8B7A4A30, transparent)" }} />
              <div className="flex justify-between"><span className="text-[#8B7A4A]/50">ราคา</span><span className="text-[#d4af37] font-semibold">{selectedTeller.price}</span></div>
            </div>
            <div className="flex gap-3 justify-center">
              <LaurelButton variant="crimson" onClick={() => setShowConfirm(false)}>ยกเลิก</LaurelButton>
              <LaurelButton variant="gold" onClick={handleConfirm}>ยืนยัน</LaurelButton>
            </div>
          </motion.div>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <motion.div key="success" className="w-full max-w-md flex flex-col items-center py-10"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#1a0a0a", border: "1px solid #8B7A4A30" }}
            >
              <span className="text-[#d4af37] text-2xl">&#10003;</span>
            </div>
            <p className="text-[#d4af37] text-sm font-semibold mb-1">จองสำเร็จ!</p>
            <p className="text-[#8B7A4A]/50 text-xs text-center mb-6">รอการยืนยันจากหมอดู</p>
            <LaurelButton variant="crimson" onClick={handleReset}>จองอีกครั้ง</LaurelButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
