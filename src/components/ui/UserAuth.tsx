"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UserInfo {
  role: string;
  userId?: string;
  username?: string;
}

export default function UserAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setUser({ role: "user", userId: data.user.id, username: data.user.username });
        setShowModal(false);
        setUsername("");
        setPassword("");
      }
    } catch {
      setError("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <span className="text-gold/60 text-xs">
            {user.username?.charAt(0).toUpperCase() || "A"}
          </span>
        </div>
        <span className="text-xs text-white/40">{user.username || "Admin"}</span>
        <button onClick={handleLogout} className="text-[0.6rem] text-white/20 hover:text-white/40 ml-1">
          ออก
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-white/25 hover:text-white/50 transition-colors tracking-wide"
      >
        เข้าสู่ระบบ
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.form
              className="relative bg-[#0c0d14] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[320px] space-y-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
            >
              <h3 className="text-gold text-center font-semibold">
                {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h3>

              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-gold/30 outline-none"
                autoFocus
              />
              <input
                type="password"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-gold/30 outline-none"
              />

              {error && <p className="text-red-400/80 text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>

              <p className="text-center text-[0.65rem] text-white/30">
                {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-gold/50 hover:text-gold/80"
                >
                  {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                </button>
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
