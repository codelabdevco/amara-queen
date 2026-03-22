"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { SPREADS } from "@/types/tarot";
import { GYPSY_SPREADS } from "@/types/gypsy";
import { EASE } from "@/constants/animation";
import MiniCardBack from "@/components/ui/MiniCardBack";

export default function SpreadScreen() {
  const service = useTarotStore((s) => s.service);
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const selectSpread = useTarotStore((s) => s.selectSpread);
  const setPhase = useTarotStore((s) => s.setPhase);
  const spreads = service === "gypsy" ? GYPSY_SPREADS : SPREADS;

  return (
    <motion.div
      key="spread"
      className="flex flex-col items-center min-h-full px-4 pt-4 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="text-lg text-gold font-semibold mb-1 tracking-wide">เลือกรูปแบบการวาง</p>
      <p className="text-white/30 text-xs mb-5">
        แนะนำ: <span className="text-gold/60">{selectedSpread?.nameTH}</span> สำหรับ {selectedTopic?.nameTH}
      </p>

      <div className="w-full max-w-full space-y-2.5">
        {spreads.map((s, idx) => {
          const isDefault = s.id === selectedSpread?.id;
          return (
            <motion.button
              key={s.id}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left active:bg-gold/5
                ${isDefault ? "border-gold/40 bg-gold/5" : "border-white/10 bg-[#0c0d14]/80"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.04, duration: 0.4, ease: EASE }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { selectSpread(s); setPhase("question"); }}
            >
              <div className="flex-shrink-0 flex items-end gap-[1px]">
                {Array.from({ length: Math.min(s.cardCount, 4) }, (_, i) => (
                  <div key={i} style={{ transform: `rotate(${(i - 1) * 6}deg)`, opacity: 0.6 }}>
                    <MiniCardBack width={18} height={29} />
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90 font-medium">{s.nameTH}</span>
                  <span className="text-[0.6rem] text-white/25">{s.cardCount} ใบ</span>
                  {isDefault && <span className="text-[0.55rem] text-gold/60 ml-auto">แนะนำ</span>}
                </div>
                <p className="text-[0.65rem] text-white/30 mt-0.5">{s.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
