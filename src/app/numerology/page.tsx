"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import LaurelButton from "@/components/ui/LaurelButton";
import { EASE } from "@/constants/animation";

const TYPES = [
  { id: "phone", icon: "☎", name: "เบอร์โทรศัพท์", placeholder: "08XXXXXXXX", inputMode: "tel" as const },
  { id: "lucky", icon: "★", name: "เบอร์มงคล", placeholder: "08XXXXXXXX", inputMode: "tel" as const },
  { id: "bank", icon: "฿", name: "เลขบัญชีธนาคาร", placeholder: "XXX-X-XXXXX-X", inputMode: "numeric" as const },
  { id: "car", icon: "◈", name: "ทะเบียนรถ", placeholder: "กข 1234", inputMode: "text" as const },
  { id: "id", icon: "♦", name: "บัตรประชาชน", placeholder: "X-XXXX-XXXXX-XX-X", inputMode: "numeric" as const },
];

const LEVEL_COLOR: Record<string, string> = { excellent: "#d4af37", good: "#C4AD72", neutral: "#8B7A4A", caution: "#7a4020", bad: "#7a2020" };

interface Result {
  type: string; number: string; score: number; level: string; levelText: string;
  summary: string; digitAnalysis: string; strengths: string; weaknesses: string;
  compatibility: string; suggestion: string;
}

export default function NumerologyPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!selectedType || !number.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, number: number.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResult(data.result); }
    } catch { setError("ไม่สามารถเชื่อมต่อได้"); }
    setLoading(false);
  }

  function handleReset() {
    setSelectedType(null);
    setNumber("");
    setResult(null);
    setError("");
  }

  const activeType = TYPES.find(t => t.id === selectedType);

  return (
    <AppShell>
      <motion.div className="flex flex-col h-full px-4 pt-2 overflow-y-auto pb-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="text-center mb-4">
          <h2 className="text-base font-semibold tracking-[0.1em]"
            style={{ background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer-text 4s ease-in-out infinite" }}
          >เลขศาสตร์</h2>
          <p className="text-[#8B7A4A]/50 text-[0.65rem]">วิเคราะห์ตัวเลขมงคล ★1 เครดิต/ครั้ง</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select type */}
          {!selectedType && !result && (
            <motion.div key="types" className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {TYPES.map((t, idx) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.3 }}>
                  <LaurelButton variant="crimson" onClick={() => setSelectedType(t.id)} className="w-full h-[46px]">
                    <span className="flex items-center gap-2">
                      <span className="opacity-50">{t.icon}</span>
                      <span className="text-[0.7rem]">{t.name}</span>
                    </span>
                  </LaurelButton>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Step 2: Input number */}
          {selectedType && !result && !loading && (
            <motion.div key="input" className="flex flex-col items-center gap-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#d4af37] text-xl">{activeType?.icon}</span>
                <p className="text-[#E2D4A0] text-sm font-medium">{activeType?.name}</p>
              </div>

              <input
                type="text"
                inputMode={activeType?.inputMode}
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder={activeType?.placeholder}
                className="w-full max-w-[300px] text-center rounded-lg px-4 py-3 text-lg text-[#E2D4A0] placeholder:text-[#8B7A4A]/25 outline-none tracking-wider font-mono"
                style={{ background: "#1e0c0c", border: "1px solid #8B7A4A15" }}
                autoFocus
              />

              {error && <p className="text-[#7a2020]/70 text-xs">{error}</p>}

              <div className="flex gap-3">
                <LaurelButton variant="crimson" onClick={handleReset}>ย้อนกลับ</LaurelButton>
                <LaurelButton variant="gold" onClick={handleAnalyze}>วิเคราะห์ ★1</LaurelButton>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <motion.div key="loading" className="flex flex-col items-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-10 h-10 border-2 border-[#8B7A4A]/30 border-t-[#d4af37] rounded-full animate-spin mb-4" />
              <p className="text-[#8B7A4A]/50 text-xs">AI กำลังวิเคราะห์ตัวเลข...</p>
            </motion.div>
          )}

          {/* Result */}
          {result && (
            <motion.div key="result" className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Score */}
              <div className="rounded-lg p-4 text-center" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A15" }}>
                <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-wider mb-1">{activeType?.name}</p>
                <p className="text-[#E2D4A0] text-lg font-mono tracking-[0.3em] mb-2">{result.number}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold" style={{ color: LEVEL_COLOR[result.level] || "#8B7A4A" }}>{result.score}/10</span>
                  <span className="text-sm" style={{ color: LEVEL_COLOR[result.level] || "#8B7A4A" }}>{result.levelText}</span>
                </div>
                {/* Score bar */}
                <div className="flex gap-0.5 justify-center mt-2">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="w-5 h-1.5 rounded-full" style={{ background: i < result.score ? (LEVEL_COLOR[result.level] || "#8B7A4A") : "#3A0E0E" }} />
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                <p className="text-[#8B7A4A]/40 text-[0.5rem] uppercase tracking-wider mb-1">ความหมาย</p>
                <p className="text-[#E2D4A0]/60 text-xs leading-5">{result.summary}</p>
              </div>

              {/* Digit analysis */}
              {result.digitAnalysis && (
                <div className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                  <p className="text-[#8B7A4A]/40 text-[0.5rem] uppercase tracking-wider mb-1">วิเคราะห์ตัวเลข</p>
                  <p className="text-[#E2D4A0]/60 text-xs leading-5">{result.digitAnalysis}</p>
                </div>
              )}

              {/* Strengths + Weaknesses */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                  <p className="text-[#d4af37]/40 text-[0.5rem] uppercase tracking-wider mb-1">จุดเด่น</p>
                  <p className="text-[#E2D4A0]/50 text-[0.65rem] leading-4">{result.strengths}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                  <p className="text-[#7a2020]/40 text-[0.5rem] uppercase tracking-wider mb-1">ข้อควรระวัง</p>
                  <p className="text-[#E2D4A0]/50 text-[0.65rem] leading-4">{result.weaknesses}</p>
                </div>
              </div>

              {/* Compatibility */}
              {result.compatibility && (
                <div className="rounded-lg p-3" style={{ background: "#2a1215", border: "0.5px solid #8B7A4A10" }}>
                  <p className="text-[#8B7A4A]/40 text-[0.5rem] uppercase tracking-wider mb-1">ความเข้ากันกับเจ้าของ</p>
                  <p className="text-[#E2D4A0]/50 text-xs leading-5">{result.compatibility}</p>
                </div>
              )}

              {/* Suggestion */}
              {result.suggestion && (
                <div className="rounded-lg p-3" style={{ background: "#3A0E0E", border: "0.5px solid #8B7A4A15" }}>
                  <p className="text-[#d4af37]/60 text-xs leading-5">💡 {result.suggestion}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center pt-2">
                <LaurelButton variant="crimson" onClick={handleReset}>วิเคราะห์เลขอื่น</LaurelButton>
                <LaurelButton variant="crimson" onClick={() => { window.location.href = "/home"; }}>กลับหน้าหลัก</LaurelButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppShell>
  );
}
