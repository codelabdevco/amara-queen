"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { AIReading } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";
import { saveReading } from "@/lib/history";

import Candle from "@/components/ui/Candle";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// ── Loading messages (mystical quotes) ──
const LOADING_MSGS = [
  "เปลวเทียนกำลังส่องทางให้คุณ...",
  "ดวงดาวกำลังเรียงตัว...",
  "พลังงานจากไพ่กำลังรวมตัว...",
  "จักรวาลกำลังเปิดเผยคำตอบ...",
  "สัมผัสแห่งแสงเทียนนำทาง...",
  "ความลับกำลังถูกถอดรหัส...",
  "ลมหายใจแห่งจักรวาล...",
];

const WISDOM_MSGS = [
  "ทุกใบไพ่มีเรื่องราวที่ซ่อนอยู่ รอให้แสงเทียนส่องเห็น",
  "คำตอบอยู่ในตัวคุณเสมอ ไพ่เพียงช่วยให้คุณมองเห็นชัดขึ้น",
  "บางครั้งสิ่งที่ซ่อนอยู่ สำคัญกว่าสิ่งที่เห็น",
  "จงเชื่อมั่นในเส้นทางของคุณ แม้มันจะคดเคี้ยว",
  "ความกล้าไม่ใช่การไม่กลัว แต่คือการก้าวไปข้างหน้าทั้งที่กลัว",
];

function LoadingCandles() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const [lottieData, setLottieData] = useState<object | null>(null);

  const particleConfigs = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      left: `${30 + Math.random() * 40}%`,
      top: `${20 + Math.random() * 60}%`,
      yRange: -20 - Math.random() * 30,
      xRange: (Math.random() - 0.5) * 15,
      duration: 3 + Math.random() * 2,
      hue: 30 + i * 5,
    }))
  ).current;

  useEffect(() => {
    fetch("/galdrastafur.json").then(r => r.json()).then(setLottieData);
  }, []);

  useEffect(() => {
    const t1 = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MSGS.length), 3000);
    const t2 = setInterval(() => setWisdomIdx((i) => (i + 1) % WISDOM_MSGS.length), 5000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="flex flex-col items-center py-4 gap-6">
      {/* Candles */}
      <div className="flex items-end gap-16 relative">
        {/* Floating particles between candles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {particleConfigs.map((p, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: `hsla(${p.hue}, 80%, 75%, 0.4)`,
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [0, p.yRange, 0],
                x: [0, p.xRange, 0],
                opacity: [0, 0.5, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <Candle scale={0.8} />

        {/* Galdrastafur rune symbol between candles */}
        <motion.div
          className="relative z-10"
          style={{ width: 80, height: 80, marginBottom: 20 }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {lottieData && <Lottie
            animationData={lottieData}
            loop
            autoplay
            style={{ width: "100%", height: "100%", filter: "sepia(1) hue-rotate(10deg) brightness(1.5) opacity(0.6)" }}
          />}
          {/* Glow behind rune */}
          <div className="absolute inset-0 -z-10 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(232,212,139,0.08) 0%, transparent 70%)", transform: "scale(2)" }}
          />
        </motion.div>

        <Candle scale={0.8} />
      </div>

      {/* Status message */}
      <div className="h-5 relative w-full text-center">
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx}
            className="text-xs text-gold/60 absolute inset-x-0"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
          >
            {LOADING_MSGS[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Wisdom quote */}
      <div className="h-10 relative w-full text-center px-4">
        <AnimatePresence mode="wait">
          <motion.p key={wisdomIdx}
            className="text-[0.7rem] text-white/25 absolute inset-x-0 px-4 leading-5 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            &ldquo;{WISDOM_MSGS[wisdomIdx]}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Trend config ──
const TREND_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string; gradient: string }> = {
  very_positive: { icon: "✦", label: "ดีมาก", color: "#e8d48b", bg: "rgba(232,212,139,0.08)", gradient: "from-[#e8d48b]/20 via-[#e8d48b]/5 to-transparent" },
  positive:      { icon: "✦", label: "ดี",     color: "#a8d48b", bg: "rgba(168,212,139,0.06)", gradient: "from-[#a8d48b]/15 via-[#a8d48b]/5 to-transparent" },
  neutral:       { icon: "☯", label: "กลางๆ",  color: "#8bb8d4", bg: "rgba(139,184,212,0.06)", gradient: "from-[#8bb8d4]/15 via-[#8bb8d4]/5 to-transparent" },
  caution:       { icon: "⚡", label: "ระวัง",  color: "#d4a84b", bg: "rgba(212,168,75,0.06)", gradient: "from-[#d4a84b]/15 via-[#d4a84b]/5 to-transparent" },
  challenging:   { icon: "☁", label: "ท้าทาย", color: "#b48bd4", bg: "rgba(180,139,212,0.06)", gradient: "from-[#b48bd4]/15 via-[#b48bd4]/5 to-transparent" },
};

// ── Decorative divider ──
function GoldDivider({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div className="flex items-center gap-3 my-4 px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.5 }}
    >
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-gold/15" />
      <span className="text-gold/20 text-[0.5rem]">✦</span>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-gold/15" />
    </motion.div>
  );
}

// ── Trend meter ──
function TrendMeter({ trend, trendText }: { trend: string; trendText: string }) {
  const config = TREND_CONFIG[trend] || TREND_CONFIG.neutral;
  const levels = ["challenging", "caution", "neutral", "positive", "very_positive"];
  const activeIdx = levels.indexOf(trend);

  return (
    <motion.div
      className="relative rounded-2xl p-5 border overflow-hidden"
      style={{ borderColor: `${config.color}20` }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`} />

      {/* Subtle glow */}
      <motion.div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${config.color}10, transparent 70%)` }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex items-center gap-4 mb-4">
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{ background: `${config.color}15`, border: `1.5px solid ${config.color}30`, boxShadow: `0 0 15px ${config.color}15` }}
          animate={{ boxShadow: [`0 0 10px ${config.color}10`, `0 0 20px ${config.color}20`, `0 0 10px ${config.color}10`] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </motion.div>
        <div>
          <p className="text-[0.65rem] text-white/35 tracking-wider uppercase">แนวโน้มโดยรวม</p>
          <p className="text-base font-semibold mt-0.5" style={{ color: config.color }}>{config.label}</p>
        </div>
      </div>

      {/* 5-step meter with glow */}
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
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: config.color, boxShadow: `0 0 8px ${config.color}40` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <p className="relative text-xs text-white/55 leading-6">{trendText}</p>
    </motion.div>
  );
}

// ── Card Lightbox ──
function CardLightbox({ card, position, onClose }: { card: { id: number; nameTh: string; nameEn: string; image: string; meaningTh?: string; meaning: string; isReversed: boolean }; position?: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        className="relative flex flex-col items-center gap-4 max-w-[85vw]"
        initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card image */}
        <div className={`relative rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)] ${card.isReversed ? "rotate-180" : ""}`}
          style={{ width: 200, height: 320, border: "2px solid rgba(232,212,139,0.2)" }}
        >
          {card.image ? (
            <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#0c0d14] flex items-center justify-center">
              <span className="text-gold/30 text-4xl">✦</span>
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="text-center relative">
          <h3 className="text-lg text-gold font-semibold">{card.nameTh}</h3>
          <p className="text-xs text-white/30 mt-0.5">{card.nameEn}</p>
          {card.isReversed && (
            <span className="inline-block mt-1.5 text-[0.65rem] text-red-400/70 bg-red-400/10 border border-red-400/20 rounded-full px-2 py-0.5">กลับหัว</span>
          )}
          {position && <p className="text-[0.65rem] text-gold/30 mt-2">{position}</p>}
          <p className="text-xs text-white/50 mt-2 leading-6 max-w-[260px]">{card.meaningTh || card.meaning}</p>
        </div>

        {/* Close hint */}
        <p className="text-[0.6rem] text-white/20 mt-2">แตะด้านนอกเพื่อปิด</p>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──
export default function ReadingScreen() {
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const userQuestion = useTarotStore((s) => s.userQuestion);
  const pickedCards = useTarotStore((s) => s.pickedCards);
  const aiReading = useTarotStore((s) => s.aiReading);
  const isLoadingAI = useTarotStore((s) => s.isLoadingAI);
  const setAiReading = useTarotStore((s) => s.setAiReading);
  const setLoadingAI = useTarotStore((s) => s.setLoadingAI);
  const [viewCard, setViewCard] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const reset = useTarotStore((s) => s.reset);

  // Fetch AI reading
  const fetchReading = useCallback(async () => {
    if (!selectedTopic || !selectedSpread) return;
    setLoadingAI(true);
    setHasError(false);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic.nameTH,
          spread: selectedSpread.nameTH,
          question: userQuestion || "ดูดวงทั่วไป",
          cards: pickedCards.map((c, i) => ({
            nameTh: c.nameTh,
            nameEn: c.nameEn,
            meaningTh: c.meaningTh,
            meaning: c.meaning,
            isReversed: c.isReversed,
            positionName: selectedSpread.positions[i]?.nameTH || `ใบที่ ${i + 1}`,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setHasError(true);
        setLoadingAI(false);
      } else {
        setAiReading(data.reading as AIReading);
      }
    } catch {
      setHasError(true);
      setLoadingAI(false);
    }
  }, [selectedTopic, selectedSpread, userQuestion, pickedCards, setAiReading, setLoadingAI]);

  useEffect(() => {
    if (aiReading || isLoadingAI || hasError) return;
    fetchReading();
  }, [aiReading, isLoadingAI, hasError, fetchReading]);

  // Auto-save reading to history
  const savedRef = useRef(false);
  useEffect(() => {
    if (!aiReading || savedRef.current || !selectedTopic || !selectedSpread) return;
    savedRef.current = true;
    saveReading({
      topic: selectedTopic.nameTH,
      topicIcon: selectedTopic.icon,
      topicColor: selectedTopic.color,
      spread: selectedSpread.nameTH,
      question: userQuestion || "ดูดวงทั่วไป",
      cards: pickedCards.map((c) => ({ nameTh: c.nameTh, nameEn: c.nameEn, isReversed: c.isReversed })),
      reading: aiReading,
    });
  }, [aiReading, selectedTopic, selectedSpread, userQuestion, pickedCards]);

  return (
    <motion.div
      key="reading"
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-16"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <AnimatePresence mode="wait">
        {!aiReading ? (
          <motion.h2 key="loading-title" className="text-xl text-gold/70 text-center mb-3 tracking-[0.15em] font-semibold"
            initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >กำลังทำนาย...</motion.h2>
        ) : (
          <motion.h2 key="result-title" className="text-xl text-gold text-center mb-3 tracking-[0.15em] font-semibold"
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >คำทำนาย</motion.h2>
        )}
      </AnimatePresence>

      {/* Context */}
      <div className="w-full max-w-full mb-4 text-center">
        {selectedTopic && (
          <p className="text-xs text-white/40">
            <span style={{ color: selectedTopic.color }}>{selectedTopic.icon}</span>
            {" "}{selectedTopic.nameTH}
            {selectedSpread && <span className="text-white/20"> · {selectedSpread.nameTH}</span>}
          </p>
        )}
        {userQuestion && (
          <p className="text-sm text-white/50 mt-2 italic leading-6">
            &ldquo;{userQuestion}&rdquo;
          </p>
        )}
      </div>

      {/* Card thumbnail row — tap to enlarge */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-5 max-w-full">
        {pickedCards.map((card, i) => (
          <motion.button key={i}
            className={`w-[46px] h-[69px] rounded-md border border-gold/20 overflow-hidden relative bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewCard(i)}
          >
            {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />}
          </motion.button>
        ))}
      </div>

      <div className="w-full max-w-full space-y-4">
        {/* ── Loading ── */}
        {isLoadingAI && (
          <motion.div
            className="bg-gradient-to-br from-gold/[0.06] to-transparent border border-gold/20 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          >
            <LoadingCandles />
          </motion.div>
        )}

        {/* ── Error with retry ── */}
        {hasError && !isLoadingAI && !aiReading && (
          <motion.div
            className="bg-gradient-to-br from-red-500/[0.06] to-transparent border border-red-500/20 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-white/60 text-sm mb-4">ไม่สามารถสร้างคำทำนายได้ กรุณาลองอีกครั้ง</p>
            <Button variant="outline" onClick={fetchReading}>ลองใหม่</Button>
          </motion.div>
        )}

        {/* ── Result ── */}
        {aiReading && (
          <>
            {/* Trend meter */}
            <TrendMeter trend={aiReading.trend} trendText={aiReading.trendText} />

            <GoldDivider delay={0.35} />

            {/* Summary */}
            <motion.div
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(232,212,139,0.06) 0%, rgba(232,212,139,0.02) 50%, transparent 100%)", border: "1px solid rgba(232,212,139,0.12)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold/60 text-[0.6rem]">✦</span>
                </div>
                <p className="text-xs text-gold/50 font-semibold tracking-wider uppercase">สรุปภาพรวม</p>
              </div>
              <p className="text-sm leading-8 text-white/80 pl-8">{aiReading.summary}</p>
            </motion.div>

            {/* Advice */}
            {aiReading.advice && (
              <motion.div
                className="relative rounded-2xl p-5 overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(232,212,139,0.08) 0%, rgba(232,212,139,0.03) 100%)", border: "1px solid rgba(232,212,139,0.18)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
              >
                {/* Subtle glow */}
                <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(232,212,139,0.1), transparent 70%)" }} />

                <div className="flex gap-3.5 items-start relative">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "0 0 12px rgba(232,212,139,0.08)" }}
                    animate={{ boxShadow: ["0 0 8px rgba(232,212,139,0.05)", "0 0 16px rgba(232,212,139,0.12)", "0 0 8px rgba(232,212,139,0.05)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-gold text-sm">☆</span>
                  </motion.div>
                  <div>
                    <p className="text-xs text-gold/50 font-semibold mb-1.5 tracking-wider uppercase">คำแนะนำ</p>
                    <p className="text-sm leading-7 text-white/80">{aiReading.advice}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <GoldDivider delay={0.55} />

            {/* Per-card insights header */}
            <motion.div className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="text-gold/50 text-[0.5rem]">✦</span>
              </div>
              <p className="text-xs text-gold/45 font-semibold tracking-wider uppercase">รายละเอียดแต่ละใบ</p>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-gold/10 to-transparent" />
            </motion.div>

            {pickedCards.map((card, i) => {
              const pos = selectedSpread?.positions[i];
              const insight = aiReading.cardInsights?.[i];

              return (
                <motion.div
                  key={i}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(16,17,26,0.95), rgba(8,9,14,0.98))", border: "1px solid rgba(232,212,139,0.08)" }}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.08, duration: 0.5, ease: EASE }}
                >
                  {/* Card number badge */}
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold/8 border border-gold/15 flex items-center justify-center">
                    <span className="text-[0.5rem] text-gold/40 font-bold">{i + 1}</span>
                  </div>

                  <div className="flex gap-4 p-4 items-start">
                    <button
                      className={`relative rounded-lg overflow-hidden flex-shrink-0 ${card.isReversed ? "rotate-180" : ""} active:scale-95 transition-transform`}
                      style={{ width: 65, height: 100, border: "1px solid rgba(232,212,139,0.15)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                      onClick={() => setViewCard(i)}
                    >
                      {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />}
                    </button>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-gold-light font-semibold">{card.nameTh}</h3>
                        {card.isReversed && (
                          <span className="text-[0.55rem] text-red-400/60 bg-red-400/8 border border-red-400/15 rounded-full px-1.5 py-0.5">กลับหัว</span>
                        )}
                      </div>
                      <p className="text-[0.6rem] text-gold/30 mb-2 tracking-wide">{pos?.nameTH}</p>

                      {insight ? (
                        <p className="text-[0.8rem] text-white/65 leading-7">{insight}</p>
                      ) : (
                        <p className="text-xs text-white/45 leading-6">{card.meaningTh || card.meaning}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Card Lightbox */}
      <AnimatePresence>
        {viewCard !== null && pickedCards[viewCard] && (
          <CardLightbox
            card={pickedCards[viewCard]}
            position={selectedSpread?.positions[viewCard]?.nameTH}
            onClose={() => setViewCard(null)}
          />
        )}
      </AnimatePresence>

      {/* Actions */}
      {aiReading && (
        <motion.div
          className="flex gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Button variant="outline" onClick={reset}>จั่วไพ่ใหม่</Button>
          <Button variant="outline" onClick={async () => {
            const text = `Amara Queen — ${selectedTopic?.nameTH || "ดูดวง"}\n\n"${userQuestion || "ดูดวงทั่วไป"}"\n\nแนวโน้ม: ${TREND_CONFIG[aiReading.trend]?.label || "กลางๆ"}\n${aiReading.summary}\n\nคำแนะนำ: ${aiReading.advice}`;
            if (navigator.share) {
              try { await navigator.share({ title: "Amara Queen — ผลดูดวง", text }); } catch {}
            } else {
              await navigator.clipboard.writeText(text);
              alert("คัดลอกผลดูดวงแล้ว!");
            }
          }}>แชร์ผล</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
