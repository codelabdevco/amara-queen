"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface TimeSlot { start: string; end: string; }
interface Availability { dayOfWeek: number; slots: TimeSlot[]; }

interface Healer {
  id: string;
  name: string;
  title: string;
  pictureUrl: string;
  bio: string;
  specialties: string[];
  priceCredits: number;
  sessionMinutes: number;
  availability: Availability[];
  blockedDates: string[];
  rating: number;
  totalBookings: number;
  active: boolean;
  sortOrder: number;
  createdAt: number;
}

const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const SPECIALTIES_LIST = ["ไพ่ทาโร่", "ดวงชะตา", "เนื้อคู่", "การเงิน", "การงาน", "สุขภาพ", "ฮวงจุ้ย", "เลขศาสตร์", "ลายมือ", "ไพ่ยิปซี"];

const emptyHealer = (): Partial<Healer> => ({
  name: "", title: "อาจารย์", pictureUrl: "", bio: "", specialties: [],
  priceCredits: 10, sessionMinutes: 30, availability: [], blockedDates: [], active: true, sortOrder: 0,
});

export default function AdminHealersPage() {
  const router = useRouter();
  const [healers, setHealers] = useState<Healer[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Healer> | null>(null);
  const [saving, setSaving] = useState(false);

  function refresh() {
    fetch("/api/admin/healers")
      .then((r) => r.json())
      .then((d) => { setHealers(d.healers || []); setStats(d.stats || stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!editing?.name) return;
    setSaving(true);
    const method = editing.id ? "PUT" : "POST";
    await fetch("/api/admin/healers", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    setSaving(false);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("ยืนยันลบหมอดูนี้?")) return;
    await fetch("/api/admin/healers", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  }

  async function handleToggle(healer: Healer) {
    await fetch("/api/admin/healers", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: healer.id, active: !healer.active }),
    });
    refresh();
  }

  function toggleDay(day: number) {
    if (!editing) return;
    const avail = [...(editing.availability || [])];
    const idx = avail.findIndex((a) => a.dayOfWeek === day);
    if (idx >= 0) avail.splice(idx, 1);
    else avail.push({ dayOfWeek: day, slots: [{ start: "09:00", end: "17:00" }] });
    setEditing({ ...editing, availability: avail });
  }

  function updateSlot(day: number, slotIdx: number, field: "start" | "end", val: string) {
    if (!editing) return;
    const avail = [...(editing.availability || [])];
    const dayAvail = avail.find((a) => a.dayOfWeek === day);
    if (!dayAvail) return;
    dayAvail.slots[slotIdx][field] = val;
    setEditing({ ...editing, availability: avail });
  }

  function addSlot(day: number) {
    if (!editing) return;
    const avail = [...(editing.availability || [])];
    const dayAvail = avail.find((a) => a.dayOfWeek === day);
    if (!dayAvail) return;
    dayAvail.slots.push({ start: "13:00", end: "17:00" });
    setEditing({ ...editing, availability: avail });
  }

  function removeSlot(day: number, slotIdx: number) {
    if (!editing) return;
    const avail = [...(editing.availability || [])];
    const dayAvail = avail.find((a) => a.dayOfWeek === day);
    if (!dayAvail) return;
    dayAvail.slots.splice(slotIdx, 1);
    setEditing({ ...editing, availability: avail });
  }

  function toggleSpecialty(spec: string) {
    if (!editing) return;
    const specs = [...(editing.specialties || [])];
    const idx = specs.indexOf(spec);
    if (idx >= 0) specs.splice(idx, 1);
    else specs.push(spec);
    setEditing({ ...editing, specialties: specs });
  }

  const cardClass = "rounded-xl p-4 border border-white/[0.04]";
  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-[#d4af37]/40";
  const goldBtn = "px-4 py-2 rounded-lg text-sm font-medium bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 transition-colors";

  // Edit modal
  if (editing) {
    return (
      <div className="min-h-screen text-white/80" style={{ background: "#0a0a0a" }}>
        <AdminNav />
        <main className="ml-56 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white/90">
              {editing.id ? "แก้ไขหมอดู" : "เพิ่มหมอดูใหม่"}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={saving} className={goldBtn}>
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Basic Info */}
            <div className="space-y-4">
              <div className={`${cardClass} bg-white/[0.02] space-y-4`}>
                <h3 className="text-sm font-medium text-[#d4af37]/80">ข้อมูลพื้นฐาน</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">ชื่อ *</label>
                    <input className={inputClass} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="ชื่อหมอดู" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">ตำแหน่ง</label>
                    <input className={inputClass} value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="อาจารย์" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">รูปภาพ URL</label>
                  <input className={inputClass} value={editing.pictureUrl || ""} onChange={(e) => setEditing({ ...editing, pictureUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">แนะนำตัว</label>
                  <textarea className={`${inputClass} h-24 resize-none`} value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} placeholder="ประวัติย่อ..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">ราคา (เครดิต)</label>
                    <input type="number" className={inputClass} value={editing.priceCredits || 10} onChange={(e) => setEditing({ ...editing, priceCredits: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">นาที/รอบ</label>
                    <input type="number" className={inputClass} value={editing.sessionMinutes || 30} onChange={(e) => setEditing({ ...editing, sessionMinutes: parseInt(e.target.value) || 30 })} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">ลำดับ</label>
                    <input type="number" className={inputClass} value={editing.sortOrder || 0} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className={`${cardClass} bg-white/[0.02] space-y-3`}>
                <h3 className="text-sm font-medium text-[#d4af37]/80">ความเชี่ยวชาญ</h3>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES_LIST.map((s) => (
                    <button key={s} onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        editing.specialties?.includes(s) ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30" : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60"
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Availability */}
            <div className={`${cardClass} bg-white/[0.02] space-y-3`}>
              <h3 className="text-sm font-medium text-[#d4af37]/80">ตารางเวลา</h3>
              <div className="space-y-2">
                {DAYS.map((dayName, dayIdx) => {
                  const dayAvail = editing.availability?.find((a) => a.dayOfWeek === dayIdx);
                  return (
                    <div key={dayIdx} className="border border-white/[0.04] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={!!dayAvail} onChange={() => toggleDay(dayIdx)}
                            className="accent-[#d4af37] w-4 h-4" />
                          <span className={`text-sm ${dayAvail ? "text-white/80" : "text-white/30"}`}>{dayName}</span>
                        </label>
                        {dayAvail && (
                          <button onClick={() => addSlot(dayIdx)} className="text-xs text-[#d4af37]/60 hover:text-[#d4af37]">+ เพิ่มช่วง</button>
                        )}
                      </div>
                      {dayAvail?.slots.map((slot, si) => (
                        <div key={si} className="flex items-center gap-2 ml-6 mb-1">
                          <input type="time" className={`${inputClass} !w-28 !py-1`} value={slot.start} onChange={(e) => updateSlot(dayIdx, si, "start", e.target.value)} />
                          <span className="text-white/20">—</span>
                          <input type="time" className={`${inputClass} !w-28 !py-1`} value={slot.end} onChange={(e) => updateSlot(dayIdx, si, "end", e.target.value)} />
                          {dayAvail.slots.length > 1 && (
                            <button onClick={() => removeSlot(dayIdx, si)} className="text-red-400/40 hover:text-red-400/80 text-xs">ลบ</button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen text-white/80" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white/90">จัดการหมอดู</h2>
          <button onClick={() => setEditing(emptyHealer())} className={goldBtn}>+ เพิ่มหมอดู</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "หมอดูทั้งหมด", value: stats.total, color: "#d4af37" },
            { label: "เปิดให้บริการ", value: stats.active, color: "#22c55e" },
            { label: "จองทั้งหมด", value: stats.totalBookings, color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className={`${cardClass} bg-white/[0.02]`}>
              <p className="text-xs text-white/40 mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-white/30 py-20">กำลังโหลด...</p>
        ) : healers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 mb-4">ยังไม่มีหมอดูในระบบ</p>
            <button onClick={() => setEditing(emptyHealer())} className={goldBtn}>+ เพิ่มหมอดูคนแรก</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healers.map((h) => (
              <div key={h.id} className={`${cardClass} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                    {h.pictureUrl ? (
                      <img src={h.pictureUrl} alt={h.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20">🔮</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white/90">{h.title} {h.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${h.active ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                        {h.active ? "เปิด" : "ปิด"}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-2 line-clamp-2">{h.bio || "ไม่มีคำแนะนำตัว"}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {h.specialties.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-[#d4af37]/10 text-[#d4af37]/70">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>{h.priceCredits} เครดิต/{h.sessionMinutes} นาที</span>
                      <span>จองแล้ว {h.totalBookings} ครั้ง</span>
                      <span>{h.availability.length} วัน/สัปดาห์</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                  <button onClick={() => handleToggle(h)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    {h.active ? "ปิดบริการ" : "เปิดบริการ"}
                  </button>
                  <button onClick={() => setEditing(h)} className="text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors">แก้ไข</button>
                  <button onClick={() => handleDelete(h.id)} className="text-xs text-red-400/40 hover:text-red-400/80 transition-colors">ลบ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
