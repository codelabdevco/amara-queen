"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { TOPICS } from "@/types/tarot";
import { GYPSY_TOPICS } from "@/types/gypsy";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

export default function TopicScreen() {
  const service = useTarotStore((s) => s.service);
  const selectTopic = useTarotStore((s) => s.selectTopic);
  const topics = service === "gypsy" ? GYPSY_TOPICS : TOPICS;

  return (
    <motion.div
      key="topic"
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <h2
          className="text-lg font-semibold tracking-[0.1em] mb-1"
          style={{
            background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer-text 4s ease-in-out infinite",
          }}
        >
          คุณอยากถามเรื่องอะไร
        </h2>
        <p className="text-[#8B7A4A]/50 text-xs">เลือกหมวดที่ตรงกับคำถามในใจ</p>
        <motion.div
          className="w-16 h-[1px] mx-auto mt-3"
          style={{ background: "linear-gradient(90deg, transparent, #8B7A4A, transparent)" }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      </motion.div>

      {/* Topic grid — Laurel Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
        {topics.map((t, idx) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.04, duration: 0.5, ease: EASE }}
          >
            <LaurelButton
              variant="crimson"
              onClick={() => selectTopic(t)}
              className="w-full h-[56px]"
            >
              <span className="flex flex-col items-center gap-0.5">
                <span className="opacity-60 text-sm">{t.icon}</span>
                <span className="text-[0.7rem]">{t.nameTH}</span>
              </span>
            </LaurelButton>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
