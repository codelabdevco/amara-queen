"use client";

import { useState, useEffect } from "react";

interface ZodiacData {
  western: { signTh: string; elementTh: string };
  thai: { signTh: string };
  luckyNumber: number;
  age: number;
  birthDay: { nameTh: string };
}

interface Props {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export default function PersonalDataBadge({ enabled, onToggle }: Props) {
  const [zodiac, setZodiac] = useState<ZodiacData | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.zodiac) { setZodiac(d.zodiac); setNickname(d.profile?.nickname || ""); }
    }).catch(() => {});
  }, []);

  if (!zodiac) return null;

  return (
    <div className="w-full max-w-[300px] mx-auto rounded-lg p-2.5"
      style={{ background: enabled ? "#3A0E0E" : "#1e0c0c", border: `0.5px solid ${enabled ? "#8B7A4A20" : "#8B7A4A08"}`, transition: "all 0.3s" }}
    >
      <button onClick={() => onToggle(!enabled)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded flex items-center justify-center text-[0.5rem]"
            style={{ background: enabled ? "#d4af37" : "#8B7A4A30", color: enabled ? "#1e0c0c" : "#8B7A4A", transition: "all 0.3s" }}
          >
            {enabled ? "✓" : ""}
          </div>
          <span className="text-[#E2D4A0]/60 text-[0.65rem]">ใช้ข้อมูลส่วนตัวร่วมวิเคราะห์</span>
        </div>
        <span className={`text-[0.5rem] ${enabled ? "text-[#d4af37]/50" : "text-[#8B7A4A]/30"}`}>{enabled ? "เปิด" : "ปิด"}</span>
      </button>

      {enabled && (
        <div className="mt-2 pt-2 flex flex-wrap gap-x-3 gap-y-0.5" style={{ borderTop: "0.5px solid #8B7A4A10" }}>
          {nickname && <span className="text-[#E2D4A0]/40 text-[0.55rem]">{nickname}</span>}
          <span className="text-[#d4af37]/40 text-[0.55rem]">ราศี{zodiac.western.signTh}</span>
          <span className="text-[#d4af37]/40 text-[0.55rem]">ธาตุ{zodiac.western.elementTh}</span>
          <span className="text-[#d4af37]/40 text-[0.55rem]">ปี{zodiac.thai.signTh}</span>
          <span className="text-[#d4af37]/40 text-[0.55rem]">เลข {zodiac.luckyNumber}</span>
          <span className="text-[#d4af37]/40 text-[0.55rem]">อายุ {zodiac.age}</span>
          <span className="text-[#d4af37]/40 text-[0.55rem]">วัน{zodiac.birthDay.nameTh}</span>
        </div>
      )}
    </div>
  );
}
