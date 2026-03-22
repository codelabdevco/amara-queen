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
      className="flex flex-col items-center justify-center h-full px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <h2
          className="text-base font-semibold tracking-[0.1em] mb-0.5"
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
        <p className="text-[#8B7A4A]/50 text-[0.65rem]">เลือกหมวดที่ตรงกับคำถามในใจ</p>
      </motion.div>

      {/* Topic grid */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-[300px]">
        {topics.map((t, idx) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + idx * 0.03, duration: 0.4, ease: EASE }}
          >
            <LaurelButton
              variant="crimson"
              onClick={() => selectTopic(t)}
              className="w-full h-[46px]"
            >
              <span className="flex items-center gap-1.5">
                <span className="opacity-50 text-xs">{t.icon}</span>
                <span className="text-[0.65rem]">{t.nameTH}</span>
              </span>
            </LaurelButton>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
