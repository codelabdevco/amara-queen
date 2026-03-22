"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LaurelButton from "@/components/ui/LaurelButton";
import ProfileSetup from "@/components/ui/ProfileSetup";

interface UserInfo {
  role: string;
  userId?: string;
  username?: string;
}

export default function UserAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user);
    }).catch(() => {});

    // Check if redirected from LINE with setup=profile
    if (typeof window !== "undefined" && window.location.search.includes("setup=profile")) {
      fetch("/api/auth/me").then(r => r.json()).then(d => {
        if (d.user) { setUser(d.user); setShowProfile(true); }
      });
      window.history.replaceState({}, "", "/");
    }
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
        if (!isLogin) setShowProfile(true); // Show profile setup after registration
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
      <>
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="text-gold/60 text-xs">
              {user.username?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <span className="text-xs text-white/40 hidden sm:inline">{user.username || "Admin"}</span>
        </button>
        <button onClick={handleLogout} className="text-[0.6rem] text-white/20 hover:text-white/40 ml-1">
          ออก
        </button>
        <ProfileSetup open={showProfile} onClose={() => setShowProfile(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gold/25 hover:text-white/50 transition-colors tracking-wide"
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
            <motion.div
              className="relative bg-[#2a1215] rounded-2xl p-6 w-full max-w-[320px] space-y-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-gold text-center font-semibold">
                {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h3>

              {/* LINE Login */}
              <a
                href="/api/auth/line"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "#06C755", color: "#fff" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.81 2 10.44c0 3.7 3.04 6.9 7.34 7.93-.1.38-.66 2.44-.68 2.6 0 0-.01.1.05.14.06.03.13.01.13.01.17-.02 2-1.3 2.32-1.53.61.09 1.24.14 1.84.14 5.52 0 10-3.81 10-8.44C22 5.81 17.52 2 12 2z"/></svg>
                LINE Login
              </a>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-white/[0.06]" />
                <span className="text-white/20 text-[0.6rem]">หรือ</span>
                <div className="flex-1 h-[1px] bg-white/[0.06]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="ชื่อผู้ใช้"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-gold/10 outline-none"
                />
                <input
                  type="password"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-gold/10 outline-none"
                />

                {error && <p className="text-red-400/80 text-xs text-center">{error}</p>}

                <LaurelButton variant="gold" className="w-full">
                  {loading ? "..." : isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                </LaurelButton>
              </form>

              <a
                href="/api/auth/line"
                className="block w-full text-center py-2 rounded-lg text-gold/40 text-xs hover:text-gold/70 transition-colors"
              >
                Demo — ทดลองใช้งาน
              </a>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileSetup open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
