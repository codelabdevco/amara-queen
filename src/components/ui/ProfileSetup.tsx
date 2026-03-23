"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LaurelButton from "@/components/ui/LaurelButton";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";

interface ProfileData {
  nickname: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: string;
  phone: string;
  email: string;
  birthTime: string;
  relationshipStatus: string;
  occupation: string;
}

interface ZodiacInfo {
  western: { signTh: string; elementTh: string; sign: string };
  thai: { signTh: string };
  luckyNumber: number;
  age: number;
  birthDay: { nameTh: string; color: string; planetTh: string };
  personality: string;
  luckyColor: string;
  compatibility: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const GENDER_OPTIONS = [
  { value: "male", label: "ชาย", icon: "♂" },
  { value: "female", label: "หญิง", icon: "♀" },
  { value: "other", label: "อื่นๆ", icon: "⚥" },
];

const STATUS_OPTIONS = [
  { value: "single", label: "โสด" },
  { value: "taken", label: "มีคู่" },
  { value: "complicated", label: "ซับซ้อน" },
];

export default function ProfileSetup({ open, onClose, onSaved }: Props) {
  const [form, setForm] = useState<ProfileData>({
    nickname: "", firstName: "", lastName: "", birthdate: "", gender: "", phone: "", email: "", birthTime: "", relationshipStatus: "", occupation: "",
  });
  const [zodiac, setZodiac] = useState<ZodiacInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/auth/profile").then(r => r.json()).then(data => {
        if (data.profile) {
          setForm(data.profile);
          setZodiac(data.zodiac);
          // If already filled, show summary instead of form
          if (data.profile.birthdate) setShowSummary(true);
          else setShowSummary(false);
        } else {
          setShowSummary(false);
        }
      }).catch(() => {});
    }
  }, [open]);

  async function handleSave() {
    setError("");
    if (!form.nickname.trim()) { setError("กรุณากรอกชื่อเล่น"); return; }
    if (!form.birthdate || form.birthdate.includes("0000")) { setError("กรุณากรอกวันเกิดให้ครบ"); return; }
    if (!form.gender) { setError("กรุณาเลือกเพศ"); return; }
    if (form.phone && !/^0[0-9]{8,9}$/.test(form.phone.replace(/-/g, ""))) { setError("เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)"); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("อีเมลไม่ถูกต้อง"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setSaving(false); return; }
      setZodiac(data.zodiac);
      setShowSummary(true);
      onSaved?.();
    } catch {
      setError("เกิดข้อผิดพลาด");
    }
    setSaving(false);
  }

  function update(key: keyof ProfileData, value: string) {
    // Input sanitization
    if (key === "phone") {
      value = value.replace(/[^0-9-]/g, "").slice(0, 12);
    }
    if (key === "nickname" || key === "firstName" || key === "lastName") {
      value = value.replace(/[0-9]/g, "").slice(0, 50);
    }
    setForm(prev => ({ ...prev, [key]: value }));
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
        <motion.div
          className="relative rounded-lg p-5 w-full max-w-[380px] max-h-[85vh] overflow-y-auto"
          style={{ background: "linear-gradient(135deg, #2D0A0A, #3A0E0E)", border: "1px solid #8B7A4A15" }}
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            {showSummary ? (
              /* ── Summary Page ── */
              <motion.div key="summary" className="space-y-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-gold text-xl">&#10022;</span>
                  </div>
                  <h3 className="text-gold text-lg font-semibold">สวัสดี {form.nickname}</h3>
                  <p className="text-white/30 text-xs mt-1">นี่คือข้อมูลดวงชะตาของคุณ</p>
                </div>

                {zodiac && (
                  <>
                    {/* Main stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <InfoCard label="วันเกิด" value={`วัน${zodiac.birthDay.nameTh}`} sub={`สี${zodiac.birthDay.color}`} />
                      <InfoCard label="ราศี" value={zodiac.western.signTh} sub={zodiac.western.sign} />
                      <InfoCard label="อายุ" value={`${zodiac.age} ปี`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <InfoCard label="ธาตุ" value={zodiac.western.elementTh} />
                      <InfoCard label="ปีนักษัตร" value={zodiac.thai.signTh} />
                      <InfoCard label="เลขนำโชค" value={String(zodiac.luckyNumber)} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <InfoCard label="ดาวประจำวัน" value={zodiac.birthDay.planetTh} />
                      <InfoCard label="สีนำโชค" value={zodiac.luckyColor} />
                    </div>

                    {/* Personality */}
                    <div className="bg-[#1e0c0c] rounded-xl p-3.5">
                      <p className="text-gold/50 text-[0.6rem] uppercase tracking-wider mb-1.5">บุคลิกภาพ</p>
                      <p className="text-white/70 text-xs leading-5">{zodiac.personality}</p>
                    </div>

                    {/* Compatibility */}
                    <div className="bg-[#1e0c0c] rounded-xl p-3.5">
                      <p className="text-white/30 text-[0.6rem] uppercase tracking-wider mb-1.5">ราศีที่เข้ากันได้ดี</p>
                      <p className="text-gold/80 text-sm font-medium">{zodiac.compatibility}</p>
                    </div>
                  </>
                )}

                <LaurelButton variant="gold" onClick={onClose} className="w-full">เริ่มดูดวง</LaurelButton>

                <LaurelButton variant="crimson" onClick={() => setShowSummary(false)} className="w-full">แก้ไขข้อมูล</LaurelButton>
              </motion.div>
            ) : (
              /* ── Form Page (all fields) ── */
              <motion.div key="form" className="space-y-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                <div className="text-center">
                  <h3 className="text-gold text-lg font-semibold">กรอกข้อมูลของคุณ</h3>
                  <p className="text-gold/25 text-xs mt-1">เพื่อให้การทำนายตรงกับตัวคุณมากขึ้น</p>
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">ชื่อเล่น *</label>
                  <input type="text" placeholder="เช่น มายด์, เบส, แพร" value={form.nickname}
                    onChange={e => update("nickname", e.target.value)}
                    className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none border border-[#8B7A4A]/10 focus:border-[#8B7A4A]/25"
                    autoFocus
                  />
                </div>

                {/* First + Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">ชื่อจริง</label>
                    <input type="text" placeholder="ชื่อ" value={form.firstName}
                      onChange={e => update("firstName", e.target.value)}
                      className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none border border-[#8B7A4A]/10 focus:border-[#8B7A4A]/25"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">นามสกุล</label>
                    <input type="text" placeholder="นามสกุล" value={form.lastName}
                      onChange={e => update("lastName", e.target.value)}
                      className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none border border-[#8B7A4A]/10 focus:border-[#8B7A4A]/25"
                    />
                  </div>
                </div>

                {/* Birthdate */}
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">วันเกิด *</label>
                  <DatePicker value={form.birthdate} onChange={v => update("birthdate", v)} />
                </div>

                {/* Birth Time */}
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">เวลาเกิด</label>
                  <TimePicker value={form.birthTime} onChange={v => update("birthTime", v)} />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">เพศ *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDER_OPTIONS.map(g => (
                      <button key={g.value} type="button"
                        onClick={() => update("gender", g.value)}
                        className={`py-2 rounded-lg border text-sm transition-all ${
                          form.gender === g.value
                            ? "bg-[#3A0E0E] border-[#8B7A4A]/30 text-gold"
                            : "bg-[#1e0c0c] border-[#8B7A4A]/10 text-white/40 hover:border-[#8B7A4A]/20"
                        }`}
                      >
                        <span className="mr-1">{g.icon}</span> {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">เบอร์โทร</label>
                    <input type="tel" inputMode="numeric" placeholder="0812345678" value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                      className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none border border-[#8B7A4A]/10 focus:border-[#8B7A4A]/25 font-mono tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">อีเมล</label>
                    <input type="email" inputMode="email" placeholder="email@mail.com" value={form.email}
                      onChange={e => update("email", e.target.value.trim())}
                      className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none border border-[#8B7A4A]/10 focus:border-[#8B7A4A]/25"
                    />
                  </div>
                </div>

                {/* Relationship Status */}
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">สถานะความรัก</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button key={s.value} type="button"
                        onClick={() => update("relationshipStatus", form.relationshipStatus === s.value ? "" : s.value)}
                        className={`py-2 rounded-lg border text-xs transition-all ${
                          form.relationshipStatus === s.value
                            ? "bg-[#3A0E0E] border-[#8B7A4A]/30 text-gold"
                            : "bg-[#1e0c0c] border-[#8B7A4A]/10 text-white/40 hover:border-[#8B7A4A]/20"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">อาชีพ</label>
                  <input type="text" placeholder="เช่น พนักงานบริษัท, นักศึกษา" value={form.occupation}
                    onChange={e => update("occupation", e.target.value)}
                    className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none border border-[#8B7A4A]/10 focus:border-[#8B7A4A]/25"
                  />
                </div>

                <p className="text-white/15 text-[0.55rem] text-center leading-4">ข้อมูลของคุณจะถูกเก็บเป็นความลับ ใช้เพื่อการทำนายและติดต่อกลับเท่านั้น</p>

                {error && <p className="text-red-400/80 text-xs text-center">{error}</p>}

                <div className="flex gap-3">
                  <LaurelButton variant="crimson" onClick={onClose} className="flex-1">ข้าม</LaurelButton>
                  <LaurelButton variant="gold" onClick={handleSave} className="flex-1">{saving ? "..." : "ดูผลวิเคราะห์"}</LaurelButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#1e0c0c] rounded-xl p-2.5 text-center">
      <p className="text-gold/25 text-[0.55rem] uppercase tracking-wider">{label}</p>
      <p className="text-gold text-sm font-semibold mt-0.5">{value}</p>
      {sub && <p className="text-white/20 text-[0.55rem] mt-0.5">{sub}</p>}
    </div>
  );
}
