"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  function refreshUsers() {
    fetch("/api/admin/users?limit=9999").then(r => r.json()).then(d => { if (d) setUsers(d.users ?? []); }).catch(() => {});
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
    fetch("/api/admin/users?limit=9999")
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setUsers(data.users ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.lineDisplayName?.toLowerCase().includes(q) ||
      u.profile?.nickname?.toLowerCase().includes(q) ||
      u.profile?.firstName?.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paged = filtered.slice((page - 1) * limit, page * limit);

  useEffect(() => { setPage(1); }, [search]);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  const totalCredits = users.reduce((s, u) => s + (u.credits || 0), 0);
  const withProfile = users.filter(u => u.profile?.birthdate).length;
  const lineUsers = users.filter(u => u.lineDisplayName).length;
  const bannedCount = users.filter(u => u.banned).length;

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">ผู้ใช้</h2>
            <p className="text-white/30 text-sm mt-1">{users.length} คน</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">ผู้ใช้ทั้งหมด</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">{users.length}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">LINE Login</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{lineUsers}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">กรอกโปรไฟล์</p>
            <p className="text-2xl font-bold text-white mt-1">{withProfile}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">เครดิตรวม</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">{totalCredits}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">ถูกระงับ</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{bannedCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, LINE, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/30 w-64"
          />
          {search && (
            <span className="text-white/30 text-xs">พบ {filtered.length} คน</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : paged.length === 0 ? (
          <div className="bg-[#111111] rounded-xl p-10 text-center text-white/20 text-sm">
            {search ? "ไม่พบผู้ใช้" : "ยังไม่มีผู้ใช้"}
          </div>
        ) : (
          <>
            <div className="bg-[#111111] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                <span>ผู้ใช้</span>
                <span>สร้างเมื่อ</span>
                <span className="text-center">เครดิต</span>
                <span className="text-center">ใช้วันนี้</span>
                <span className="text-center">โปรไฟล์</span>
              </div>

              {paged.map((u) => (
                <div key={u.id}>
                  <button
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 text-sm hover:bg-[#d4af37]/[0.02] transition-colors items-center w-full text-left border-b border-white/[0.03]"
                    onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      {u.linePictureUrl ? (
                        <img src={u.linePictureUrl} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full shrink-0 bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]/50 text-xs">
                          {(u.username || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white/70 truncate">{u.profile?.nickname || u.username || "-"}</p>
                          {u.banned && <span className="text-[10px] text-red-400/70 bg-red-400/10 px-1.5 py-0.5 rounded">ระงับ</span>}
                        </div>
                        {u.lineDisplayName && <p className="text-green-400/40 text-[10px]">LINE: {u.lineDisplayName}</p>}
                      </div>
                    </div>
                    <span className="text-white/30 text-xs">{formatDate(u.createdAt)}</span>
                    <span className="text-center">
                      <span className="inline-block bg-[#d4af37]/10 text-[#d4af37] text-xs font-mono px-2 py-0.5 rounded">{u.credits || 0}</span>
                    </span>
                    <span className="text-center text-white/40 text-xs">{u.readingsToday}</span>
                    <span className="text-center">
                      {u.profile?.birthdate ? (
                        <span className="inline-block bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded">ครบ</span>
                      ) : (
                        <span className="inline-block bg-white/5 text-white/20 text-[10px] px-2 py-0.5 rounded">ไม่มี</span>
                      )}
                    </span>
                  </button>

                  {expanded === u.id && (
                    <div className="px-5 py-5 bg-white/[0.01] border-b border-white/[0.03]">
                      <div className="flex gap-5">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                          {u.linePictureUrl ? (
                            <img src={u.linePictureUrl} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-white/5" />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-[#111111] flex items-center justify-center text-[#d4af37]/30 text-2xl ring-2 ring-white/5">
                              {(u.username || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-[#d4af37] text-xs font-mono">{u.credits || 0} cr</span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="rounded-lg p-3 bg-[#111111]">
                            <p className="text-white/20 text-[10px] uppercase tracking-wider mb-2">LINE</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <Info label="ชื่อ LINE" value={u.lineDisplayName || "-"} />
                              <Info label="LINE ID" value={u.lineUserId ? u.lineUserId.slice(0, 12) + "..." : "-"} />
                            </div>
                          </div>

                          {u.profile && (
                            <div className="rounded-lg p-3 bg-[#111111]">
                              <p className="text-white/20 text-[10px] uppercase tracking-wider mb-2">ข้อมูลส่วนตัว</p>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <Info label="ชื่อเล่น" value={u.profile.nickname || "-"} />
                                <Info label="ชื่อจริง" value={u.profile.firstName ? `${u.profile.firstName} ${u.profile.lastName || ""}` : "-"} />
                                <Info label="เพศ" value={u.profile.gender === "male" ? "ชาย" : u.profile.gender === "female" ? "หญิง" : u.profile.gender === "other" ? "อื่นๆ" : "-"} />
                                <Info label="วันเกิด" value={u.profile.birthdate || "-"} />
                                <Info label="เวลาเกิด" value={u.profile.birthTime || "-"} />
                                <Info label="สถานะ" value={u.profile.relationshipStatus === "single" ? "โสด" : u.profile.relationshipStatus === "taken" ? "มีคู่" : u.profile.relationshipStatus === "complicated" ? "ซับซ้อน" : "-"} />
                                {u.profile.phone && <Info label="เบอร์โทร" value={u.profile.phone} />}
                                {u.profile.email && <Info label="อีเมล" value={u.profile.email} />}
                                {u.profile.occupation && <Info label="อาชีพ" value={u.profile.occupation} />}
                              </div>
                            </div>
                          )}

                          <div className="rounded-lg p-3 bg-[#111111]">
                            <p className="text-white/20 text-[10px] uppercase tracking-wider mb-2">จัดการ</p>
                            <div className="flex items-center gap-2 mb-2">
                              <input type="number" placeholder="จำนวนเครดิต" value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/30" />
                              <button disabled={actionLoading || !creditAmount} onClick={() => handleAddCredits(u.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#d4af37] text-[#0a0a0a] disabled:opacity-30 transition-colors">เพิ่มเครดิต</button>
                            </div>
                            <div className="flex gap-2">
                              {u.banned ? (
                                <button onClick={() => handleBan(u.id, false)} disabled={actionLoading}
                                  className="flex-1 px-3 py-1.5 rounded-lg text-xs text-green-400/70 hover:text-green-400 bg-[#0a0a0a] border border-white/10 transition-colors disabled:opacity-30">ปลดระงับ</button>
                              ) : (
                                <button onClick={() => handleBan(u.id, true)} disabled={actionLoading}
                                  className="flex-1 px-3 py-1.5 rounded-lg text-xs text-yellow-400/70 hover:text-yellow-400 bg-[#0a0a0a] border border-white/10 transition-colors disabled:opacity-30">ระงับบัญชี</button>
                              )}
                              <button onClick={() => handleDelete(u.id)} disabled={actionLoading}
                                className="px-3 py-1.5 rounded-lg text-xs text-red-400/50 hover:text-red-400 bg-[#0a0a0a] border border-white/10 transition-colors disabled:opacity-30">ลบผู้ใช้</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">ก่อนหน้า</button>
                <span className="text-white/40 text-sm px-3">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">ถัดไป</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#d4af37]/25 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-white/60 mt-0.5">{value}</p>
    </div>
  );
}
