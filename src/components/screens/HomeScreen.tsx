"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import type { ServiceType } from "@/types/tarot";

const SERVICES: { id: ServiceType; icon: string; name: string; desc: string; color: string; phase: string }[] = [
  { id: "tarot", icon: "☽", name: "ไพ่ทาโร่", desc: "78 ใบ Major & Minor Arcana ทำนายด้วย AI", color: "#e8d48b", phase: "topic" },
  { id: "gypsy", icon: "♦", name: "ไพ่ยิปซี", desc: "36 ใบ Lenormand อ่านง่าย ตรงประเด็น", color: "#b48bd4", phase: "topic" },
  { id: "siamsi", icon: "☰", name: "เซียมซี", desc: "เสี่ยงเซียมซี 1-100 พร้อม AI ตีความ", color: "#d4a84b", phase: "siamsi" },
  { id: "auspicious", icon: "✦", name: "ฤกษ์ยามมงคล", desc: "ดูฤกษ์ดี วันมงคล สำหรับงานสำคัญ", color: "#4a9e6e", phase: "auspicious" },
  { id: "calendar", icon: "☀", name: "วันดีวันร้าย", desc: "ปฏิทินดวงรายสัปดาห์ตามราศีของคุณ", color: "#378add", phase: "calendar" },
  { id: "booking", icon: "☎", name: "นัดหมอดู", desc: "จองคิวดูดวงกับหมอดูตัวจริง", color: "#c44a5a", phase: "booking" },
  { id: "shop", icon: "✧", name: "ร้านค้ามงคล", desc: "วัตถุมงคล เครื่องราง ของดี เสริมดวง", color: "#d85a30", phase: "shop" },
];

export default function HomeScreen() {
  const setService = useTarotStore((s) => s.setService);
  const setPhase = useTarotStore((s) => s.setPhase);

  function handleSelect(svc: typeof SERVICES[0]) {
    setService(svc.id);
    setPhase(svc.phase as never);
  }

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <h2 className="text-lg text-gold font-semibold tracking-wide">เลือกบริการ</h2>
        <p className="text-white/25 text-xs mt-1">ค้นหาคำตอบที่จักรวาลมีให้คุณ</p>
      </motion.div>

      {/* Service grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-full">
        {SERVICES.map((svc, idx) => (
          <motion.button
            key={svc.id}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0d14]/90 text-left active:scale-[0.97] transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + idx * 0.05, duration: 0.5, ease: EASE }}
            onClick={() => handleSelect(svc)}
          >
            {/* Colored glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-active:opacity-[0.15]"
              style={{ background: svc.color }}
            />

            <div className="relative p-3.5">
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: `${svc.color}12`, border: `1px solid ${svc.color}25` }}
                >
                  <span style={{ color: svc.color }}>{svc.icon}</span>
                </div>
                <p className="text-[0.8rem] text-white/85 font-medium leading-tight">{svc.name}</p>
              </div>
              <p className="text-[0.6rem] text-white/25 leading-relaxed pl-[46px]">{svc.desc}</p>
            </div>

            <div
              className="h-[1px] mx-3 mb-0 opacity-[0.12]"
              style={{ background: `linear-gradient(90deg, transparent, ${svc.color}, transparent)` }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
