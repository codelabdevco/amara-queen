"use client";

import { useMemo } from "react";

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
}

export default function DatePicker({ value, onChange }: Props) {
  const parsed = useMemo(() => {
    if (!value) return { day: "", month: "", year: "" };
    const [y, m, d] = value.split("-");
    return { day: d || "", month: m || "", year: y || "" };
  }, [value]);

  function handleChange(part: "day" | "month" | "year", val: string) {
    const next = { ...parsed, [part]: val };
    if (next.year && next.month && next.day) {
      onChange(`${next.year}-${next.month.padStart(2, "0")}-${next.day.padStart(2, "0")}`);
    } else if (!next.year && !next.month && !next.day) {
      onChange("");
    } else {
      // Partial — store what we have
      const y = next.year || "0000";
      const m = (next.month || "01").padStart(2, "0");
      const d = (next.day || "01").padStart(2, "0");
      onChange(`${y}-${m}-${d}`);
    }
  }

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= currentYear - 100; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const daysInMonth = useMemo(() => {
    const m = parseInt(parsed.month) || 1;
    const y = parseInt(parsed.year) || currentYear;
    return new Date(y, m, 0).getDate();
  }, [parsed.month, parsed.year, currentYear]);

  const selectClass = "bg-[#1e0c0c] border border-[#8B7A4A]/10 rounded-lg px-2 py-2.5 text-sm outline-none cursor-pointer transition-colors focus:border-[#8B7A4A]/25";
  const selectStyle = { color: "#E2D4A0", WebkitTextFillColor: "#E2D4A0" } as React.CSSProperties;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="relative">
        <select value={parsed.day ? String(parseInt(parsed.day)) : ""} onChange={e => handleChange("day", e.target.value)} className={`${selectClass} w-full`} style={selectStyle}>
          <option value="" className="bg-[#1e0c0c] text-white/30">วัน</option>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
            <option key={d} value={String(d)} className="bg-[#1e0c0c]">{d}</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-[0.5rem] pointer-events-none">▼</span>
      </div>
      <div className="relative">
        <select value={parsed.month ? String(parseInt(parsed.month)) : ""} onChange={e => handleChange("month", e.target.value)} className={`${selectClass} w-full`} style={selectStyle}>
          <option value="" className="bg-[#1e0c0c] text-white/30">เดือน</option>
          {MONTHS.map((m, i) => (
            <option key={i} value={String(i + 1)} className="bg-[#1e0c0c]">{m}</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-[0.5rem] pointer-events-none">▼</span>
      </div>
      <div className="relative">
        <select value={parsed.year ? String(parseInt(parsed.year)) : ""} onChange={e => handleChange("year", e.target.value)} className={`${selectClass} w-full`} style={selectStyle}>
          <option value="" className="bg-[#1e0c0c] text-white/30">ปี</option>
          {years.map(y => (
            <option key={y} value={String(y)} className="bg-[#1e0c0c]">{y + 543} ({y})</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-[0.5rem] pointer-events-none">▼</span>
      </div>
    </div>
  );
}
