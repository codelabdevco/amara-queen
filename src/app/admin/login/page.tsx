"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "รหัสผ่านไม่ถูกต้อง");
        return;
      }
      router.push("/admin");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0a0a" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "#141414", border: "1px solid #ffffff08" }}
          >
            <span className="text-[#d4af37] text-xl">&#10022;</span>
          </div>
          <h1 className="text-lg font-semibold tracking-[0.2em] text-white/90">Queen Amara</h1>
          <p className="text-white/25 text-xs tracking-[0.15em] mt-1">ADMIN PANEL</p>
          <div className="w-12 h-[1px] mx-auto mt-3" style={{ background: "linear-gradient(90deg, transparent, #ffffff15, transparent)" }} />
        </div>

        <form onSubmit={handleSubmit}
          className="rounded-lg p-6 space-y-5"
          style={{ background: "#111111", border: "1px solid #ffffff06" }}
        >
          <div>
            <label className="block text-white/30 text-[0.6rem] mb-2 uppercase tracking-[0.2em]">รหัสผ่าน</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน..."
              className="w-full rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 outline-none focus:ring-1 focus:ring-white/10"
              style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg px-3 py-2 text-xs text-center text-red-400/80"
              style={{ background: "#1a0505", border: "1px solid #ff000015" }}
            >{error}</div>
          )}

          <button type="submit" disabled={loading || !password}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
            style={{ background: "#d4af37", color: "#0a0a0a" }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
