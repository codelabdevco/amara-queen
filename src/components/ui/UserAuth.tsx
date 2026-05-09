"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSetup from "@/components/ui/ProfileSetup";
import LineIcon from "@/components/ui/LineIcon";

interface UserInfo {
  role: string;
  userId?: string;
  username?: string;
  linePictureUrl?: string | null;
}

const LINE_ERROR_MSGS: Record<string, string> = {
  line_developing: "LINE Login ยังอยู่ในโหมดพัฒนา กรุณาติดต่อผู้ดูแลระบบ",
  line_not_configured: "ระบบ LINE Login ยังไม่ได้ตั้งค่า",
  line_denied: "คุณปฏิเสธการเข้าสู่ระบบ",
  line_auth_failed: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่",
  line_token_failed: "ไม่สามารถเชื่อมต่อ LINE ได้",
  line_profile_failed: "ไม่สามารถดึงข้อมูล LINE ได้",
  line_error: "เกิดข้อผิดพลาด กรุณาลองใหม่",
};

export default function UserAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user);
    }).catch(() => {});

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // Handle LINE login errors
      const err = params.get("error");
      if (err) {
        setLoginError(LINE_ERROR_MSGS[err] || "เกิดข้อผิดพลาด");
        setShowModal(true);
        window.history.replaceState({}, "", window.location.pathname);
      }

      // Handle profile setup redirect
      if (params.get("setup") === "profile") {
        fetch("/api/auth/me").then(r => r.json()).then(d => {
          if (d.user) { setUser(d.user); setShowProfile(true); }
        });
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  if (user) {
    return (
      <>
        <button onClick={() => setShowProfile(true)} className="flex items-center gap-2">
          {user.linePictureUrl ? (
            <img src={user.linePictureUrl} alt="" className="w-7 h-7 rounded-full" style={{ border: "1px solid #8B7A4A30" }} />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#3A0E0E", border: "1px solid #8B7A4A30" }}>
              <span className="text-[#d4af37]/60 text-xs">{user.username?.charAt(0).toUpperCase() || "?"}</span>
            </div>
          )}
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
            onClick={() => { setShowModal(false); setLoginError(""); }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative bg-[#2a1215] rounded-2xl p-6 w-full max-w-[320px]"
              style={{ border: "1px solid rgba(212,175,55,0.1)" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[#d4af37] text-center font-semibold mb-2">เข้าสู่ระบบ</h3>
              <p className="text-[#8B7A4A]/40 text-xs text-center mb-5">เข้าสู่ระบบเพื่อดูดวงและสะสมเครดิต</p>

              {loginError && (
                <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20">
                  <p className="text-red-400/80 text-xs text-center">{loginError}</p>
                </div>
              )}

              <a
                href="/api/auth/line"
                className="flex items-center justify-center gap-2.5 w-full py-3 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-110"
                style={{ background: "#06C755", color: "#fff" }}
              >
                <LineIcon size={20} />
                เข้าสู่ระบบด้วย LINE
              </a>

              <button
                onClick={() => { setShowModal(false); setLoginError(""); }}
                className="w-full text-center text-[#8B7A4A]/30 text-xs mt-4 hover:text-[#8B7A4A]/50 transition-colors"
              >
                ปิด
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileSetup open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
