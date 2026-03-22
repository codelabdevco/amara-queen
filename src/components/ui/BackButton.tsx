"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import type { Phase } from "@/types/tarot";

const PHASE_BACK: Partial<Record<Phase, Phase>> = {
  topic: "landing",
  spread: "topic",
  question: "spread",
  fan: "question",
  reading: "fan",
};

export default function BackButton() {
  const phase = useTarotStore((s) => s.phase);
  const setPhase = useTarotStore((s) => s.setPhase);
  const target = PHASE_BACK[phase];

  if (!target) return null;

  return (
    <motion.button
      className="fixed top-3 left-3 z-[110] w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:bg-white/10 backdrop-blur-sm"
      style={{ top: "max(12px, env(safe-area-inset-top))" }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      whileTap={{ scale: 0.85 }}
      onClick={() => setPhase(target)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </motion.button>
  );
}
