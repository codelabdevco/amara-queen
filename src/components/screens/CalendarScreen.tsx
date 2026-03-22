"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

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
const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const LEVEL_COLOR: Record<DayFortune["level"], string> = { good: "#4ade80", neutral: "#e8d48b", caution: "#ef4444" };
const LEVEL_TEXT: Record<DayFortune["level"], string> = { good: "ดี", neutral: "กลาง", caution: "ระวัง" };

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
      date,
      level,
      overall: Math.ceil(seededRandom(seed + 1) * 5),
      love: Math.ceil(seededRandom(seed + 2) * 5),
      career: Math.ceil(seededRandom(seed + 3) * 5),
      money: Math.ceil(seededRandom(seed + 4) * 5),
      health: Math.ceil(seededRandom(seed + 5) * 5),
    });
  }
  return week;
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? "text-gold" : "text-white/15"}>&#9733;</span>
      ))}
    </span>
  );
}

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

  const CATEGORIES = [
    { key: "overall" as const, label: "ดวงรวม" },
    { key: "love" as const, label: "ความรัก" },
    { key: "career" as const, label: "การงาน" },
    { key: "money" as const, label: "การเงิน" },
    { key: "health" as const, label: "สุขภาพ" },
  ];

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-5"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <h2 className="text-lg text-gold font-semibold tracking-wide">วันดีวันร้าย</h2>
        <p className="text-gold/25 text-xs mt-1">ปฏิทินดวงรายสัปดาห์</p>
      </motion.div>

      {/* Week nav */}
      <motion.div
        className="flex items-center justify-between w-full max-w-md mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button
          className="px-3 py-1.5 rounded-lg border border-white/[0.03] text-white/50 text-xs active:bg-gold/5"
          onClick={() => { setWeekOffset((o) => o - 1); setSelectedIdx(null); }}
        >
          สัปดาห์ก่อน
        </button>
        <span className="text-white/40 text-xs">
          {monday.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
          {" - "}
          {new Date(monday.getTime() + 6 * 86400000).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <button
          className="px-3 py-1.5 rounded-lg border border-white/[0.03] text-white/50 text-xs active:bg-gold/5"
          onClick={() => { setWeekOffset((o) => o + 1); setSelectedIdx(null); }}
        >
          สัปดาห์ถัดไป
        </button>
      </motion.div>

      {/* Day cards row */}
      <div className="flex gap-2 w-full max-w-md overflow-x-auto pb-2 scrollbar-hide">
        {week.map((day, idx) => {
          const isSelected = selectedIdx === idx;
          const isToday =
            day.date.toDateString() === new Date().toDateString();
          return (
            <motion.button
              key={day.date.toISOString()}
              className={`flex-shrink-0 w-[calc((100%-48px)/7)] min-w-[52px] rounded-xl p-2 flex flex-col items-center gap-1 border transition-colors ${
                isSelected
                  ? "border-gold/20 bg-gold/10"
                  : isToday
                  ? "border-white/20 bg-gold/5"
                  : "border-gold/[0.02] bg-[#2a1215]/90"
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.04, duration: 0.4, ease: EASE }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
            >
              <span className="text-[0.6rem] text-white/35">{THAI_DAYS[day.date.getDay()]}</span>
              <span className={`text-sm font-semibold ${isSelected ? "text-gold" : "text-white/80"}`}>
                {day.date.getDate()}
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: LEVEL_COLOR[day.level] }}
              />
              <span className="text-[0.55rem]" style={{ color: LEVEL_COLOR[day.level] }}>
                {LEVEL_TEXT[day.level]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.date.toISOString()}
            className="w-full max-w-md mt-4 rounded-2xl border border-white/[0.02] bg-[#2a1215]/95 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-semibold">
                  {THAI_DAYS[selected.date.getDay()]}ที่ {selected.date.getDate()}{" "}
                  {selected.date.toLocaleDateString("th-TH", { month: "long" })}
                </p>
                <p className="text-xs mt-0.5" style={{ color: LEVEL_COLOR[selected.level] }}>
                  ดวงวันนี้: {LEVEL_TEXT[selected.level]}
                </p>
              </div>
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: LEVEL_COLOR[selected.level], boxShadow: `0 0 12px ${LEVEL_COLOR[selected.level]}40` }}
              />
            </div>

            <div className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className="text-white/50 text-xs w-16">{cat.label}</span>
                  <Stars count={selected[cat.key]} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <motion.div
        className="flex items-center gap-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {(["good", "neutral", "caution"] as const).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LEVEL_COLOR[level] }} />
            <span className="text-white/30 text-[0.6rem]">{LEVEL_TEXT[level]}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
