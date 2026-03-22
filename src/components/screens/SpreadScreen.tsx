"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { SPREADS } from "@/types/tarot";
import { GYPSY_SPREADS } from "@/types/gypsy";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";
import { useState, useEffect } from "react";

export default function SpreadScreen() {
  const service = useTarotStore((s) => s.service);
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const selectSpread = useTarotStore((s) => s.selectSpread);
  const setPhase = useTarotStore((s) => s.setPhase);
  const spreads = service === "gypsy" ? GYPSY_SPREADS : SPREADS;
  const [credits, setCredits] = useState<number | null>(null);
  const costMap: Record<string, number> = { tarot: 3, gypsy: 2 };
  const cost = costMap[service] || 1;

  useEffect(() => {
    fetch("/api/credits/balance").then(r => r.json()).then(d => setCredits(d.credits ?? 0)).catch(() => {});
  }, []);

  return (
    <motion.div
      key="spread"
      className="flex flex-col items-center justify-center h-full px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
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
        เลือกรูปแบบการวาง
      </h2>
      <p className="text-[#8B7A4A]/50 text-xs mb-0.5">
        แนะนำ: <span className="text-[#E2D4A0]/60">{selectedSpread?.nameTH}</span> สำหรับ {selectedTopic?.nameTH}
      </p>
      {credits !== null && (
        <p className="text-[#d4af37]/40 text-[0.6rem]">
          &#9733; ใช้ {cost} เครดิต/ครั้ง · คงเหลือ {credits} เครดิต
        </p>
      )}
      <motion.div
        className="w-16 h-[1px] mx-auto mb-3"
        style={{ background: "linear-gradient(90deg, transparent, #8B7A4A, transparent)" }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />

      <div className="w-full max-w-[280px] flex flex-col items-center gap-2">
        {spreads.map((s, idx) => {
          const isDefault = s.id === selectedSpread?.id;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.06, duration: 0.4, ease: EASE }}
              className="w-full"
            >
              <LaurelButton
                variant={isDefault ? "gold" : "crimson"}
                onClick={() => { selectSpread(s); setPhase("question"); }}
                className="w-full h-[46px]"
              >
                <span className="flex items-center gap-2">
                  <span className="opacity-50 text-xs">{s.cardCount} ใบ</span>
                  <span>{s.nameTH}</span>
                  {isDefault && <span className="opacity-40 text-[0.6rem]">&#10022;</span>}
                </span>
              </LaurelButton>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
