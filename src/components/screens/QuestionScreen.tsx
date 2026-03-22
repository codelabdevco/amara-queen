"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

const SERVICE_COST: Record<string, number> = { tarot: 3, gypsy: 2 };

export default function QuestionScreen() {
  const service = useTarotStore((s) => s.service);
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const userQuestion = useTarotStore((s) => s.userQuestion);
  const setQuestion = useTarotStore((s) => s.setQuestion);
  const setPhase = useTarotStore((s) => s.setPhase);
  const [showConfirm, setShowConfirm] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const cost = SERVICE_COST[service] || 1;

  useEffect(() => {
    fetch("/api/credits/balance").then(r => r.json()).then(d => setCredits(d.credits ?? 0)).catch(() => {});
  }, []);

  function handleStart() {
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    setPhase("fan");
  }

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
        className="text-base font-semibold tracking-[0.1em] mb-0.5"
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
      <p className="text-[#8B7A4A]/50 text-[0.65rem] mb-4">พิมพ์คำถามของคุณ หรือข้ามไปเลยก็ได้</p>

      <textarea
        className="w-full max-w-[300px] h-[90px] bg-[#2a1215] rounded-lg px-4 py-3 text-sm text-[#E2D4A0]/80 placeholder-[#8B7A4A]/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#8B7A4A]/20"
        placeholder="พิมพ์คำถามของคุณ... (ไม่บังคับ)"
        value={userQuestion}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {selectedTopic && (
        <div className="flex flex-wrap gap-1.5 mt-3 max-w-[300px] justify-center">
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

      {/* Credit info */}
      <p className="text-[#d4af37]/30 text-[0.55rem] mt-4">
        &#9733; ใช้ {cost} เครดิต{credits !== null && ` · คงเหลือ ${credits}`}
      </p>

      <div className="flex gap-3 mt-4">
        <LaurelButton variant="crimson" onClick={() => setPhase("fan")}>ข้าม</LaurelButton>
        <LaurelButton variant="gold" onClick={handleStart}>เริ่มจั่วไพ่</LaurelButton>
      </div>

      {/* Confirm popup */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative rounded-lg p-5 w-full max-w-[320px] text-center"
              style={{ background: "linear-gradient(135deg, #2D0A0A, #3A0E0E)", border: "1px solid #8B7A4A20" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "#1e0c0c", border: "1px solid #8B7A4A20" }}
              >
                <span className="text-[#d4af37] text-lg">&#9733;</span>
              </div>

              <h3 className="text-[#E2D4A0] text-sm font-semibold mb-1">ยืนยันการใช้เครดิต</h3>
              <p className="text-[#8B7A4A]/50 text-xs mb-4">
                {service === "gypsy" ? "ไพ่ยิปซี" : "ไพ่ทาโร่"} จะใช้ <span className="text-[#d4af37] font-semibold">{cost} เครดิต</span>
              </p>

              <div className="rounded-lg p-3 mb-4" style={{ background: "#1e0c0c", border: "0.5px solid #8B7A4A10" }}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8B7A4A]/40">คงเหลือ</span>
                  <span className="text-[#E2D4A0]">{credits ?? "..."} เครดิต</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8B7A4A]/40">หัก</span>
                  <span className="text-[#d4af37]">-{cost} เครดิต</span>
                </div>
                <div className="h-[1px] my-1.5" style={{ background: "#8B7A4A15" }} />
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B7A4A]/40">หลังใช้</span>
                  <span className="text-[#E2D4A0] font-semibold">{(credits ?? 0) - cost} เครดิต</span>
                </div>
              </div>

              {(credits ?? 0) < cost ? (
                <>
                  <p className="text-[#7a2020] text-xs mb-3">เครดิตไม่พอ กรุณาเติมเครดิต</p>
                  <LaurelButton variant="crimson" onClick={() => setShowConfirm(false)} className="w-full">ปิด</LaurelButton>
                </>
              ) : (
                <div className="flex gap-3 justify-center">
                  <LaurelButton variant="crimson" onClick={() => setShowConfirm(false)}>ยกเลิก</LaurelButton>
                  <LaurelButton variant="gold" onClick={handleConfirm}>ยืนยัน</LaurelButton>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
