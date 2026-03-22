"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { EASE } from "@/constants/animation";

/* ── Types ── */
interface DayFortune {
  date: Date;
  level: "good" | "neutral" | "caution";
  overall: number;
  love: number;
  career: number;
  money: number;
  health: number;
}

/* ── Helpers ── */
const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const LEVEL_COLOR: Record<DayFortune["level"], string> = { good: "#d4af37", neutral: "#8B7A4A", caution: "#7a2020" };
const LEVEL_TEXT: Record<DayFortune["level"], string> = { good: "ดี", neutral: "กลาง", caution: "ระวัง" };
const LEVEL_ICON: Record<DayFortune["level"], string> = { good: "☆", neutral: "◇", caution: "△" };

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateWeek(monday: Date): DayFortune[] {
  const week: DayFortune[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const r = seededRandom(seed);
    const level: DayFortune["level"] = r < 0.4 ? "good" : r < 0.75 ? "neutral" : "caution";
    week.push({
      date, level,
      overall: Math.ceil(seededRandom(seed + 1) * 5),
      love: Math.ceil(seededRandom(seed + 2) * 5),
      career: Math.ceil(seededRandom(seed + 3) * 5),
      money: Math.ceil(seededRandom(seed + 4) * 5),
      health: Math.ceil(seededRandom(seed + 5) * 5),
    });
  }
  return week;
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="w-5 h-1.5 rounded-full" style={{ background: i < value ? "#d4af37" : "#3A0E0E" }} />
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

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const week = useMemo(() => generateWeek(monday), [monday]);
  const selected = selectedIdx !== null ? week[selectedIdx] : null;

  return (
    <motion.div
      className="flex flex-col items-center h-full px-4 pt-2"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div className="text-center mb-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <h2
          className="text-base font-semibold tracking-[0.1em] mb-0.5"
          style={{
            background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer-text 4s ease-in-out infinite",
          }}
        >วันดีวันร้าย</h2>
        <p className="text-[#8B7A4A]/50 text-[0.65rem]">ปฏิทินดวงรายสัปดาห์</p>
      </motion.div>

      {/* Week nav */}
      <div className="flex items-center justify-between w-full max-w-md mb-3">
        <button
          className="px-2.5 py-1.5 rounded text-[#E2D4A0]/40 text-[0.65rem] active:text-[#d4af37] transition-colors"
          style={{ background: "#3A0E0E", border: "0.5px solid #8B7A4A15" }}
          onClick={() => { setWeekOffset(o => o - 1); setSelectedIdx(null); }}
        >
          ◂ ก่อน
        </button>
        <span className="text-[#8B7A4A]/50 text-[0.65rem]">
          {monday.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
          {" — "}
          {new Date(monday.getTime() + 6 * 86400000).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
        </span>
        <button
          className="px-2.5 py-1.5 rounded text-[#E2D4A0]/40 text-[0.65rem] active:text-[#d4af37] transition-colors"
          style={{ background: "#3A0E0E", border: "0.5px solid #8B7A4A15" }}
          onClick={() => { setWeekOffset(o => o + 1); setSelectedIdx(null); }}
        >
          ถัดไป ▸
        </button>
      </div>

      {/* Day cards */}
      <div className="flex gap-1.5 w-full max-w-md">
        {week.map((day, idx) => {
          const isSelected = selectedIdx === idx;
          const isToday = day.date.toDateString() === new Date().toDateString();
          return (
            <button
              key={day.date.toISOString()}
              className={`flex-1 rounded-lg p-1.5 flex flex-col items-center gap-0.5 transition-all ${
                isSelected ? "shadow-[0_0_10px_rgba(212,175,55,0.1)]" : ""
              }`}
              style={{
                background: isSelected ? "#3A0E0E" : isToday ? "#2a1215" : "#1e0c0c",
                border: isSelected ? "1px solid #8B7A4A40" : isToday ? "1px solid #8B7A4A15" : "0.5px solid #8B7A4A08",
              }}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
            >
              <span className="text-[0.5rem] text-[#8B7A4A]/40">{THAI_DAYS_SHORT[day.date.getDay()]}</span>
              <span className={`text-sm font-semibold ${isSelected ? "text-[#d4af37]" : isToday ? "text-[#E2D4A0]" : "text-[#E2D4A0]/50"}`}>
                {day.date.getDate()}
              </span>
              <span className="text-[0.6rem]" style={{ color: LEVEL_COLOR[day.level] }}>
                {LEVEL_ICON[day.level]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.date.toISOString()}
            className="w-full max-w-md mt-3 rounded-lg p-4"
            style={{ background: "#2a1215", border: "0.5px solid #8B7A4A15" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#E2D4A0] text-sm font-semibold">
                  {THAI_DAYS[selected.date.getDay()]}ที่ {selected.date.getDate()}{" "}
                  {selected.date.toLocaleDateString("th-TH", { month: "long" })}
                </p>
                <p className="text-[0.65rem] mt-0.5" style={{ color: LEVEL_COLOR[selected.level] }}>
                  {LEVEL_ICON[selected.level]} ดวงวันนี้: {LEVEL_TEXT[selected.level]}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className="text-[#8B7A4A]/50 text-[0.7rem] flex items-center gap-1.5">
                    <span className="opacity-50">{cat.icon}</span> {cat.label}
                  </span>
                  <RatingBar value={selected[cat.key]} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {(["good", "neutral", "caution"] as const).map((level) => (
          <div key={level} className="flex items-center gap-1">
            <span className="text-[0.6rem]" style={{ color: LEVEL_COLOR[level] }}>{LEVEL_ICON[level]}</span>
            <span className="text-[#8B7A4A]/40 text-[0.55rem]">{LEVEL_TEXT[level]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
