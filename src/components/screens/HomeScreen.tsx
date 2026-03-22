"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EASE } from "@/constants/animation";

const FEATURED = [
  { href: "/tarot", icon: "☽", name: "ไพ่ทาโร่", desc: "78 ใบ ทำนาย AI", color: "#e8d48b" },
  { href: "/gypsy", icon: "♦", name: "ไพ่ยิปซี", desc: "36 ใบ Lenormand", color: "#b48bd4" },
  { href: "/siamsi", icon: "☰", name: "เซียมซี", desc: "เสี่ยงเซียมซี AI", color: "#d4a84b" },
];

const SERVICES = [
  { href: "/auspicious", icon: "✦", name: "ฤกษ์ยามมงคล", desc: "ดูฤกษ์ดี วันมงคล", color: "#4a9e6e" },
  { href: "/calendar", icon: "☀", name: "วันดีวันร้าย", desc: "ดวงรายสัปดาห์", color: "#378add" },
  { href: "/booking", icon: "☎", name: "นัดหมอดู", desc: "จองคิวหมอดูตัวจริง", color: "#c44a5a" },
  { href: "/shop", icon: "✧", name: "ร้านค้ามงคล", desc: "วัตถุมงคล เสริมดวง", color: "#d85a30" },
];

interface UserInfo { nickname: string; zodiac: { western: { signTh: string } } | null }

export default function HomeScreen() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.profile) setUser({ nickname: d.profile.nickname, zodiac: d.zodiac });
    }).catch(() => {});
  }, []);

  return (
    <motion.div
      className="flex flex-col min-h-full px-4 pt-3 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Greeting */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
      >
        {user ? (
          <>
            <p className="text-white/40 text-xs">สวัสดี</p>
            <h2 className="text-gold text-xl font-semibold">{user.nickname}</h2>
            {user.zodiac && <p className="text-gold/25 text-[0.65rem] mt-0.5">ราศี{user.zodiac.western.signTh}</p>}
          </>
        ) : (
          <>
            <h2 className="text-gold text-lg font-semibold tracking-wide">เลือกบริการ</h2>
            <p className="text-gold/25 text-xs mt-0.5">ค้นหาคำตอบที่จักรวาลมีให้คุณ</p>
          </>
        )}
      </motion.div>

      {/* Featured — ดูดวง 3 แบบ */}
      <motion.p
        className="text-white/30 text-[0.65rem] uppercase tracking-wider mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        ดูดวง
      </motion.p>
      <div className="flex gap-2.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {FEATURED.map((svc, idx) => (
          <motion.div
            key={svc.href}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.5, ease: EASE }}
            className="flex-shrink-0"
          >
            <Link
              href={svc.href}
              className="group relative overflow-hidden rounded-2xl border border-gold/[0.04] bg-[#2a1215] block w-[140px] active:scale-[0.96] transition-transform"
            >
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.1] blur-2xl"
                style={{ background: svc.color }}
              />
              <div className="relative p-4 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
                  style={{ background: `${svc.color}12`, border: `1px solid ${svc.color}20` }}
                >
                  <span style={{ color: svc.color }}>{svc.icon}</span>
                </div>
                <p className="text-white/85 text-sm font-medium">{svc.name}</p>
                <p className="text-gold/25 text-[0.6rem] mt-0.5">{svc.desc}</p>
              </div>
              <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${svc.color}30, transparent)` }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Other Services */}
      <motion.p
        className="text-white/30 text-[0.65rem] uppercase tracking-wider mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        บริการอื่นๆ
      </motion.p>
      <div className="space-y-2">
        {SERVICES.map((svc, idx) => (
          <motion.div
            key={svc.href}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.06, duration: 0.5, ease: EASE }}
          >
            <Link
              href={svc.href}
              className="group flex items-center gap-3 p-3.5 rounded-xl border border-gold/[0.04] bg-[#2a1215]/80 active:scale-[0.98] transition-transform"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: `${svc.color}10`, border: `1px solid ${svc.color}20` }}
              >
                <span style={{ color: svc.color }}>{svc.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium">{svc.name}</p>
                <p className="text-gold/25 text-[0.6rem]">{svc.desc}</p>
              </div>
              <span className="text-white/15 text-sm">›</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
