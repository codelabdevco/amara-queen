"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  western: { signTh: string; elementTh: string };
  thai: { signTh: string };
  luckyNumber: number;
  age: number;
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
  const [step, setStep] = useState(0); // 0: required, 1: optional, 2: done

  useEffect(() => {
    if (open) {
      fetch("/api/auth/profile").then(r => r.json()).then(data => {
        if (data.profile) {
          setForm(data.profile);
          setZodiac(data.zodiac);
        }
      }).catch(() => {});
    }
  }, [open]);

  async function handleSave() {
    setError("");
    if (!form.nickname.trim()) { setError("กรุณากรอกชื่อเล่น"); return; }
    if (!form.birthdate) { setError("กรุณากรอกวันเกิด"); return; }
    if (!form.gender) { setError("กรุณาเลือกเพศ"); return; }

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
      setStep(2);
      onSaved?.();
    } catch {
      setError("เกิดข้อผิดพลาด");
    }
    setSaving(false);
  }

  function update(key: keyof ProfileData, value: string) {
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
          className="relative bg-[#0c0d14] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[380px] max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        >
          {step === 2 ? (
            /* Success screen with zodiac info */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
                <span className="text-gold text-2xl">&#10022;</span>
              </div>
              <div>
                <h3 className="text-gold text-lg font-semibold">สวัสดี {form.nickname}</h3>
                <p className="text-white/30 text-xs mt-1">ข้อมูลของคุณถูกบันทึกแล้ว</p>
              </div>

              {zodiac && (
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-[#08090e] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">ราศี</p>
                    <p className="text-gold text-sm font-semibold mt-1">{zodiac.western.signTh}</p>
                  </div>
                  <div className="bg-[#08090e] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">ธาตุ</p>
                    <p className="text-gold text-sm font-semibold mt-1">{zodiac.western.elementTh}</p>
                  </div>
                  <div className="bg-[#08090e] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">ปีนักษัตร</p>
                    <p className="text-gold text-sm font-semibold mt-1">{zodiac.thai.signTh}</p>
                  </div>
                  <div className="bg-[#08090e] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">เลขนำโชค</p>
                    <p className="text-gold text-sm font-semibold mt-1">{zodiac.luckyNumber}</p>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-sm font-medium hover:bg-gold/20 transition-colors"
              >
                เริ่มดูดวง
              </button>
            </div>
          ) : (
            /* Form */
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-gold text-lg font-semibold">
                  {step === 0 ? "กรอกข้อมูลของคุณ" : "ข้อมูลเพิ่มเติม"}
                </h3>
                <p className="text-white/25 text-xs mt-1">
                  {step === 0 ? "เพื่อให้การทำนายตรงกับตัวคุณมากขึ้น" : "ไม่จำเป็นต้องกรอก แต่ช่วยให้ทำนายแม่นขึ้น"}
                </p>
              </div>

              {step === 0 && (
                <>
                  {/* Nickname */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">ชื่อเล่น *</label>
                    <input
                      type="text" placeholder="เช่น มายด์, เบส, แพร" value={form.nickname}
                      onChange={e => update("nickname", e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Birthdate */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">วันเกิด *</label>
                    <input
                      type="date" value={form.birthdate}
                      onChange={e => update("birthdate", e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-gold/30 outline-none [color-scheme:dark]"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">เพศ *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {GENDER_OPTIONS.map(g => (
                        <button key={g.value}
                          onClick={() => update("gender", g.value)}
                          className={`py-2.5 rounded-lg border text-sm transition-all ${
                            form.gender === g.value
                              ? "bg-gold/10 border-gold/30 text-gold"
                              : "bg-[#08090e] border-white/[0.06] text-white/40 hover:border-white/10"
                          }`}
                        >
                          <span className="mr-1">{g.icon}</span> {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/[0.06] text-white/30 text-sm hover:text-white/50">
                      ข้าม
                    </button>
                    <button onClick={() => setStep(1)}
                      disabled={!form.nickname || !form.birthdate || !form.gender}
                      className="flex-1 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-30"
                    >
                      ถัดไป
                    </button>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  {/* First + Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">ชื่อจริง</label>
                      <input
                        type="text" placeholder="ชื่อ" value={form.firstName}
                        onChange={e => update("firstName", e.target.value)}
                        className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">นามสกุล</label>
                      <input
                        type="text" placeholder="นามสกุล" value={form.lastName}
                        onChange={e => update("lastName", e.target.value)}
                        className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone + Email */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">เบอร์โทร</label>
                    <input
                      type="tel" placeholder="08X-XXX-XXXX" value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">อีเมล</label>
                    <input
                      type="email" placeholder="example@mail.com" value={form.email}
                      onChange={e => update("email", e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                    />
                  </div>

                  {/* Birth Time */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">เวลาเกิด</label>
                    <input
                      type="time" value={form.birthTime}
                      onChange={e => update("birthTime", e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-gold/30 outline-none [color-scheme:dark]"
                    />
                    <p className="text-white/15 text-[0.6rem] mt-1">ช่วยคำนวณลัคนาราศี</p>
                  </div>

                  {/* Relationship Status */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">สถานะความรัก</label>
                    <div className="grid grid-cols-3 gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button key={s.value}
                          onClick={() => update("relationshipStatus", form.relationshipStatus === s.value ? "" : s.value)}
                          className={`py-2 rounded-lg border text-xs transition-all ${
                            form.relationshipStatus === s.value
                              ? "bg-gold/10 border-gold/30 text-gold"
                              : "bg-[#08090e] border-white/[0.06] text-white/40 hover:border-white/10"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">อาชีพ/สายงาน</label>
                    <input
                      type="text" placeholder="เช่น พนักงานบริษัท, นักศึกษา, ฟรีแลนซ์" value={form.occupation}
                      onChange={e => update("occupation", e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                    />
                  </div>

                  <p className="text-white/15 text-[0.55rem] text-center leading-4">ข้อมูลของคุณจะถูกเก็บเป็นความลับ ใช้เพื่อการทำนายและติดต่อกลับเท่านั้น</p>

                  {error && <p className="text-red-400/80 text-xs text-center">{error}</p>}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-lg border border-white/[0.06] text-white/30 text-sm hover:text-white/50">
                      ย้อนกลับ
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-30"
                    >
                      {saving ? "..." : "บันทึก"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
