"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { TOPICS } from "@/types/tarot";
import { GYPSY_TOPICS } from "@/types/gypsy";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";
import { useState, useEffect } from "react";

export default function TopicScreen() {
  const service = useTarotStore((s) => s.service);
  const selectTopic = useTarotStore((s) => s.selectTopic);
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const topics = service === "gypsy" ? GYPSY_TOPICS : TOPICS;
  const [credits, setCredits] = useState<number | null>(null);
  const costMap: Record<string, number> = { tarot: 3, gypsy: 2 };
  const cost = costMap[service] || 1;

  useEffect(() => {
    fetch("/api/credits/balance").then(r => r.json()).then(d => setCredits(d.credits ?? 0)).catch(() => {});
  }, []);

  return (
    <motion.div
      key="topic"
      className="flex flex-col items-center justify-center h-full px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
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
        {credits !== null && (
          <p className="text-[#d4af37]/40 text-[0.55rem] mt-1">&#9733; ใช้ {cost} เครดิต/ครั้ง · คงเหลือ {credits}</p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-[300px]">
        {topics.map((t, idx) => {
          const isSelected = selectedTopic?.id === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.03, duration: 0.4, ease: EASE }}
            >
              <LaurelButton
                variant={isSelected ? "gold" : "crimson"}
                onClick={() => selectTopic(t)}
                className="w-full h-[46px]"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`text-xs ${isSelected ? "" : "opacity-50"}`}>{t.icon}</span>
                  <span className="text-[0.65rem]">{t.nameTH}</span>
                </span>
              </LaurelButton>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
