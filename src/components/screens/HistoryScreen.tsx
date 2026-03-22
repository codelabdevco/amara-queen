"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { EASE } from "@/constants/animation";
import { getHistory, deleteReading, ReadingRecord } from "@/lib/history";
import Button from "@/components/ui/Button";

const TREND_LABEL: Record<string, string> = {
  very_positive: "ดีมาก",
  positive: "ดี",
  neutral: "กลางๆ",
  caution: "ระวัง",
  challenging: "ท้าทาย",
};

const TREND_COLOR: Record<string, string> = {
  very_positive: "#e8d48b",
  positive: "#a8d48b",
  neutral: "#8bb8d4",
  caution: "#d4a84b",
  challenging: "#b48bd4",
};

interface Props {
  onClose: () => void;
}

export default function HistoryScreen({ onClose }: Props) {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  function handleDelete(id: string) {
    deleteReading(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#08090e]/95 backdrop-blur-sm overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-gold font-semibold tracking-wide">ประวัติการดูดวง</h2>
          <button onClick={onClose} className="text-white/40 text-sm hover:text-white/60 transition-colors">
            ปิด
          </button>
        </div>

        {records.length === 0 ? (
          <motion.p
            className="text-center text-white/30 text-sm mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ยังไม่มีประวัติการดูดวง
          </motion.p>
        ) : (
          <div className="space-y-3">
            {records.map((r, idx) => {
              const isOpen = expanded === r.id;
              const trendColor = TREND_COLOR[r.reading.trend] || TREND_COLOR.neutral;

              return (
                <motion.div
                  key={r.id}
                  className="rounded-xl border border-white/[0.06] bg-[#0c0d14]/90 overflow-hidden"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.4, ease: EASE }}
                >
                  <button
                    className="w-full text-left p-4 active:bg-white/[0.02] transition-colors"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${r.topicColor}15`, border: `1px solid ${r.topicColor}25` }}
                      >
                        <span style={{ color: r.topicColor }}>{r.topicIcon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white/80 truncate">{r.topic}</p>
                          <span
                            className="text-[0.6rem] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ color: trendColor, background: `${trendColor}15` }}
                          >
                            {TREND_LABEL[r.reading.trend] || "กลางๆ"}
                          </span>
                        </div>
                        <p className="text-[0.65rem] text-white/25 mt-0.5">{formatDate(r.timestamp)} · {r.spread}</p>
                      </div>
                      <span className={`text-white/20 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                    </div>
                    {r.question && (
                      <p className="text-xs text-white/35 mt-2 italic truncate pl-11">"{r.question}"</p>
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
                          {r.reading.summary && (
                            <p className="text-xs text-white/60 leading-6">{r.reading.summary}</p>
                          )}
                          {r.reading.advice && (
                            <div className="bg-gold/[0.04] border border-gold/10 rounded-lg p-3">
                              <p className="text-[0.65rem] text-gold/40 mb-1 uppercase tracking-wider">คำแนะนำ</p>
                              <p className="text-xs text-white/55 leading-6">{r.reading.advice}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-[0.65rem] text-red-400/50 hover:text-red-400/80 transition-colors"
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
