"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface UserProfile {
  nickname: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: string;
  phone: string;
  email: string;
  birthTime?: string;
  relationshipStatus?: string;
  occupation?: string;
}

interface User {
  id: string;
  username: string;
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
  profile?: UserProfile;
  credits: number;
  createdAt: number;
  readingsToday: number;
  lastFreeMonth?: string;
  banned?: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  function refreshUsers() {
    fetch("/api/admin/users").then(r => r.json()).then(d => { if (d) setUsers(d.users ?? []); }).catch(() => {});
  }

  async function handleAddCredits(userId: string) {
    const amount = parseInt(creditAmount);
    if (!amount) return;
    setActionLoading(true);
    await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, action: "addCredits", amount }) });
    setCreditAmount("");
    refreshUsers();
    setActionLoading(false);
  }

  async function handleBan(userId: string, ban: boolean) {
    if (!confirm(ban ? "ยืนยันระงับบัญชีผู้ใช้นี้?" : "ยืนยันปลดระงับบัญชี?")) return;
    setActionLoading(true);
    await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, action: ban ? "ban" : "unban" }) });
    refreshUsers();
    setActionLoading(false);
  }

  async function handleDelete(userId: string) {
    if (!confirm("ยืนยันลบผู้ใช้นี้? ข้อมูลจะหายถาวร")) return;
    setActionLoading(true);
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    setExpanded(null);
    refreshUsers();
    setActionLoading(false);
  }

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setUsers(data.users ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  const totalCredits = users.reduce((s, u) => s + (u.credits || 0), 0);
  const withProfile = users.filter(u => u.profile?.birthdate).length;
  const lineUsers = users.filter(u => u.lineDisplayName).length;

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">ผู้ใช้</h2>
          <span className="text-white/30 text-sm">{users.length} คน</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">ผู้ใช้ทั้งหมด</p>
            <p className="text-[#d4af37] text-xl font-semibold mt-1">{users.length}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">LINE Login</p>
            <p className="text-green-400 text-xl font-semibold mt-1">{lineUsers}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">กรอกโปรไฟล์</p>
            <p className="text-[#d4af37] text-xl font-semibold mt-1">{withProfile}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">เครดิตรวม</p>
            <p className="text-[#d4af37] text-xl font-semibold mt-1">{totalCredits}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#111111] rounded-xl p-10 text-center text-white/20 text-sm">ยังไม่มีผู้ใช้</div>
        ) : (
          <div className="bg-[#111111] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 text-xs text-white/30 uppercase tracking-wider">
              <span>ผู้ใช้</span>
              <span>สร้างเมื่อ</span>
              <span className="text-center">เครดิต</span>
              <span className="text-center">ใช้วันนี้</span>
              <span className="text-center">โปรไฟล์</span>
            </div>

            {users.map((u) => (
              <div key={u.id}>
                <button
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 text-sm hover:bg-gold/[0.02] transition-colors items-center w-full text-left"
                  onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                >
                  <div className="flex items-center gap-2">
                    {u.linePictureUrl ? (
                      <img src={u.linePictureUrl} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-[#d4af37]/50 text-xs">
                        {(u.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-white/70">{u.username || "-"}</p>
                        {u.banned && <span className="text-[0.5rem] text-red-400/70 bg-red-400/10 px-1.5 py-0.5 rounded">ระงับ</span>}
                      </div>
                      {u.lineDisplayName && <p className="text-green-400/50 text-[0.6rem]">LINE: {u.lineDisplayName}</p>}
                    </div>
                  </div>
                  <span className="text-white/40 text-xs">{formatDate(u.createdAt)}</span>
                  <span className="text-center">
                    <span className="inline-block bg-gold/10 text-[#d4af37] text-xs font-mono px-2 py-0.5 rounded">{u.credits || 0}</span>
                  </span>
                  <span className="text-center text-white/40 text-xs">{u.readingsToday}</span>
                  <span className="text-center">
                    {u.profile?.birthdate ? (
                      <span className="inline-block bg-green-500/10 text-green-400 text-[0.6rem] px-2 py-0.5 rounded">ครบ</span>
                    ) : (
                      <span className="inline-block bg-gold/5 text-white/20 text-[0.6rem] px-2 py-0.5 rounded">ไม่มี</span>
                    )}
                  </span>
                </button>

                {/* Expanded profile details */}
                {expanded === u.id && (
                  <div className="px-5 py-5 bg-[#0a0a0a]">
                    <div className="flex gap-5">
                      {/* Left: Avatar */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        {u.linePictureUrl ? (
                          <img src={u.linePictureUrl} alt="" className="w-20 h-20 rounded-full" style={{ border: "2px solid #ffffff08" }} />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-[#111111] flex items-center justify-center text-[#d4af37]/30 text-2xl" style={{ border: "2px solid #ffffff08" }}>
                            {(u.username || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[#d4af37] text-xs font-mono">{u.credits || 0} เครดิต</span>
                      </div>

                      {/* Right: Details */}
                      <div className="flex-1 space-y-3">
                        {/* LINE */}
                        <div className="rounded-lg p-3" style={{ background: "#111111" }}>
                          <p className="text-white/20 text-[0.55rem] uppercase tracking-wider mb-2">LINE</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <Info label="ชื่อ LINE" value={u.lineDisplayName || "-"} />
                            <Info label="LINE ID" value={u.lineUserId ? u.lineUserId.slice(0, 12) + "..." : "-"} />
                          </div>
                        </div>

                        {/* Profile */}
                        {u.profile && (
                          <div className="rounded-lg p-3" style={{ background: "#111111" }}>
                            <p className="text-white/20 text-[0.55rem] uppercase tracking-wider mb-2">ข้อมูลส่วนตัว</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <Info label="ชื่อเล่น" value={u.profile.nickname || "-"} />
                              <Info label="ชื่อจริง" value={u.profile.firstName ? `${u.profile.firstName} ${u.profile.lastName || ""}` : "-"} />
                              <Info label="เพศ" value={u.profile.gender === "male" ? "ชาย" : u.profile.gender === "female" ? "หญิง" : u.profile.gender === "other" ? "อื่นๆ" : "-"} />
                              <Info label="วันเกิด" value={u.profile.birthdate || "-"} />
                              <Info label="เวลาเกิด" value={u.profile.birthTime || "-"} />
                              <Info label="สถานะ" value={u.profile.relationshipStatus === "single" ? "โสด" : u.profile.relationshipStatus === "taken" ? "มีคู่" : u.profile.relationshipStatus === "complicated" ? "ซับซ้อน" : "-"} />
                            </div>
                          </div>
                        )}

                        {/* Contact */}
                        {u.profile && (u.profile.phone || u.profile.email || u.profile.occupation) && (
                          <div className="rounded-lg p-3" style={{ background: "#111111" }}>
                            <p className="text-white/20 text-[0.55rem] uppercase tracking-wider mb-2">ข้อมูลติดต่อ</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <Info label="เบอร์โทร" value={u.profile.phone || "-"} />
                              <Info label="อีเมล" value={u.profile.email || "-"} />
                              <Info label="อาชีพ" value={u.profile.occupation || "-"} />
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="rounded-lg p-3" style={{ background: "#111111" }}>
                          <p className="text-white/20 text-[0.55rem] uppercase tracking-wider mb-2">สถิติ</p>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <Info label="เครดิต" value={String(u.credits || 0)} />
                            <Info label="ใช้วันนี้" value={String(u.readingsToday || 0)} />
                            <Info label="ฟรีเดือน" value={u.lastFreeMonth || "-"} />
                            <Info label="สมัครเมื่อ" value={formatDate(u.createdAt)} />
                          </div>
                        </div>

                        {!u.profile && !u.lineDisplayName && (
                          <p className="text-white/20 text-xs">ยังไม่มีข้อมูลเพิ่มเติม</p>
                        )}

                        {/* Actions */}
                        <div className="rounded-lg p-3 space-y-3" style={{ background: "#111111" }}>
                          <p className="text-white/20 text-[0.55rem] uppercase tracking-wider">จัดการ</p>

                          {/* Add credits */}
                          <div className="flex items-center gap-2">
                            <input type="number" placeholder="จำนวนเครดิต" value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                              className="flex-1 rounded px-3 py-1.5 text-xs text-white/80 placeholder:text-white/20 outline-none"
                              style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}
                            />
                            <button disabled={actionLoading || !creditAmount} onClick={() => handleAddCredits(u.id)}
                              className="px-3 py-1.5 rounded text-xs font-medium disabled:opacity-30 transition-colors"
                              style={{ background: "#d4af37", color: "#0a0a0a" }}
                            >เพิ่มเครดิต</button>
                          </div>

                          {/* Ban / Delete */}
                          <div className="flex gap-2">
                            {u.banned ? (
                              <button onClick={() => handleBan(u.id, false)} disabled={actionLoading}
                                className="flex-1 px-3 py-1.5 rounded text-xs text-green-400/70 hover:text-green-400 transition-colors disabled:opacity-30"
                                style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}
                              >ปลดระงับ</button>
                            ) : (
                              <button onClick={() => handleBan(u.id, true)} disabled={actionLoading}
                                className="flex-1 px-3 py-1.5 rounded text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors disabled:opacity-30"
                                style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}
                              >ระงับบัญชี</button>
                            )}
                            <button onClick={() => handleDelete(u.id)} disabled={actionLoading}
                              className="px-3 py-1.5 rounded text-xs text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30"
                              style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}
                            >ลบผู้ใช้</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#d4af37]/25 text-[0.6rem] uppercase tracking-wider">{label}</p>
      <p className="text-white/60 mt-0.5">{value}</p>
    </div>
  );
}
