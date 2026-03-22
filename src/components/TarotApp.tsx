"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import AnimatedBg from "@/components/effects/AnimatedBg";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import HomeScreen from "@/components/screens/HomeScreen";
import TarotFlow from "@/components/TarotFlow";
import UserAuth from "@/components/ui/UserAuth";
import CreditBadge from "@/components/ui/CreditBadge";
import { EASE } from "@/constants/animation";
import { THEME } from "@/constants/theme";

export default function TarotApp() {
  const phase = useTarotStore((s) => s.phase);

  return (
    <>
      <AnimatedBg />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-[#1e0c0c]" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <span className="text-sm text-gold/70 tracking-[0.2em] font-medium">
          Amara Queen
        </span>
        <div className="flex gap-3 items-center">
          <CreditBadge />
          <UserAuth />
        </div>
      </header>

      {/* Landing */}
      <AnimatePresence>
        {phase === "landing" && (
          <motion.div
            className="fixed inset-0 z-10 pt-[56px] pb-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5, ease: EASE } }}
          >
            <WelcomeScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Home menu */}
      <AnimatePresence>
        {phase === "home" && (
          <motion.div
            className="fixed inset-0 z-10 pt-[56px] pb-8 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <HomeScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main flow */}
      {phase !== "landing" && phase !== "home" && <TarotFlow />}
    </>
  );
}
