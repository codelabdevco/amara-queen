"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

/* ── Types ── */
interface DayFortune {
  date: Date;
  level: "great" | "good" | "neutral" | "caution";
  overall: number; love: number; career: number; money: number; health: number;
  luckyColor: string; luckyNumber: string;
  tip: string; summary: string; avoid: string;
  specialDay: string; isAuspicious: boolean;
}

/* ── Helpers ── */
const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const DAY_COLORS = ["#c44a5a", "#d4af37", "#c44a8a", "#4a9e6e", "#d85a30", "#378add", "#7a4090"];
const LEVEL_LABEL: Record<string, string> = { great: "ดีมาก", good: "ดี", neutral: "ปกติ", caution: "ระวัง" };
const LEVEL_ICON: Record<string, string> = { great: "★", good: "☆", neutral: "◇", caution: "△" };

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const LUCKY_COLORS = ["แดง", "ทอง", "เขียว", "ชมพู", "ฟ้า", "ม่วง", "ขาว", "ดำ", "ส้ม", "เงิน"];
const TIPS = [
  "วันนี้เหมาะกับการเริ่มต้นสิ่งใหม่", "ควรระวังเรื่องการเงิน", "วันดีสำหรับความรัก",
  "เหมาะกับการเจรจาต่อรอง", "ควรพักผ่อนให้เพียงพอ", "โชคดีเรื่องการงาน",
  "ระวังการเดินทาง", "วันมงคลสำหรับทำบุญ", "เหมาะกับการลงทุน", "ควรใช้เวลากับครอบครัว",
];

function generateWeekMock(monday: Date): DayFortune[] {
  const week: DayFortune[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const r = seededRandom(seed);
    const level = r < 0.25 ? "great" : r < 0.55 ? "good" : r < 0.8 ? "neutral" : "caution";
    week.push({
      date, level: level as DayFortune["level"],
      overall: Math.ceil(seededRandom(seed + 1) * 5),
      love: Math.ceil(seededRandom(seed + 2) * 5),
      career: Math.ceil(seededRandom(seed + 3) * 5),
      money: Math.ceil(seededRandom(seed + 4) * 5),
      health: Math.ceil(seededRandom(seed + 5) * 5),
      luckyColor: LUCKY_COLORS[Math.floor(seededRandom(seed + 6) * LUCKY_COLORS.length)],
      luckyNumber: String(Math.ceil(seededRandom(seed + 7) * 99)),
      tip: TIPS[Math.floor(seededRandom(seed + 8) * TIPS.length)],
      summary: "", avoid: "",
      specialDay: date.getDay() === 0 || seededRandom(seed + 9) > 0.85 ? "วันมงคล" : "",
      isAuspicious: seededRandom(seed + 10) > 0.6,
    });
  }
  return week;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="w-4 h-1.5 rounded-full" style={{ background: i < value ? "#d4af37" : "#3A0E0E" }} />
      ))}
    </div>
  );
}

const CATEGORIES = [
  { key: "overall" as const, label: "ดวงรวม", icon: "☆" },
  { key: "love" as const, label: "ความรัก", icon: "♥" },
  { key: "career" as const, label: "การงาน", icon: "⚙" },
  { key: "money" as const, label: "การเงิน", icon: "✦" },
  { key: "health" as const, label: "สุขภาพ", icon: "✚" },
];

/* ── Component ── */
export default function CalendarScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [aiDetail, setAiDetail] = useState<DayFortune | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [view, setView] = useState<"week" | "month">("week");

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const week = useMemo(() => generateWeekMock(monday), [monday]);
  const selected = selectedIdx !== null ? week[selectedIdx] : null;

  async function fetchAIFortune(date: Date) {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString().slice(0, 10) }),
      });
      const data = await res.json();
      if (data.fortune) setAiDetail(data.fortune);
    } catch {}
    setLoadingAI(false);
  }

  return (
    <motion.div
      className="flex flex-col items-center h-full px-4 pt-2 overflow-y-auto pb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div className="text-center mb-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-base font-semibold tracking-[0.1em] mb-0.5"
          style={{ background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer-text 4s ease-in-out infinite" }}
        >วันดีวันร้าย</h2>
        <p className="text-[#8B7A4A]/50 text-[0.65rem]">ปฏิทินดวงรายสัปดาห์</p>
      </motion.div>

      {/* Week nav */}
      <div className="flex items-center justify-between w-full max-w-md mb-3">
        <button className="px-2.5 py-1.5 rounded text-[#E2D4A0]/40 text-[0.65rem] active:text-[#d4af37]" style={{ background: "#3A0E0E", border: "0.5px solid #8B7A4A15" }}
          onClick={() => { setWeekOffset(o => o - 1); setSelectedIdx(null); setAiDetail(null); }}>◂ ก่อน</button>
        <span className="text-[#8B7A4A]/50 text-[0.65rem]">
          {monday.toLocaleDateString("th-TH", { day: "numeric", month: "short" })} — {new Date(monday.getTime() + 6 * 86400000).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
        </span>
        <button className="px-2.5 py-1.5 rounded text-[#E2D4A0]/40 text-[0.65rem] active:text-[#d4af37]" style={{ background: "#3A0E0E", border: "0.5px solid #8B7A4A15" }}
          onClick={() => { setWeekOffset(o => o + 1); setSelectedIdx(null); setAiDetail(null); }}>ถัดไป ▸</button>
      </div>

      {/* Day cards */}
      <div className="flex gap-1.5 w-full max-w-md mb-3">
        {week.map((day, idx) => {
          const isSelected = selectedIdx === idx;
          const isToday = day.date.toDateString() === new Date().toDateString();
          const dayColor = DAY_COLORS[day.date.getDay()];
          return (
            <button key={day.date.toISOString()}
              className={`flex-1 rounded-lg p-1.5 flex flex-col items-center gap-0.5 transition-all ${isSelected ? "shadow-[0_0_10px_rgba(212,175,55,0.1)]" : ""}`}
              style={{ background: isSelected ? "#3A0E0E" : isToday ? "#2a1215" : "#1e0c0c", border: isSelected ? "1px solid #8B7A4A40" : isToday ? "1px solid #8B7A4A15" : "0.5px solid #8B7A4A08" }}
              onClick={() => { setSelectedIdx(isSelected ? null : idx); setAiDetail(null); }}
            >
              <span className="text-[0.5rem]" style={{ color: dayColor }}>{THAI_DAYS_SHORT[day.date.getDay()]}</span>
              <span className={`text-sm font-semibold ${isSelected ? "text-[#d4af37]" : isToday ? "text-[#E2D4A0]" : "text-[#E2D4A0]/50"}`}>{day.date.getDate()}</span>
              <span className="text-[0.5rem]" style={{ color: day.level === "great" ? "#d4af37" : day.level === "good" ? "#C4AD72" : day.level === "neutral" ? "#8B7A4A" : "#7a2020" }}>
                {LEVEL_ICON[day.level]}
              </span>
              {day.specialDay && <span className="w-1 h-1 rounded-full bg-[#d4af37]" />}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div key={selected.date.toISOString()} className="w-full max-w-md rounded-lg overflow-hidden"
            style={{ background: "#2a1215", border: "0.5px solid #8B7A4A15" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
          >
            {/* Day header */}
            <div className="p-3 flex items-center justify-between" style={{ background: "#3A0E0E" }}>
              <div>
                <p className="text-[#E2D4A0] text-sm font-semibold">
                  วัน{THAI_DAYS[selected.date.getDay()]}ที่ {selected.date.getDate()} {selected.date.toLocaleDateString("th-TH", { month: "long" })}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[0.6rem]" style={{ color: selected.level === "great" ? "#d4af37" : selected.level === "good" ? "#C4AD72" : "#8B7A4A" }}>
                    {LEVEL_ICON[selected.level]} {LEVEL_LABEL[selected.level]}
                  </span>
                  {selected.specialDay && <span className="text-[#d4af37]/50 text-[0.55rem]">· {selected.specialDay}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#8B7A4A]/40 text-[0.5rem]">สีมงคล</p>
                <p className="text-[#E2D4A0]/70 text-xs">{selected.luckyColor}</p>
              </div>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-3 gap-0 text-center" style={{ borderTop: "0.5px solid #8B7A4A10" }}>
              <div className="p-2" style={{ borderRight: "0.5px solid #8B7A4A10" }}>
                <p className="text-[#8B7A4A]/30 text-[0.5rem]">เลขมงคล</p>
                <p className="text-[#d4af37] text-sm font-semibold">{selected.luckyNumber}</p>
              </div>
              <div className="p-2" style={{ borderRight: "0.5px solid #8B7A4A10" }}>
                <p className="text-[#8B7A4A]/30 text-[0.5rem]">สีมงคล</p>
                <p className="text-[#E2D4A0]/70 text-xs">{selected.luckyColor}</p>
              </div>
              <div className="p-2">
                <p className="text-[#8B7A4A]/30 text-[0.5rem]">ฤกษ์</p>
                <p className="text-xs" style={{ color: selected.isAuspicious ? "#d4af37" : "#8B7A4A" }}>{selected.isAuspicious ? "มงคล" : "ปกติ"}</p>
              </div>
            </div>

            {/* Ratings */}
            <div className="p-3 space-y-1.5" style={{ borderTop: "0.5px solid #8B7A4A10" }}>
              {CATEGORIES.map(cat => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className="text-[#8B7A4A]/50 text-[0.65rem] flex items-center gap-1">
                    <span className="opacity-50">{cat.icon}</span> {cat.label}
                  </span>
                  <RatingBar value={selected[cat.key]} />
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="px-3 pb-2" style={{ borderTop: "0.5px solid #8B7A4A10" }}>
              <p className="text-[#E2D4A0]/50 text-xs leading-5 py-2">💡 {selected.tip}</p>
            </div>

            {/* AI detail or button */}
            <div className="p-3" style={{ borderTop: "0.5px solid #8B7A4A10" }}>
              {aiDetail ? (
                <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-[#E2D4A0]/70 text-xs leading-5">{aiDetail.summary}</p>
                  {aiDetail.avoid && <p className="text-[#7a2020]/60 text-[0.65rem]">⚠ {aiDetail.avoid}</p>}
                </motion.div>
              ) : loadingAI ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-3 h-3 border border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
                  <span className="text-[#8B7A4A]/50 text-xs">กำลังอ่านดวงชะตา...</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  <LaurelButton variant="crimson" onClick={() => fetchAIFortune(selected.date)} className="w-full h-[42px]">
                    ★1 เปิดดวงชะตาละเอียด
                  </LaurelButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        {(["great", "good", "neutral", "caution"] as const).map(level => (
          <div key={level} className="flex items-center gap-1">
            <span className="text-[0.55rem]" style={{ color: level === "great" ? "#d4af37" : level === "good" ? "#C4AD72" : level === "neutral" ? "#8B7A4A" : "#7a2020" }}>{LEVEL_ICON[level]}</span>
            <span className="text-[#8B7A4A]/40 text-[0.5rem]">{LEVEL_LABEL[level]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
