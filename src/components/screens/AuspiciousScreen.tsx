"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

// ── Event types ──
const EVENT_TYPES = [
  { id: "wedding", icon: "♥", name: "แต่งงาน", desc: "พิธีมงคลสมรส", color: "#c44a5a" },
  { id: "housewarming", icon: "⌂", name: "ขึ้นบ้านใหม่", desc: "ย้ายเข้าบ้าน ทำบุญบ้าน", color: "#d4a84b" },
  { id: "business", icon: "⚙", name: "เปิดกิจการ", desc: "เริ่มธุรกิจ เปิดร้าน", color: "#e8d48b" },
  { id: "car", icon: "☆", name: "ออกรถใหม่", desc: "รับรถ จดทะเบียน", color: "#a8d48b" },
  { id: "travel", icon: "✈", name: "เดินทาง", desc: "ท่องเที่ยว เดินทางไกล", color: "#8bb8d4" },
  { id: "exam", icon: "✎", name: "สอบ/สัมภาษณ์", desc: "สอบเข้า สัมภาษณ์งาน", color: "#b48bd4" },
  { id: "medical", icon: "✚", name: "ผ่าตัด/รักษา", desc: "นัดหมอ ผ่าตัด", color: "#5ab4a8" },
  { id: "merit", icon: "☸", name: "ทำบุญ", desc: "ทำบุญ ถวายสังฆทาน", color: "#d4884b" },
];

// ── Thai days of week ──
const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = THAI_DAYS[d.getDay()];
  const date = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `วัน${day}ที่ ${date} ${month} ${year}`;
}

// ── Auspicious level config ──
const AUSPICIOUS_CONFIG: Record<string, { label: string; color: string; icon: string; bg: string; gradient: string }> = {
  excellent: { label: "ดีมาก", color: "#e8d48b", icon: "✦", bg: "rgba(232,212,139,0.08)", gradient: "from-[#e8d48b]/20 via-[#e8d48b]/5 to-transparent" },
  good:      { label: "ดี",    color: "#a8d48b", icon: "✦", bg: "rgba(168,212,139,0.06)", gradient: "from-[#a8d48b]/15 via-[#a8d48b]/5 to-transparent" },
  fair:      { label: "กลาง",  color: "#8bb8d4", icon: "☯", bg: "rgba(139,184,212,0.06)", gradient: "from-[#8bb8d4]/15 via-[#8bb8d4]/5 to-transparent" },
  poor:      { label: "ไม่ดี", color: "#c44a5a", icon: "⚡", bg: "rgba(196,74,90,0.06)",  gradient: "from-[#c44a5a]/15 via-[#c44a5a]/5 to-transparent" },
};

// ── Mock response generator ──
function generateMockAuspicious(event: string, dateStr: string) {
  const d = new Date(dateStr);
  const dayOfWeek = d.getDay();
  const eventObj = EVENT_TYPES.find((e) => e.id === event);

  // Simple logic for mock: weekday-based
  const levelMap: Record<number, "excellent" | "good" | "fair" | "poor"> = {
    0: "good",     // Sunday
    1: "fair",     // Monday
    2: "caution" as "poor",
    3: "good",     // Wednesday
    4: "excellent", // Thursday
    5: "good",     // Friday
    6: "fair",     // Saturday
  };
  const level = levelMap[dayOfWeek] || "fair";

  const analyses: Record<string, string[]> = {
    excellent: [
      `วัน${THAI_DAYS[dayOfWeek]}เป็นวันมงคลสำหรับ${eventObj?.name || "งานนี้"} ดาวพฤหัสบดีส่องแสงเสริมดวงให้ทุกสิ่งเป็นไปด้วยดี พลังงานจากจักรวาลสนับสนุนให้สำเร็จลุล่วง ผู้ใหญ่เมตตา คนรอบข้างร่วมมือ เป็นฤกษ์ที่ดีเยี่ยม`,
      `ฤกษ์งามยามดี ดาวนพเคราะห์เรียงตัวเป็นมงคล เหมาะอย่างยิ่งสำหรับ${eventObj?.name || "งานนี้"} จะนำพาความเจริญรุ่งเรือง ความสุข และโชคลาภมาสู่ท่าน`,
    ],
    good: [
      `วัน${THAI_DAYS[dayOfWeek]}เป็นวันที่เหมาะสมสำหรับ${eventObj?.name || "งานนี้"} ดวงดาวอยู่ในตำแหน่งที่ดี มีพลังบวกหนุนนำ แม้อาจมีอุปสรรคเล็กน้อย แต่โดยรวมเป็นมงคล`,
      `ฤกษ์ดีสำหรับ${eventObj?.name || "งานนี้"} พลังงานของวัน${THAI_DAYS[dayOfWeek]}ส่งเสริมให้ทุกอย่างราบรื่น ควรเริ่มในช่วงเช้าจะดียิ่งขึ้น`,
    ],
    fair: [
      `วัน${THAI_DAYS[dayOfWeek]}อยู่ในเกณฑ์ปานกลางสำหรับ${eventObj?.name || "งานนี้"} ไม่ได้เป็นฤกษ์ดีหรือร้าย ควรพิจารณาเลือกเวลาที่เหมาะสมในวัน หากเลี่ยงไม่ได้ให้ทำบุญเสริมดวงก่อน`,
      `ฤกษ์กลางๆ สำหรับ${eventObj?.name || "งานนี้"} ไม่ถึงกับไม่ดี แต่ก็ไม่ได้เป็นฤกษ์มงคลมาก ถ้าเป็นไปได้ลองเลื่อนไปวันอื่นจะดีกว่า`,
    ],
    poor: [
      `วัน${THAI_DAYS[dayOfWeek]}ไม่เหมาะสำหรับ${eventObj?.name || "งานนี้"} ดาวอังคารกำลังย้ายราศี อาจนำพาปัญหาและอุปสรรค ควรเลื่อนไปวันอื่นจะดีกว่า หากเลี่ยงไม่ได้ให้สวดมนต์และทำบุญเสริมดวง`,
      `ฤกษ์ไม่ดีสำหรับ${eventObj?.name || "งานนี้"} ดวงดาวขัดกัน อาจมีปัญหาตามมา แนะนำให้เลือกวันอื่นแทน`,
    ],
  };

  const timeSlots: Record<string, string[]> = {
    excellent: ["06:19 - 07:19 น.", "08:39 - 09:39 น.", "10:09 - 11:09 น."],
    good: ["06:39 - 07:39 น.", "09:09 - 10:09 น."],
    fair: ["09:19 - 10:19 น."],
    poor: [],
  };

  const avoidances: Record<string, string[]> = {
    excellent: ["หลีกเลี่ยงสีดำ", "อย่าทะเลาะกับใครก่อนเริ่มงาน"],
    good: ["หลีกเลี่ยงทิศตะวันตก", "อย่ายืมเงินในวันนี้", "ระวังเรื่องเอกสาร"],
    fair: ["หลีกเลี่ยงการเดินทางช่วงบ่าย", "ระวังเรื่องสุขภาพ", "อย่าตัดสินใจเรื่องใหญ่ช่วงค่ำ", "ควรทำบุญก่อนเริ่มงาน"],
    poor: ["ไม่ควรเริ่มต้นสิ่งใดใหม่", "หลีกเลี่ยงการเซ็นสัญญา", "ระวังอุบัติเหตุ", "ไม่ควรเดินทางไกล", "อย่ายืมเงินหรือให้ยืม"],
  };

  const texts = analyses[level] || analyses.fair;
  return {
    level,
    dayOfWeek: THAI_DAYS[dayOfWeek],
    thaiDate: formatThaiDate(dateStr),
    analysis: texts[Math.floor(Math.random() * texts.length)],
    timeSlots: timeSlots[level] || [],
    avoidances: avoidances[level] || [],
  };
}

type AuspiciousResult = {
  level: string;
  dayOfWeek: string;
  thaiDate: string;
  analysis: string;
  timeSlots: string[];
  avoidances: string[];
};

type ScreenState = "select" | "date" | "loading" | "result";

// ── Decorative divider ──
function GoldDivider({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 my-4 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-gold/15" />
      <span className="text-gold/20 text-[0.5rem]">✦</span>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-gold/15" />
    </motion.div>
  );
}

export default function AuspiciousScreen() {
  
  const [state, setState] = useState<ScreenState>("select");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [result, setResult] = useState<AuspiciousResult | null>(null);

  const selectedEventObj = EVENT_TYPES.find((e) => e.id === selectedEvent);

  const fetchAuspicious = useCallback(async (event: string, date: string) => {
    setState("loading");
    try {
      const res = await fetch("/api/auspicious", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, date }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setResult(data.result);
          setState("result");
          return;
        }
      }
      // Fallback to mock
      setResult(generateMockAuspicious(event, date));
      setState("result");
    } catch {
      // Fallback to mock
      setResult(generateMockAuspicious(event, date));
      setState("result");
    }
  }, []);

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEvent(eventId);
    setState("date");
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedEvent || !selectedDate) return;
    fetchAuspicious(selectedEvent, selectedDate);
  }, [selectedEvent, selectedDate, fetchAuspicious]);

  const handleRetry = useCallback(() => {
    setState("select");
    setSelectedEvent(null);
    setSelectedDate("");
    setResult(null);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-16"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Title */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <h2 className="text-xl text-gold font-semibold tracking-[0.15em]">ฤกษ์ยามมงคล</h2>
        <p className="text-gold/25 text-xs mt-1">ดูฤกษ์ดี วันมงคล สำหรับงานสำคัญ</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── SELECT EVENT ── */}
        {state === "select" && (
          <motion.div
            key="select"
            className="w-full max-w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              className="text-xs text-white/35 text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              เลือกประเภทงานที่ต้องการดูฤกษ์
            </motion.p>

            <div className="grid grid-cols-2 gap-2.5">
              {EVENT_TYPES.map((evt, idx) => (
                <motion.button
                  key={evt.id}
                  className="group relative overflow-hidden rounded-2xl border border-gold/[0.02] bg-[#2a1215]/90 text-left active:scale-[0.97] transition-transform"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.05, duration: 0.5, ease: EASE }}
                  onClick={() => handleSelectEvent(evt.id)}
                >
                  {/* Colored glow */}
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-active:opacity-[0.15]"
                    style={{ background: evt.color }}
                  />

                  <div className="relative p-3.5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: `${evt.color}12`, border: `1px solid ${evt.color}25` }}
                      >
                        <span style={{ color: evt.color }}>{evt.icon}</span>
                      </div>
                      <p className="text-[0.8rem] text-white/85 font-medium leading-tight">{evt.name}</p>
                    </div>
                    <p className="text-[0.6rem] text-gold/25 leading-relaxed pl-[46px]">{evt.desc}</p>
                  </div>

                  <div
                    className="h-[1px] mx-3 mb-0 opacity-[0.12]"
                    style={{ background: `linear-gradient(90deg, transparent, ${evt.color}, transparent)` }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── DATE PICKER ── */}
        {state === "date" && selectedEventObj && (
          <motion.div
            key="date"
            className="flex flex-col items-center gap-6 w-full max-w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Selected event badge */}
            <motion.div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border"
              style={{
                borderColor: `${selectedEventObj.color}30`,
                background: `${selectedEventObj.color}08`,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${selectedEventObj.color}15`, border: `1px solid ${selectedEventObj.color}30` }}
              >
                <span style={{ color: selectedEventObj.color }}>{selectedEventObj.icon}</span>
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">{selectedEventObj.name}</p>
                <p className="text-[0.6rem] text-white/30">{selectedEventObj.desc}</p>
              </div>
            </motion.div>

            {/* Date input */}
            <motion.div
              className="w-full max-w-xs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <label className="block text-xs text-gold/50 font-semibold tracking-wider uppercase mb-3 text-center">
                เลือกวันที่
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border text-sm text-white/80 outline-none focus:border-gold/15 transition-colors"
                style={{
                  colorScheme: "dark",
                  background: "rgba(12,13,20,0.9)",
                  borderColor: "rgba(232,212,139,0.15)",
                }}
                min={new Date().toISOString().split("T")[0]}
              />
              {selectedDate && (
                <motion.p
                  className="text-xs text-gold/40 text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {formatThaiDate(selectedDate)}
                </motion.p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleSubmit}
                className={!selectedDate ? "opacity-40 pointer-events-none" : ""}
              >
                ดูฤกษ์
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {state === "loading" && (
          <motion.div
            key="loading"
            className="flex flex-col items-center gap-6 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mystical loading animation */}
            <div className="relative w-24 h-24">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: "rgba(232,212,139,0.2)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <motion.div
                    key={deg}
                    className="absolute w-2 h-2 rounded-full bg-gold/30"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${deg}deg) translateY(-48px) translate(-50%, -50%)`,
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: deg / 360 }}
                  />
                ))}
              </motion.div>

              {/* Inner symbol */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-3xl text-gold/50">☸</span>
              </motion.div>
            </div>

            {/* Loading text */}
            <div className="flex flex-col items-center gap-2">
              <motion.div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gold/40"
                    animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </motion.div>
              <motion.p
                className="text-xs text-white/30"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                กำลังวิเคราะห์ฤกษ์...
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {state === "result" && result && (
          <motion.div
            key="result"
            className="flex flex-col items-center gap-4 w-full max-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {/* Date + event header */}
            {selectedEventObj && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span style={{ color: selectedEventObj.color }}>{selectedEventObj.icon}</span>
                  <span className="text-sm text-white/70 font-medium">{selectedEventObj.name}</span>
                </div>
                <p className="text-xs text-gold/40">{result.thaiDate}</p>
              </motion.div>
            )}

            {/* Auspicious level meter */}
            {(() => {
              const config = AUSPICIOUS_CONFIG[result.level] || AUSPICIOUS_CONFIG.fair;
              const levels = ["poor", "fair", "good", "excellent"];
              const activeIdx = levels.indexOf(result.level);

              return (
                <motion.div
                  className="relative w-full rounded-2xl p-5 border overflow-hidden"
                  style={{ borderColor: `${config.color}20` }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`} />

                  {/* Glow */}
                  <motion.div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${config.color}10, transparent 70%)` }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="relative flex items-center gap-4 mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{
                        background: `${config.color}15`,
                        border: `1.5px solid ${config.color}30`,
                        boxShadow: `0 0 15px ${config.color}15`,
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 10px ${config.color}10`,
                          `0 0 20px ${config.color}20`,
                          `0 0 10px ${config.color}10`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span style={{ color: config.color }}>{config.icon}</span>
                    </motion.div>
                    <div>
                      <p className="text-[0.65rem] text-white/35 tracking-wider uppercase">ระดับฤกษ์</p>
                      <p className="text-base font-semibold mt-0.5" style={{ color: config.color }}>
                        {config.label}
                      </p>
                    </div>
                  </div>

                  {/* 4-step meter */}
                  <div className="relative flex gap-1.5 mb-4">
                    {levels.map((lv, i) => (
                      <motion.div
                        key={lv}
                        className="flex-1 h-2 rounded-full relative overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
                      >
                        {i <= activeIdx && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: config.color, boxShadow: `0 0 8px ${config.color}40` }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <p className="relative text-[0.6rem] text-white/30 flex justify-between px-1">
                    <span>ไม่ดี</span>
                    <span>กลาง</span>
                    <span>ดี</span>
                    <span>ดีมาก</span>
                  </p>
                </motion.div>
              );
            })()}

            <GoldDivider delay={0.3} />

            {/* Analysis */}
            <motion.div
              className="relative w-full rounded-2xl p-5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(232,212,139,0.06) 0%, rgba(232,212,139,0.02) 50%, transparent 100%)",
                border: "1px solid rgba(232,212,139,0.12)",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold/60 text-[0.6rem]">✦</span>
                </div>
                <p className="text-xs text-gold/50 font-semibold tracking-wider uppercase">วิเคราะห์ฤกษ์</p>
              </div>
              <p className="text-sm leading-8 text-white/75 pl-8">{result.analysis}</p>
            </motion.div>

            {/* Recommended time slots */}
            {result.timeSlots.length > 0 && (
              <motion.div
                className="relative w-full rounded-2xl p-5 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(168,212,139,0.06) 0%, transparent 100%)",
                  border: "1px solid rgba(168,212,139,0.12)",
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#a8d48b]/10 flex items-center justify-center">
                    <span className="text-[#a8d48b]/60 text-[0.6rem]">☆</span>
                  </div>
                  <p className="text-xs text-[#a8d48b]/50 font-semibold tracking-wider uppercase">ช่วงเวลาที่เหมาะสม</p>
                </div>
                <div className="flex flex-wrap gap-2 pl-8">
                  {result.timeSlots.map((slot, i) => (
                    <motion.div
                      key={i}
                      className="px-3 py-1.5 rounded-lg border text-xs"
                      style={{
                        borderColor: "rgba(168,212,139,0.2)",
                        background: "rgba(168,212,139,0.06)",
                        color: "rgba(168,212,139,0.8)",
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                    >
                      {slot}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Things to avoid */}
            {result.avoidances.length > 0 && (
              <motion.div
                className="relative w-full rounded-2xl p-5 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(212,168,75,0.06) 0%, transparent 100%)",
                  border: "1px solid rgba(212,168,75,0.12)",
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#d4a84b]/10 flex items-center justify-center">
                    <span className="text-[#d4a84b]/60 text-[0.6rem]">⚡</span>
                  </div>
                  <p className="text-xs text-[#d4a84b]/50 font-semibold tracking-wider uppercase">สิ่งที่ควรหลีกเลี่ยง</p>
                </div>
                <ul className="space-y-2 pl-8">
                  {result.avoidances.map((item, i) => (
                    <motion.li
                      key={i}
                      className="text-xs text-white/55 leading-5 flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.06 }}
                    >
                      <span className="text-[#d4a84b]/40 mt-0.5 text-[0.5rem]">&#9670;</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              className="flex gap-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button variant="outline" onClick={() => window.location.href = "/home"}>
                กลับหน้าหลัก
              </Button>
              <Button onClick={handleRetry}>
                ดูฤกษ์อื่น
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
