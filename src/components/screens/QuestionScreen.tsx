"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

export default function QuestionScreen() {
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const userQuestion = useTarotStore((s) => s.userQuestion);
  const setQuestion = useTarotStore((s) => s.setQuestion);
  const setPhase = useTarotStore((s) => s.setPhase);

  return (
    <motion.div
      key="question"
      className="flex flex-col items-center justify-center h-full px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: EASE }}
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
        ตั้งคำถาม
      </h2>
      <p className="text-[#8B7A4A]/50 text-xs mb-5">พิมพ์คำถามของคุณ หรือข้ามไปเลยก็ได้</p>

      <textarea
        className="w-full max-w-[340px] h-[100px] bg-[#2a1215] rounded-xl px-4 py-3 text-sm text-[#E2D4A0]/80 placeholder-[#8B7A4A]/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#8B7A4A]/20"
        placeholder="พิมพ์คำถามของคุณ... (ไม่บังคับ)"
        value={userQuestion}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {selectedTopic && (
        <div className="flex flex-wrap gap-2 mt-3 max-w-[340px] justify-center">
          {selectedTopic.examples.map((ex, i) => (
            <button
              key={i}
              className="text-[0.65rem] text-[#E2D4A0]/40 bg-[#2a1215]/60 rounded-full px-3 py-1.5 active:bg-[#2a1215] transition-colors"
              onClick={() => setQuestion(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <LaurelButton variant="crimson" onClick={() => setPhase("fan")}>ข้าม</LaurelButton>
        <LaurelButton variant="gold" onClick={() => setPhase("fan")}>ต่อไป</LaurelButton>
      </div>
    </motion.div>
  );
}
