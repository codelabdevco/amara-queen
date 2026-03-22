"use client";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import TarotFlow from "@/components/TarotFlow";
import { useTarotStore } from "@/store/useTarotStore";

export default function GypsyPage() {
  const setService = useTarotStore(s => s.setService);
  useEffect(() => { setService("gypsy"); return () => { setService("tarot"); }; }, [setService]);
  return <AppShell><TarotFlow /></AppShell>;
}
