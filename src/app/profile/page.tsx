"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import ProfileSetup from "@/components/ui/ProfileSetup";
import LaurelButton from "@/components/ui/LaurelButton";
import { EASE } from "@/constants/animation";

interface ProfileData {
  profile: {
    nickname: string;
    firstName: string;
    lastName: string;
    birthdate: string;
    gender: string;
    phone: string;
    email: string;
    occupation: string;
  } | null;
  zodiac: {
    western: { signTh: string; elementTh: string; sign: string };
    thai: { signTh: string };
    luckyNumber: number;
    age: number;
    birthDay: { nameTh: string; color: string; planetTh: string };
    personality: string;
    luckyColor: string;
    compatibility: string;
  } | null;
  linePictureUrl: string | null;
  lineDisplayName: string | null;
  credits: number;
  totalReadings: number;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  function fetchProfile() {
    fetch("/api/auth/profile").then(r => r.ok ? r.json() : null).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { fetchProfile(); }, []);

  return (
    <AppShell>
      <motion.div
        className="flex flex-col min-h-full px-4 pt-3 pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* Header */}
        <motion.div className="text-center mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <h2
            className="text-base font-semibold tracking-[0.1em]"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer-text 4s ease-in-out infinite",
            }}
          >โปรไฟล์</h2>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center mt-10">
            <div className="w-4 h-4 border-2 border-[#8B7A4A]/30 border-t-[#d4af37] rounded-full animate-spin" />
          </div>
        ) : !data?.profile ? (
          <div className="text-center mt-10 space-y-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "#3A0E0E", border: "1px solid #8B7A4A30" }}>
              <span className="text-[#d4af37] text-3xl">♦</span>
            </div>
            <p className="text-[#8B7A4A]/50 text-sm">ยังไม่ได้เข้าสู่ระบบ</p>
            <LaurelButton variant="gold" href="/api/auth/line">เข้าสู่ระบบ</LaurelButton>
          </div>
        ) : (
          <>
            {/* Avatar + Name */}
            <motion.div
              className="flex items-center gap-4 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {data.linePictureUrl ? (
                <img src={data.linePictureUrl} alt="" className="w-14 h-14 rounded-full" style={{ border: "1.5px solid #8B7A4A30" }} />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#3A0E0E", border: "1.5px solid #8B7A4A30" }}>
                  <span className="text-[#E2D4A0] text-xl">{data.profile.nickname?.charAt(0) || "?"}</span>
                </div>
              )}
              <div>
                <p className="text-[#E2D4A0] text-base font-semibold">{data.profile.nickname}</p>
                {data.profile.firstName && <p className="text-[#8B7A4A]/50 text-xs">{data.profile.firstName} {data.profile.lastName}</p>}
                {data.zodiac && <p className="text-[#d4af37]/50 text-[0.65rem] mt-0.5">ราศี{data.zodiac.western.signTh} · วัน{data.zodiac.birthDay.nameTh}</p>}
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatBox label="ดูดวงแล้ว" value={String(data.totalReadings)} />
              <StatBox label="เครดิต" value={String(data.credits)} />
              <StatBox label="อายุ" value={data.zodiac ? `${data.zodiac.age} ปี` : "-"} />
            </div>

            {/* Zodiac Info */}
            {data.zodiac && (
              <motion.div className="space-y-2 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <p className="text-[#8B7A4A]/40 text-[0.6rem] uppercase tracking-[0.2em]">ข้อมูลดวงชะตา</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <InfoCard label="ราศี" value={data.zodiac.western.signTh} />
                  <InfoCard label="ธาตุ" value={data.zodiac.western.elementTh} />
                  <InfoCard label="นักษัตร" value={data.zodiac.thai.signTh} />
                  <InfoCard label="เลขนำโชค" value={String(data.zodiac.luckyNumber)} />
                  <InfoCard label="ดาว" value={data.zodiac.birthDay.planetTh} />
                  <InfoCard label="สีนำโชค" value={data.zodiac.luckyColor} />
                </div>

                <div className="bg-[#2a1215] rounded-lg p-3" style={{ border: "0.5px solid #8B7A4A10" }}>
                  <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-wider mb-1">บุคลิกภาพ</p>
                  <p className="text-[#E2D4A0]/50 text-[0.7rem] leading-5">{data.zodiac.personality}</p>
                </div>

                <div className="bg-[#2a1215] rounded-lg p-3" style={{ border: "0.5px solid #8B7A4A10" }}>
                  <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-wider mb-1">ราศีที่เข้ากัน</p>
                  <p className="text-[#d4af37]/60 text-xs font-medium">{data.zodiac.compatibility}</p>
                </div>
              </motion.div>
            )}

            {/* Contact Info */}
            <motion.div className="space-y-2 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
              <p className="text-[#8B7A4A]/40 text-[0.6rem] uppercase tracking-[0.2em]">ข้อมูลติดต่อ</p>
              <div className="bg-[#2a1215] rounded-lg p-3 space-y-2.5" style={{ border: "0.5px solid #8B7A4A10" }}>
                {data.profile.phone && <InfoRow label="เบอร์โทร" value={data.profile.phone} />}
                {data.profile.email && <InfoRow label="อีเมล" value={data.profile.email} />}
                {data.profile.occupation && <InfoRow label="อาชีพ" value={data.profile.occupation} />}
                {data.profile.gender && <InfoRow label="เพศ" value={data.profile.gender === "male" ? "ชาย" : data.profile.gender === "female" ? "หญิง" : "อื่นๆ"} />}
                {!data.profile.phone && !data.profile.email && !data.profile.occupation && (
                  <p className="text-[#8B7A4A]/30 text-xs">ยังไม่ได้กรอกข้อมูลติดต่อ</p>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <LaurelButton variant="crimson" onClick={() => setShowEdit(true)}>แก้ไขข้อมูล</LaurelButton>
              <LaurelButton variant="crimson" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}>ออกจากระบบ</LaurelButton>
            </div>

            <ProfileSetup open={showEdit} onClose={() => { setShowEdit(false); fetchProfile(); }} />
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#2a1215] rounded-lg p-2.5 text-center" style={{ border: "0.5px solid #8B7A4A10" }}>
      <p className="text-[#d4af37] text-lg font-semibold">{value}</p>
      <p className="text-[#8B7A4A]/40 text-[0.55rem]">{label}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#2a1215] rounded-lg p-2 text-center" style={{ border: "0.5px solid #8B7A4A10" }}>
      <p className="text-[#8B7A4A]/35 text-[0.5rem] uppercase tracking-wider">{label}</p>
      <p className="text-[#d4af37]/80 text-xs font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#8B7A4A]/40 text-[0.7rem]">{label}</span>
      <span className="text-[#E2D4A0]/60 text-[0.7rem]">{value}</span>
    </div>
  );
}
