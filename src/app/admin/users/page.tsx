"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface User {
  _id: string;
  username: string;
  createdAt: string;
  readingsToday: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUsers(data.users ?? data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">ผู้ใช้</h2>
          <span className="text-white/30 text-sm">{users.length.toLocaleString()} คน</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-10 text-center text-white/20 text-sm">
            ยังไม่มีผู้ใช้
          </div>
        ) : (
          <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.06] text-xs text-white/30 uppercase tracking-wider">
              <span>ชื่อผู้ใช้</span>
              <span>สร้างเมื่อ</span>
              <span className="text-right">คำทำนายวันนี้</span>
            </div>

            {users.map((u) => (
              <div
                key={u._id}
                className="grid grid-cols-[2fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.04] text-sm hover:bg-white/[0.02] transition-colors items-center"
              >
                <span className="text-white/70">{u.username || "-"}</span>
                <span className="text-white/40 text-xs">{formatDate(u.createdAt)}</span>
                <span className="text-right">
                  <span className="inline-block bg-gold/10 text-gold text-xs font-mono px-2 py-0.5 rounded">
                    {u.readingsToday}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
