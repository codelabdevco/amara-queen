"use client";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import TarotFlow from "@/components/TarotFlow";
import { useTarotStore } from "@/store/useTarotStore";

export default function TarotPage() {
  const setPhase = useTarotStore(s => s.setPhase);
  const setService = useTarotStore(s => s.setService);

  useEffect(() => {
    setService("tarot");
    setPhase("topic");
    return () => { setPhase("topic"); };
  }, [setPhase, setService]);

  return <AppShell><TarotFlow /></AppShell>;
}
