"use client";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import TarotFlow from "@/components/TarotFlow";
import { useTarotStore } from "@/store/useTarotStore";

export default function GypsyPage() {
  const setPhase = useTarotStore(s => s.setPhase);
  const setService = useTarotStore(s => s.setService);

  useEffect(() => {
    setService("gypsy");
    setPhase("topic");
    return () => { setService("tarot"); setPhase("topic"); };
  }, [setPhase, setService]);

  return <AppShell><TarotFlow /></AppShell>;
}
