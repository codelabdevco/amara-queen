"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import CardBack from "@/components/ui/CardBack";
import LaurelButton from "@/components/ui/LaurelButton";

import { EASE } from "@/constants/animation";

const cardVariants = [
  { rotate: -12, x: -20, delay: 0 },
  { rotate: 0, x: 0, delay: 0.15 },
  { rotate: 12, x: 20, delay: 0.3 },
];

export default function WelcomeScreen() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setLoggedIn(true); }).catch(() => {});
  }, []);

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
        className="text-3xl text-center mb-2 tracking-[0.15em] font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
        style={{
          background: "linear-gradient(135deg, #8B7A4A, #d4af37, #f0d78c, #d4af37, #8B7A4A)",
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer-text 4s ease-in-out infinite",
        }}
      >
        Queen Amara
      </motion.h1>

      <motion.p
        className="text-center text-[#8B7A4A]/50 text-sm leading-7 mb-10 max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
      >
        ราชินีแห่งดวงดาว
        <br />
        เปิดไพ่เพื่อค้นหาคำตอบจากจักรวาล
      </motion.p>

      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: EASE }}
      >
        <LaurelButton variant="gold" href="/home">เริ่มใช้งาน</LaurelButton>

        {!loggedIn && (
          <a
            href="/api/auth/line"
            className="flex items-center justify-center gap-2 w-[220px] py-3 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-110"
            style={{ background: "#06C755", color: "#fff" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.81 2 10.44c0 3.7 3.04 6.9 7.34 7.93-.1.38-.66 2.44-.68 2.6 0 0-.01.1.05.14.06.03.13.01.13.01.17-.02 2-1.3 2.32-1.53.61.09 1.24.14 1.84.14 5.52 0 10-3.81 10-8.44C22 5.81 17.52 2 12 2z"/></svg>
            เข้าสู่ระบบด้วย LINE
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}
