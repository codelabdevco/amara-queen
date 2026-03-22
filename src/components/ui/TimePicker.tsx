"use client";

import { useMemo } from "react";

interface Props {
  value: string; // HH:mm
  onChange: (val: string) => void;
}

export default function TimePicker({ value, onChange }: Props) {
  const parsed = useMemo(() => {
    if (!value) return { hour: "", minute: "" };
    const [h, m] = value.split(":");
    return { hour: h || "", minute: m || "" };
  }, [value]);

  function handleChange(part: "hour" | "minute", val: string) {
    const next = { ...parsed, [part]: val };
    if (next.hour && next.minute) {
      onChange(`${next.hour.padStart(2, "0")}:${next.minute.padStart(2, "0")}`);
    } else if (!next.hour && !next.minute) {
      onChange("");
    }
  }

  const selectClass = "bg-[#1e0c0c] rounded-lg px-2 py-2.5 text-sm text-white focus:border-gold/10 outline-none appearance-none cursor-pointer transition-colors hover:border-gold/[0.08] [color-scheme:dark]";

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <select value={parsed.hour ? String(parseInt(parsed.hour)) : ""} onChange={e => handleChange("hour", e.target.value)} className={`${selectClass} w-full`}>
          <option value="" className="bg-[#1e0c0c] text-white/30">ชั่วโมง</option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={String(i)} className="bg-[#1e0c0c]">{String(i).padStart(2, "0")} น.</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-[0.5rem] pointer-events-none">▼</span>
      </div>
      <div className="relative">
        <select value={parsed.minute ? String(parseInt(parsed.minute)) : ""} onChange={e => handleChange("minute", e.target.value)} className={`${selectClass} w-full`}>
          <option value="" className="bg-[#1e0c0c] text-white/30">นาที</option>
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={String(i)} className="bg-[#1e0c0c]">{String(i).padStart(2, "0")} นาที</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-[0.5rem] pointer-events-none">▼</span>
      </div>
    </div>
  );
}
