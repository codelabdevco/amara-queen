"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

// ── Fortune stick poems (mock data) ──
const MOCK_POEMS: Record<string, { poem: string; luck: "great" | "good" | "fair" | "caution" }[]> = {
  great: [
    { poem: "มังกรทองเหินฟ้า พาโชคมาถึงท่าน\nสิ่งที่หวังจะสมปรารถนา ทุกสิ่งล้วนเป็นมงคล", luck: "great" },
    { poem: "ดาวประกายส่องนำทาง ทุกก้าวย่างล้วนสดใส\nโชคลาภกำลังมา อย่าลังเลจงก้าวไป", luck: "great" },
    { poem: "บัวทองบานกลางสระ งามตระการตาผู้คน\nบุญเก่าหนุนนำส่ง ให้ท่านพ้นทุกข์สุขสันต์", luck: "great" },
  ],
  good: [
    { poem: "สายน้ำไหลเอื่อย พาเรือลอยไปข้างหน้า\nอดทนรอจังหวะ สิ่งดีกำลังจะมา", luck: "good" },
    { poem: "นกน้อยร้องเพลงรับอรุณ เสียงไพเราะจับใจ\nความสุขเล็กๆ ที่มี คือสมบัติอันยิ่งใหญ่", luck: "good" },
    { poem: "ต้นไม้ใหญ่ไม่ได้โตในวันเดียว\nความพยายามของท่านจะผลิดอกออกผล", luck: "good" },
  ],
  fair: [
    { poem: "ทางสองแพร่งอยู่เบื้องหน้า คิดให้ดีก่อนก้าวเดิน\nฟังเสียงใจตนเอง แล้วเลือกทางที่ถูกต้อง", luck: "fair" },
    { poem: "เมฆหมอกบังดวงจันทร์ ชั่วครู่แล้วจะผ่านไป\nอย่าท้อแท้กับปัจจุบัน อนาคตยังสดใส", luck: "fair" },
    { poem: "น้ำขึ้นน้ำลงเป็นธรรมดา ชีวิตก็เช่นกัน\nจงรักษาสมดุล แล้วทุกอย่างจะลงตัว", luck: "fair" },
  ],
  caution: [
    { poem: "คลื่นลมแรงกลางทะเล ให้ระวังภัยรอบข้าง\nตั้งสติให้มั่นคง แล้วท่านจะผ่านพ้นไป", luck: "caution" },
    { poem: "ไฟลุกโชนต้องดับด้วยน้ำ อารมณ์ร้อนต้องดับด้วยสติ\nอย่าตัดสินใจเร็วเกินไป จงรอจังหวะที่เหมาะสม", luck: "caution" },
    { poem: "เสือนอนกินไม่ได้อิ่ม ต้องลุกขึ้นมาสู้\nแต่จงระวังอย่าประมาท คิดให้รอบคอบก่อนทำ", luck: "caution" },
  ],
};

const LUCK_CONFIG: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  great:   { label: "ดีมาก",  color: "#e8d48b", icon: "✦", bg: "rgba(232,212,139,0.08)" },
  good:    { label: "ดี",     color: "#a8d48b", icon: "✦", bg: "rgba(168,212,139,0.06)" },
  fair:    { label: "กลางๆ",  color: "#8bb8d4", icon: "☯", bg: "rgba(139,184,212,0.06)" },
  caution: { label: "ระวัง",  color: "#d4a84b", icon: "⚡", bg: "rgba(212,168,75,0.06)" },
};

function getLuckCategory(n: number): "great" | "good" | "fair" | "caution" {
  if (n <= 25) return "great";
  if (n <= 50) return "good";
  if (n <= 75) return "fair";
  return "caution";
}

function generateMockFortune(stickNumber: number) {
  const category = getLuckCategory(stickNumber);
  const poems = MOCK_POEMS[category];
  const selected = poems[Math.floor(Math.random() * poems.length)];
  return {
    number: stickNumber,
    poem: selected.poem,
    interpretation: generateInterpretation(stickNumber, category),
    luck: selected.luck,
  };
}

function generateInterpretation(num: number, luck: string): string {
  const interpretations: Record<string, string[]> = {
    great: [
      "ดวงชะตาของท่านกำลังเปิดทางสว่าง สิ่งที่ตั้งใจไว้จะสำเร็จลุล่วง ทั้งการงาน การเงิน และความรัก ล้วนส่งเสริมกัน จงมั่นใจและก้าวเดินต่อไป",
      "นี่คือช่วงเวลาที่ดีที่สุด โชคลาภกำลังหมุนเข้าหาท่าน ผู้ใหญ่จะคอยช่วยเหลือ ทำอะไรก็สำเร็จ อย่ารอช้าจงลงมือทำ",
      "บุญเก่าหนุนนำ ดวงท่านสว่างไสว การเงินคล่องตัว การงานก้าวหน้า ความรักราบรื่น สุขภาพแข็งแรง ทุกสิ่งเป็นไปตามที่หวัง",
    ],
    good: [
      "ดวงของท่านอยู่ในเกณฑ์ดี มีความสุขเล็กๆ เข้ามาเติมเต็ม การงานมีความก้าวหน้าตามลำดับ ความรักมีเรื่องน่ายินดี อดทนอีกนิดจะได้ดีกว่านี้",
      "สิ่งที่รอคอยกำลังจะมาถึง แม้ไม่เร็วอย่างที่หวัง แต่ก็มาอย่างมั่นคง จงอดทนและทำดีต่อไป ผลดีจะตามมาเอง",
      "ท่านกำลังเดินถูกทาง ทุกความพยายามจะไม่สูญเปล่า มีคนคอยช่วยเหลืออยู่เบื้องหลัง จงขอบคุณและเดินหน้าต่อไป",
    ],
    fair: [
      "ดวงของท่านอยู่ในช่วงเปลี่ยนผ่าน บางเรื่องสำเร็จ บางเรื่องยังต้องรอ อย่าเร่งรีบตัดสินใจ ให้เวลาเป็นเครื่องพิสูจน์ ทุกอย่างจะคลี่คลาย",
      "ช่วงนี้ต้องใช้สติและปัญญา อย่าหลงไปกับสิ่งยั่วยุ ตั้งมั่นในหลักการ แล้วผลดีจะตามมา การเงินควรระมัดระวัง",
      "ทุกสิ่งมีสองด้าน จงมองให้รอบคอบ สิ่งที่ดูเหมือนอุปสรรค อาจเป็นโอกาสที่ซ่อนอยู่ ปรับตัวให้เข้ากับสถานการณ์",
    ],
    caution: [
      "ช่วงนี้ต้องระมัดระวังเป็นพิเศษ อย่าไว้ใจคนง่าย อย่าลงทุนเสี่ยง ดูแลสุขภาพให้ดี ทำบุญเสริมดวง แล้วทุกอย่างจะค่อยๆ ดีขึ้น",
      "อุปสรรคที่เผชิญอยู่เป็นบทเรียนสำคัญ อย่าท้อถอย จงตั้งสติและหาทางแก้ไข ผู้ใหญ่หรือคนใกล้ชิดจะช่วยชี้ทางสว่างให้",
      "จงอย่าประมาท ระวังเรื่องเอกสารและการเงิน หลีกเลี่ยงการทะเลาะวิวาท ทำจิตใจให้สงบ สวดมนต์เจริญสติ แล้วจะผ่านพ้นไปได้",
    ],
  };
  const texts = interpretations[luck] || interpretations.fair;
  return texts[Math.floor(Math.random() * texts.length)];
}

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

// ── Stick lines inside the container ──
function StickLines() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 80 + Math.random() * 30,
            background: `linear-gradient(to bottom, #e8d48b, #c4a850)`,
            left: `${15 + (i / 11) * 70}%`,
            bottom: 10,
            transformOrigin: "bottom center",
            opacity: 0.5 + Math.random() * 0.3,
          }}
          animate={{
            rotate: [-2 + Math.random() * 4, 2 - Math.random() * 4, -2 + Math.random() * 4],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </>
  );
}

type FortuneResult = {
  number: number;
  poem: string;
  interpretation: string;
  luck: "great" | "good" | "fair" | "caution";
};

type ScreenState = "idle" | "shaking" | "revealing" | "loading" | "result";

export default function SiamSiScreen() {
  
  const [state, setState] = useState<ScreenState>("idle");
  const [stickNumber, setStickNumber] = useState<number | null>(null);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);

  const fetchFortune = useCallback(async (num: number) => {
    setState("loading");
    try {
      const res = await fetch("/api/siamsi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stickNumber: num }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.fortune) {
          setFortune(data.fortune);
          setState("result");
          return;
        }
      }
      // Fallback to mock
      setFortune(generateMockFortune(num));
      setState("result");
    } catch {
      // Fallback to mock
      setFortune(generateMockFortune(num));
      setState("result");
    }
  }, []);

  const handleShake = useCallback(() => {
    setState("shaking");

    // After 2 second shake, reveal number
    setTimeout(() => {
      const num = Math.floor(Math.random() * 100) + 1;
      setStickNumber(num);
      setState("revealing");

      // After reveal animation, fetch fortune
      setTimeout(() => {
        fetchFortune(num);
      }, 1200);
    }, 2000);
  }, [fetchFortune]);

  const handleRetry = useCallback(() => {
    setState("idle");
    setStickNumber(null);
    setFortune(null);
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
        <h2 className="text-xl text-gold font-semibold tracking-[0.15em]">เซียมซี</h2>
        <p className="text-gold/25 text-xs mt-1">เสี่ยงเซียมซี 1-100 พร้อม AI ตีความ</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── IDLE / SHAKING — Stick container ── */}
        {(state === "idle" || state === "shaking") && (
          <motion.div
            key="stick-container"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Stick container */}
            <motion.div
              className="relative w-28 h-56 rounded-3xl border-2 overflow-hidden"
              style={{
                borderColor: "rgba(232,212,139,0.4)",
                background: "linear-gradient(180deg, rgba(232,212,139,0.06) 0%, rgba(8,9,14,0.95) 100%)",
                boxShadow: "0 0 30px rgba(232,212,139,0.08), inset 0 0 20px rgba(232,212,139,0.03)",
              }}
              animate={
                state === "shaking"
                  ? {
                      rotate: [0, -8, 8, -6, 6, -10, 10, -4, 4, -2, 2, 0],
                      x: [0, -4, 4, -3, 3, -5, 5, -2, 2, -1, 1, 0],
                      y: [0, -2, 0, -3, 0, -2, 0, -1, 0, -1, 0, 0],
                    }
                  : {
                      rotate: [0, -1, 1, 0],
                    }
              }
              transition={
                state === "shaking"
                  ? { duration: 2, ease: "easeInOut" }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
            >
              {/* Glow at top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(232,212,139,0.15), transparent 70%)" }}
              />

              {/* Sticks */}
              <StickLines />

              {/* Bottom decoration */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8"
                style={{ background: "linear-gradient(to top, rgba(232,212,139,0.1), transparent)" }}
              />
            </motion.div>

            {/* Instruction text */}
            <motion.p
              className="text-xs text-white/30 text-center"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {state === "shaking" ? "กำลังเขย่า..." : "แตะปุ่มด้านล่างเพื่อเสี่ยงเซียมซี"}
            </motion.p>

            {/* Shake button */}
            <Button
              onClick={handleShake}
              className={state === "shaking" ? "opacity-50 pointer-events-none" : ""}
            >
              {state === "shaking" ? "กำลังเขย่า..." : "เสี่ยงเซียมซี"}
            </Button>
          </motion.div>
        )}

        {/* ── REVEALING — Number appears ── */}
        {state === "revealing" && stickNumber !== null && (
          <motion.div
            key="reveal"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dramatic number reveal */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.8 }}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  background: "radial-gradient(circle, rgba(232,212,139,0.2), transparent 70%)",
                  transform: "scale(1.8)",
                }}
                animate={{
                  scale: [1.5, 2, 1.5],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Number circle */}
              <motion.div
                className="w-[140px] h-[140px] rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: "rgba(232,212,139,0.5)",
                  background: "linear-gradient(135deg, rgba(232,212,139,0.12), rgba(8,9,14,0.95))",
                  boxShadow: "0 0 40px rgba(232,212,139,0.15)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(232,212,139,0.1)",
                    "0 0 50px rgba(232,212,139,0.25)",
                    "0 0 30px rgba(232,212,139,0.1)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-center">
                  <p className="text-[0.6rem] text-gold/40 tracking-widest uppercase mb-1">เลขที่</p>
                  <motion.p
                    className="text-5xl font-bold text-gold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {stickNumber}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>

            <motion.p
              className="text-xs text-gold/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              กำลังตีความ...
            </motion.p>
          </motion.div>
        )}

        {/* ── LOADING — Waiting for AI ── */}
        {state === "loading" && stickNumber !== null && (
          <motion.div
            key="loading"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Number */}
            <div
              className="w-[100px] h-[100px] rounded-full border flex items-center justify-center"
              style={{
                borderColor: "rgba(232,212,139,0.3)",
                background: "rgba(232,212,139,0.05)",
              }}
            >
              <p className="text-3xl font-bold text-gold">{stickNumber}</p>
            </div>

            {/* Loading animation */}
            <div className="flex flex-col items-center gap-3">
              <motion.div
                className="flex gap-1.5"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gold/40"
                    animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
              <motion.p
                className="text-xs text-white/30"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI กำลังตีความเซียมซี...
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ── RESULT — Fortune display ── */}
        {state === "result" && fortune && (
          <motion.div
            key="result"
            className="flex flex-col items-center gap-4 w-full max-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {/* Stick number + luck badge */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: `${LUCK_CONFIG[fortune.luck].color}50`,
                  background: LUCK_CONFIG[fortune.luck].bg,
                  boxShadow: `0 0 25px ${LUCK_CONFIG[fortune.luck].color}15`,
                }}
              >
                <div className="text-center">
                  <p className="text-[0.5rem] text-white/30 uppercase tracking-wider">เลขที่</p>
                  <p className="text-2xl font-bold" style={{ color: LUCK_CONFIG[fortune.luck].color }}>
                    {fortune.number}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <motion.span
                    className="text-lg"
                    style={{ color: LUCK_CONFIG[fortune.luck].color }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {LUCK_CONFIG[fortune.luck].icon}
                  </motion.span>
                  <span
                    className="text-base font-semibold"
                    style={{ color: LUCK_CONFIG[fortune.luck].color }}
                  >
                    {LUCK_CONFIG[fortune.luck].label}
                  </span>
                </div>
                <p className="text-[0.65rem] text-white/30">
                  {fortune.luck === "great" && "ดวงดี เลข 1-25"}
                  {fortune.luck === "good" && "กลางๆ เลข 26-50"}
                  {fortune.luck === "fair" && "ระวัง เลข 51-75"}
                  {fortune.luck === "caution" && "ท้าทาย เลข 76-100"}
                </p>
              </div>
            </motion.div>

            <GoldDivider delay={0.2} />

            {/* Poem */}
            <motion.div
              className="relative w-full rounded-2xl p-5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(232,212,139,0.08) 0%, rgba(232,212,139,0.02) 50%, transparent 100%)",
                border: "1px solid rgba(232,212,139,0.15)",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
            >
              {/* Glow */}
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(232,212,139,0.1), transparent 70%)" }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex items-center gap-2 mb-3 relative">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold/60 text-[0.6rem]">☰</span>
                </div>
                <p className="text-xs text-gold/50 font-semibold tracking-wider uppercase">คำเซียมซี</p>
              </div>

              <p className="relative text-sm text-gold-light/80 leading-8 pl-8 whitespace-pre-line italic">
                {fortune.poem}
              </p>
            </motion.div>

            {/* AI Interpretation */}
            <motion.div
              className="relative w-full rounded-2xl p-5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(232,212,139,0.06) 0%, rgba(232,212,139,0.02) 100%)",
                border: "1px solid rgba(232,212,139,0.12)",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
            >
              <div className="flex gap-3.5 items-start">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 0 12px rgba(232,212,139,0.08)" }}
                  animate={{
                    boxShadow: [
                      "0 0 8px rgba(232,212,139,0.05)",
                      "0 0 16px rgba(232,212,139,0.12)",
                      "0 0 8px rgba(232,212,139,0.05)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-gold text-sm">✦</span>
                </motion.div>
                <div>
                  <p className="text-xs text-gold/50 font-semibold mb-1.5 tracking-wider uppercase">AI ตีความ</p>
                  <p className="text-sm leading-8 text-white/75">{fortune.interpretation}</p>
                </div>
              </div>
            </motion.div>

            {/* Retry button */}
            <motion.div
              className="flex gap-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button variant="outline" onClick={() => window.location.href = "/home"}>
                กลับหน้าหลัก
              </Button>
              <Button onClick={handleRetry}>
                เสี่ยงใหม่
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
