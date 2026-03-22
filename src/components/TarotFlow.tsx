"use client";

import { AnimatePresence } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import dynamic from "next/dynamic";
const TopicScreen = dynamic(() => import("@/components/screens/TopicScreen"));
const SpreadScreen = dynamic(() => import("@/components/screens/SpreadScreen"));
const QuestionScreen = dynamic(() => import("@/components/screens/QuestionScreen"));
const CardPickScreen = dynamic(() => import("@/components/screens/CardPickScreen"), { ssr: false });
const ReadingScreen = dynamic(() => import("@/components/screens/ReadingScreen"), { ssr: false });
import BackButton from "@/components/ui/BackButton";

export default function TarotFlow() {
  const phase = useTarotStore((s) => s.phase);

  return (
    <div className="fixed inset-0 z-10 pt-[56px] pb-8 overflow-y-auto">
      <BackButton />
      <AnimatePresence mode="wait">
        {phase === "topic" && <TopicScreen />}
        {phase === "spread" && <SpreadScreen />}
        {phase === "question" && <QuestionScreen />}
        {phase === "fan" && <CardPickScreen />}
        {phase === "reading" && <ReadingScreen />}
      </AnimatePresence>
    </div>
  );
}
