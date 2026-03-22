"use client";

import { motion } from "framer-motion";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

export default function BookingScreen() {
  return (
    <motion.div className="flex flex-col items-center justify-center h-full px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: "#3A0E0E", border: "1px solid #8B7A4A20" }}
      >
        <span className="text-[#d4af37] text-2xl">☷</span>
      </div>
      <h2
        className="text-base font-semibold tracking-[0.1em] mb-1"
        style={{
          background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer-text 4s ease-in-out infinite",
        }}
      >นัดหมอดู</h2>
      <p className="text-[#8B7A4A]/50 text-xs mb-6">ระบบจองคิวดูดวงกับหมอดูตัวจริง</p>

      <div className="rounded-lg p-5 text-center max-w-[280px]"
        style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}
      >
        <p className="text-[#E2D4A0]/60 text-sm mb-2">กำลังเปิดให้บริการเร็วๆ นี้</p>
        <p className="text-[#8B7A4A]/30 text-xs leading-5">
          เรากำลังคัดสรรหมอดูผู้เชี่ยวชาญ
          <br />เพื่อให้บริการที่ดีที่สุดแก่คุณ
        </p>
      </div>

      <LaurelButton variant="crimson" href="/home" className="mt-6">กลับหน้าหลัก</LaurelButton>
    </motion.div>
  );
}
