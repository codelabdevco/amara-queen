"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import Starfield from "@/components/canvas/Starfield";
import GoldenMist from "@/components/effects/GoldenMist";
import DustParticles from "@/components/effects/DustParticles";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import HomeScreen from "@/components/screens/HomeScreen";
import TarotFlow from "@/components/TarotFlow";
import UserAuth from "@/components/ui/UserAuth";
import CreditBadge from "@/components/ui/CreditBadge";
import BackButton from "@/components/ui/BackButton";

import { EASE } from "@/constants/animation";
import { THEME } from "@/constants/theme";

export default function TarotApp() {
  const phase = useTarotStore((s) => s.phase);

  return (
    <>
      {/* Custom background image (if configured) */}
      {THEME.backgroundImage && (
        <div className="fixed inset-0 z-0">
          <img src={THEME.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <Starfield />
      <GoldenMist />
      <DustParticles />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#08090e] via-[#08090e]/90 to-transparent" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-2">
          <BackButton />
          <span className="text-sm text-gold/70 tracking-[0.2em] font-medium">
            Amara Queen
          </span>
        </div>
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
