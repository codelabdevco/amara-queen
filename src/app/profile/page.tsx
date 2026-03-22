"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import ProfileSetup from "@/components/ui/ProfileSetup";
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
        <h2 className="text-lg text-gold font-semibold tracking-wide mb-4">โปรไฟล์</h2>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30 mt-10 justify-center">
            <div className="w-4 h-4 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
          </div>
        ) : !data?.profile ? (
          <div className="text-center mt-10 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
              <span className="text-gold text-3xl">♦</span>
            </div>
            <p className="text-white/40 text-sm">ยังไม่ได้เข้าสู่ระบบ</p>
            <a href="/api/auth/line" className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold" style={{ background: "#06C755", color: "#fff" }}>
              เข้าสู่ระบบด้วย LINE
            </a>
          </div>
        ) : (
          <>
            {/* Avatar + Name */}
            <motion.div
              className="flex items-center gap-4 mb-5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {data.linePictureUrl ? (
                <img src={data.linePictureUrl} alt="" className="w-16 h-16 rounded-full border-2 border-gold/[0.05]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/[0.05] flex items-center justify-center">
                  <span className="text-gold text-2xl">{data.profile.nickname?.charAt(0) || "?"}</span>
                </div>
              )}
              <div>
                <p className="text-white text-lg font-semibold">{data.profile.nickname}</p>
                {data.profile.firstName && <p className="text-white/40 text-sm">{data.profile.firstName} {data.profile.lastName}</p>}
                {data.zodiac && <p className="text-gold/60 text-xs mt-0.5">ราศี{data.zodiac.western.signTh} · วัน{data.zodiac.birthDay.nameTh}</p>}
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <StatBox label="ดูดวงแล้ว" value={String(data.totalReadings)} />
              <StatBox label="เครดิต" value={String(data.credits)} />
              <StatBox label="อายุ" value={data.zodiac ? `${data.zodiac.age} ปี` : "-"} />
            </div>

            {/* Zodiac Info */}
            {data.zodiac && (
              <motion.div
                className="space-y-2 mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <p className="text-white/30 text-[0.65rem] uppercase tracking-wider">ข้อมูลดวงชะตา</p>
                <div className="grid grid-cols-2 gap-2">
                  <InfoCard label="ราศี" value={data.zodiac.western.signTh} sub={data.zodiac.western.sign} />
                  <InfoCard label="ธาตุ" value={data.zodiac.western.elementTh} />
                  <InfoCard label="ปีนักษัตร" value={data.zodiac.thai.signTh} />
                  <InfoCard label="เลขนำโชค" value={String(data.zodiac.luckyNumber)} />
                  <InfoCard label="ดาวประจำวัน" value={data.zodiac.birthDay.planetTh} />
                  <InfoCard label="สีนำโชค" value={data.zodiac.luckyColor} />
                </div>

                <div className="bg-[#2a1215] rounded-xl p-3.5">
                  <p className="text-gold/50 text-[0.6rem] uppercase tracking-wider mb-1.5">บุคลิกภาพ</p>
                  <p className="text-white/60 text-xs leading-5">{data.zodiac.personality}</p>
                </div>

                <div className="bg-[#2a1215] rounded-xl p-3.5">
                  <p className="text-white/30 text-[0.6rem] uppercase tracking-wider mb-1.5">ราศีที่เข้ากัน</p>
                  <p className="text-gold/70 text-sm font-medium">{data.zodiac.compatibility}</p>
                </div>
              </motion.div>
            )}

            {/* Contact Info */}
            <motion.div
              className="space-y-2 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-white/30 text-[0.65rem] uppercase tracking-wider">ข้อมูลติดต่อ</p>
              <div className="bg-[#2a1215] rounded-xl p-4 space-y-3">
                {data.profile.phone && <InfoRow label="เบอร์โทร" value={data.profile.phone} />}
                {data.profile.email && <InfoRow label="อีเมล" value={data.profile.email} />}
                {data.profile.occupation && <InfoRow label="อาชีพ" value={data.profile.occupation} />}
                {data.profile.gender && <InfoRow label="เพศ" value={data.profile.gender === "male" ? "ชาย" : data.profile.gender === "female" ? "หญิง" : "อื่นๆ"} />}
                {!data.profile.phone && !data.profile.email && !data.profile.occupation && (
                  <p className="text-white/20 text-xs">ยังไม่ได้กรอกข้อมูลติดต่อ</p>
                )}
              </div>
            </motion.div>

            {/* Edit + Logout */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(true)}
                className="flex-1 py-2.5 rounded-xl bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
              >
                แก้ไขข้อมูล
              </button>
              <button
                onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
                className="px-5 py-2.5 rounded-xl bg-red-500/5 text-red-400/50 border border-red-500/10 text-sm hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                ออก
              </button>
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
    <div className="bg-[#2a1215] rounded-xl p-3 text-center">
      <p className="text-gold text-xl font-semibold">{value}</p>
      <p className="text-gold/25 text-[0.6rem] mt-0.5">{label}</p>
    </div>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#2a1215] rounded-xl p-2.5 text-center">
      <p className="text-gold/25 text-[0.55rem] uppercase tracking-wider">{label}</p>
      <p className="text-gold text-sm font-semibold mt-0.5">{value}</p>
      {sub && <p className="text-white/20 text-[0.55rem] mt-0.5">{sub}</p>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/30 text-xs">{label}</span>
      <span className="text-white/60 text-xs">{value}</span>
    </div>
  );
}
