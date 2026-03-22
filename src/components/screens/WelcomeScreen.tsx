"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import CardBack from "@/components/ui/CardBack";
import Button from "@/components/ui/Button";
import { useTarotStore } from "@/store/useTarotStore";
import dynamic from "next/dynamic";

const HistoryScreen = dynamic(() => import("@/components/screens/HistoryScreen"), { ssr: false });

import { EASE } from "@/constants/animation";

const cardVariants = [
  { rotate: -12, x: -20, delay: 0 },
  { rotate: 0, x: 0, delay: 0.15 },
  { rotate: 12, x: 20, delay: 0.3 },
];

export default function WelcomeScreen() {
  const setPhase = useTarotStore(s => s.setPhase);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="relative w-[220px] h-[280px] mb-8">
        {cardVariants.map((v, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2"
            initial={{ opacity: 0, y: 60, rotate: 0, x: "-50%" }}
            animate={{ opacity: 1, y: 0, rotate: v.rotate, x: `calc(-50% + ${v.x}px)` }}
            transition={{ delay: 0.2 + v.delay, duration: 1, type: "spring", stiffness: 80, damping: 15 }}
            style={{ zIndex: i === 1 ? 2 : 1 }}
          >
            <CardBack width={150} height={240} />
          </motion.div>
        ))}
      </div>

      <motion.h1
        className="text-3xl text-gold text-center mb-2 tracking-[0.15em] font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
        style={{ textShadow: "0 0 40px rgba(232,212,139,.2)" }}
      >
        Amara Queen
      </motion.h1>

      <motion.p
        className="text-center text-white/40 text-sm leading-7 mb-10 max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
      >
        ราชินีแห่งดวงดาว
        <br />
        เปิดไพ่เพื่อค้นหาคำตอบจากจักรวาล
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: EASE }}
      >
        <Button onClick={() => setPhase("topic")}>เริ่มดูดวง</Button>
      </motion.div>

      <motion.button
        className="mt-4 text-xs text-white/25 hover:text-white/50 transition-colors tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
        onClick={() => setShowHistory(true)}
      >
        ดูประวัติ
      </motion.button>

      <AnimatePresence>
        {showHistory && <HistoryScreen onClose={() => setShowHistory(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
