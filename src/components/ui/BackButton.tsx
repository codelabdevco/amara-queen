"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import type { Phase } from "@/types/tarot";

const PHASE_BACK: Partial<Record<Phase, Phase>> = {
  topic: "home",
  spread: "topic",
  question: "spread",
  fan: "question",
  reading: "fan",
  siamsi: "home",
  auspicious: "home",
  calendar: "home",
  booking: "home",
  shop: "home",
};

export default function BackButton() {
  const phase = useTarotStore((s) => s.phase);
  const setPhase = useTarotStore((s) => s.setPhase);
  const target = PHASE_BACK[phase];

  if (!target) return null;

  return (
    <motion.button
      className="flex items-center gap-1.5 text-white/35 active:text-white/60 transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setPhase(target)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-xs">ย้อนกลับ</span>
    </motion.button>
  );
}
