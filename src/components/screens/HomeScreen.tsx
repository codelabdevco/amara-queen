"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { EASE } from "@/constants/animation";
import LaurelButton from "@/components/ui/LaurelButton";

interface UserInfo { nickname: string; zodiac: { western: { signTh: string } } | null }

const FORTUNE_SERVICES = [
  { href: "/tarot", icon: "☽", name: "ไพ่ทาโร่", cost: 3 },
  { href: "/gypsy", icon: "♦", name: "ไพ่ยิปซี", cost: 2 },
  { href: "/siamsi", icon: "☰", name: "เซียมซี", cost: 1 },
];

const OTHER_SERVICES = [
  { href: "/auspicious", icon: "☆", name: "ฤกษ์ยามมงคล", cost: 2 },
  { href: "/calendar", icon: "☼", name: "วันดีวันร้าย", cost: 0 },
  { href: "/booking", icon: "☷", name: "นัดหมอดู", cost: 0 },
  { href: "/shop", icon: "❖", name: "ร้านค้ามงคล", cost: 0 },
];

export default function HomeScreen() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.profile) setUser({ nickname: d.profile.nickname, zodiac: d.zodiac });
    }).catch(() => {});
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Hero */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <h1
          className="text-2xl font-semibold tracking-[0.15em] mb-1"
          style={{
            background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer-text 4s ease-in-out infinite",
          }}
        >
          Queen Amara
        </h1>
        {user ? (
          <p className="text-[#E2D4A0]/60 text-xs mt-1">
            สวัสดี <span className="text-[#E2D4A0]">{user.nickname}</span>
            {user.zodiac && <span className="text-[#E2D4A0]/40"> · ราศี{user.zodiac.western.signTh}</span>}
          </p>
        ) : (
          <p className="text-[#E2D4A0]/30 text-xs mt-1">ราชินีแห่งดวงดาว</p>
        )}

        <motion.div
          className="w-20 h-[1px] mx-auto mt-4"
          style={{ background: "linear-gradient(90deg, transparent, #8B7A4A, transparent)" }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
      </motion.div>

      {/* Fortune Services — Laurel Buttons */}
      <motion.div
        className="flex flex-col items-center gap-3 mb-8 w-full"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-[#8B7A4A] text-[0.6rem] uppercase tracking-[0.3em] mb-1">ดูดวง</p>
        {FORTUNE_SERVICES.map((svc, idx) => (
          <motion.div
            key={svc.href}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.1, duration: 0.5, ease: EASE }}
          >
            <LaurelButton variant="crimson" href={svc.href} className="w-[240px]">
              <span className="flex items-center gap-2">
                <span className="opacity-60">{svc.icon}</span>
                <span>{svc.name}</span>
                <span className="opacity-30 text-[0.55rem]">&#9733;{svc.cost}</span>
              </span>
            </LaurelButton>
          </motion.div>
        ))}
      </motion.div>

      {/* Divider */}
      <motion.div
        className="flex items-center gap-3 w-full max-w-[260px] mb-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.5 }}
      >
        <div className="flex-1 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #5A4E34)" }} />
        <span className="text-[#8B7A4A]/40 text-[0.5rem]">&#10022;</span>
        <div className="flex-1 h-[1px]" style={{ background: "linear-gradient(90deg, #5A4E34, transparent)" }} />
      </motion.div>

      {/* Other Services */}
      <motion.div
        className="w-full max-w-[300px] space-y-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <p className="text-[#8B7A4A] text-[0.6rem] uppercase tracking-[0.3em] text-center mb-3">บริการอื่นๆ</p>
        <div className="grid grid-cols-2 gap-3">
          {OTHER_SERVICES.map((svc, idx) => (
            <motion.div
              key={svc.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 + idx * 0.08, duration: 0.4, ease: EASE }}
            >
              <LaurelButton variant="crimson" href={svc.href} className="w-full h-[60px]">
                <span className="flex flex-col items-center justify-center gap-0 leading-tight w-full text-center">
                  <span className="text-[0.65rem]">{svc.name}</span>
                  <span className="opacity-30 text-[0.45rem]">{svc.cost > 0 ? `★${svc.cost} เครดิต` : "ฟรี"}</span>
                </span>
              </LaurelButton>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
