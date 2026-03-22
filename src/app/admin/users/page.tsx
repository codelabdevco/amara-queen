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
}

interface User {
  id: string;
  username: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
  profile?: UserProfile;
  credits: number;
  createdAt: number;
  readingsToday: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">ผู้ใช้</h2>
          <span className="text-white/30 text-sm">{users.length} คน</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">ผู้ใช้ทั้งหมด</p>
            <p className="text-gold text-xl font-semibold mt-1">{users.length}</p>
          </div>
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">LINE Login</p>
            <p className="text-green-400 text-xl font-semibold mt-1">{lineUsers}</p>
          </div>
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">กรอกโปรไฟล์</p>
            <p className="text-gold text-xl font-semibold mt-1">{withProfile}</p>
          </div>
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">เครดิตรวม</p>
            <p className="text-gold text-xl font-semibold mt-1">{totalCredits}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#2a1215] rounded-xl p-10 text-center text-white/20 text-sm">ยังไม่มีผู้ใช้</div>
        ) : (
          <div className="bg-[#2a1215] rounded-xl overflow-hidden">
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
                      <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-gold/50 text-xs">
                        {(u.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white/70">{u.username || "-"}</p>
                      {u.lineDisplayName && <p className="text-green-400/50 text-[0.6rem]">LINE: {u.lineDisplayName}</p>}
                    </div>
                  </div>
                  <span className="text-white/40 text-xs">{formatDate(u.createdAt)}</span>
                  <span className="text-center">
                    <span className="inline-block bg-gold/10 text-gold text-xs font-mono px-2 py-0.5 rounded">{u.credits || 0}</span>
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
                {expanded === u.id && u.profile && (
                  <div className="px-5 py-4 bg-white/[0.01]">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {u.profile.nickname && <Info label="ชื่อเล่น" value={u.profile.nickname} />}
                      {u.profile.firstName && <Info label="ชื่อจริง" value={`${u.profile.firstName} ${u.profile.lastName || ""}`} />}
                      {u.profile.birthdate && <Info label="วันเกิด" value={u.profile.birthdate} />}
                      {u.profile.gender && <Info label="เพศ" value={u.profile.gender === "male" ? "ชาย" : u.profile.gender === "female" ? "หญิง" : "อื่นๆ"} />}
                      {u.profile.phone && <Info label="เบอร์โทร" value={u.profile.phone} />}
                      {u.profile.email && <Info label="อีเมล" value={u.profile.email} />}
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
      <p className="text-gold/25 text-[0.6rem] uppercase tracking-wider">{label}</p>
      <p className="text-white/60 mt-0.5">{value}</p>
    </div>
  );
}
