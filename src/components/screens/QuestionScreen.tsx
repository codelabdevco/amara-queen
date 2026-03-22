"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

export default function QuestionScreen() {
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const userQuestion = useTarotStore((s) => s.userQuestion);
  const setQuestion = useTarotStore((s) => s.setQuestion);
  const setPhase = useTarotStore((s) => s.setPhase);

  return (
    <motion.div
      key="question"
      className="flex flex-col items-center justify-center min-h-full px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="text-lg text-gold font-semibold mb-1 tracking-wide">ตั้งคำถาม</p>
      <p className="text-white/30 text-xs mb-6">พิมพ์คำถามของคุณ หรือข้ามไปเลยก็ได้</p>

      <textarea
        className="w-full max-w-[340px] h-[100px] bg-[#2a1215] border border-gold/[0.05] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/15"
        placeholder="พิมพ์คำถามของคุณ... (ไม่บังคับ)"
        value={userQuestion}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {selectedTopic && (
        <div className="flex flex-wrap gap-2 mt-3 max-w-[340px]">
          {selectedTopic.examples.map((ex, i) => (
            <button
              key={i}
              className="text-[0.65rem] text-gold/50 border border-gold/15 rounded-full px-3 py-1 active:bg-gold/5"
              onClick={() => setQuestion(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => setPhase("fan")}>ข้าม</Button>
        <Button onClick={() => setPhase("fan")}>ต่อไป</Button>
      </div>
    </motion.div>
  );
}
