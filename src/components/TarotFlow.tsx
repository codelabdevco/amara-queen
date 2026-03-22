"use client";

import { AnimatePresence } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import BackButton from "@/components/ui/BackButton";
import dynamic from "next/dynamic";
const TopicScreen = dynamic(() => import("@/components/screens/TopicScreen"));
const SpreadScreen = dynamic(() => import("@/components/screens/SpreadScreen"));
const QuestionScreen = dynamic(() => import("@/components/screens/QuestionScreen"));
const CardPickScreen = dynamic(() => import("@/components/screens/CardPickScreen"), { ssr: false });
const ReadingScreen = dynamic(() => import("@/components/screens/ReadingScreen"), { ssr: false });

export default function TarotFlow() {
  const phase = useTarotStore((s) => s.phase);

  return (
    <>
      <div className="px-4 pt-2 pb-1">
        <BackButton />
      </div>
      <AnimatePresence mode="wait">
        {phase === "topic" && <TopicScreen />}
        {phase === "spread" && <SpreadScreen />}
        {phase === "question" && <QuestionScreen />}
        {phase === "fan" && <CardPickScreen />}
        {phase === "reading" && <ReadingScreen />}
      </AnimatePresence>
    </>
  );
}
