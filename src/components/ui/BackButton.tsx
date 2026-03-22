"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTarotStore } from "@/store/useTarotStore";
import type { Phase } from "@/types/tarot";

const PHASE_BACK: Partial<Record<Phase, Phase | "navigate:/home">> = {
  topic: "navigate:/home",
  spread: "topic",
  question: "spread",
  fan: "question",
  reading: "fan",
};

export default function BackButton() {
  const phase = useTarotStore((s) => s.phase);
  const setPhase = useTarotStore((s) => s.setPhase);
  const router = useRouter();
  const target = PHASE_BACK[phase];

  if (!target) return null;

  function handleBack() {
    if (typeof target === "string" && target.startsWith("navigate:")) {
      router.push(target.replace("navigate:", ""));
    } else if (target) {
      setPhase(target as Phase);
    }
  }

  return (
    <motion.button
      className="flex items-center gap-1.5 text-[#8B7A4A]/50 active:text-[#d4af37] transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleBack}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-[0.65rem]">ย้อนกลับ</span>
    </motion.button>
  );
}
