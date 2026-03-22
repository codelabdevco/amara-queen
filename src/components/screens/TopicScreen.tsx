"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { TOPICS } from "@/types/tarot";
import { GYPSY_TOPICS } from "@/types/gypsy";
import { EASE } from "@/constants/animation";

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
      {/* Header with mystic symbol */}
      <motion.div
        className="relative mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="w-12 h-12 rounded-full border border-gold/25 flex items-center justify-center mx-auto mb-3">
          <motion.span
            className="text-lg text-gold/70"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            &#10022;
          </motion.span>
        </div>
        <h2 className="text-lg text-gold font-semibold tracking-wide text-center">
          คุณอยากถามเรื่องอะไร
        </h2>
        <p className="text-gold/25 text-xs mt-1 text-center">เลือกหมวดที่ตรงกับคำถามในใจ</p>
      </motion.div>

      {/* Topic grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-full">
        {topics.map((t, idx) => (
          <motion.button
            key={t.id}
            className="group relative overflow-hidden rounded-2xl border border-gold/[0.02] bg-[#2a1215]/90 text-left active:scale-[0.97] transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + idx * 0.04, duration: 0.5, ease: EASE }}
            onClick={() => selectTopic(t)}
          >
            {/* Colored glow background */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-active:opacity-[0.15]"
              style={{ background: t.color }}
            />

            <div className="relative p-3.5">
              {/* Icon + Name row */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{
                    background: `${t.color}12`,
                    border: `1px solid ${t.color}25`,
                  }}
                >
                  <span style={{ color: t.color }}>{t.icon}</span>
                </div>
                <p className="text-[0.8rem] text-white/85 font-medium leading-tight">
                  {t.nameTH}
                </p>
              </div>

              {/* Description */}
              <p className="text-[0.6rem] text-gold/25 leading-relaxed pl-[46px]">
                {t.desc}
              </p>
            </div>

            {/* Bottom accent line */}
            <div
              className="h-[1px] mx-3 mb-0 opacity-[0.12]"
              style={{ background: `linear-gradient(90deg, transparent, ${t.color}, transparent)` }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
