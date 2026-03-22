"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreditInfo {
  credits: number;
  loggedIn: boolean;
  freeRemaining: number;
  dailyFreeLimit: number;
  creditCost: number;
  packages: { credits: number; price: number; label: string }[];
  promptPayNumber: string;
  promptPayName: string;
}

export default function CreditBadge() {
  const [info, setInfo] = useState<CreditInfo | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  function fetchBalance() {
    fetch("/api/credits/balance").then(r => r.json()).then(setInfo).catch(() => {});
  }

  async function handleSubmit() {
    if (!info || !paymentRef.trim()) return;
    setSubmitting(true);
    const pkg = info.packages[selectedPkg];
    try {
      const res = await fetch("/api/credits/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: pkg.credits, price: pkg.price, paymentRef: paymentRef.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
        setPaymentRef("");
      }
    } catch {}
    setSubmitting(false);
  }

  if (!info?.loggedIn) return null;

  return (
    <>
      <button
        onClick={() => { setShowTopUp(true); setSubmitted(false); fetchBalance(); }}
        className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-2.5 py-1 hover:bg-gold/15 transition-colors"
      >
        <span className="text-gold text-[0.6rem]">&#9733;</span>
        <span className="text-gold text-xs font-medium">{info.credits}</span>
      </button>

      <AnimatePresence>
        {showTopUp && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTopUp(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative bg-[#0c0d14] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[360px] space-y-5"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-gold font-semibold text-lg">เติมเครดิต</h3>
                <p className="text-white/30 text-xs mt-1">เครดิตคงเหลือ: <span className="text-gold">{info.credits}</span></p>
                <p className="text-white/20 text-[0.65rem] mt-0.5">ฟรีวันนี้: {info.freeRemaining}/{info.dailyFreeLimit} ครั้ง | ใช้ {info.creditCost} เครดิต/ครั้ง หลังใช้ฟรีหมด</p>
              </div>

              {submitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                    <span className="text-green-400 text-xl">&#10003;</span>
                  </div>
                  <p className="text-white/70 text-sm">ส่งคำขอเติมเครดิตแล้ว</p>
                  <p className="text-white/30 text-xs">รอแอดมินอนุมัติ เครดิตจะเข้าอัตโนมัติ</p>
                </div>
              ) : (
                <>
                  {/* Package selection */}
                  <div className="space-y-2">
                    <p className="text-white/40 text-xs">เลือกแพ็กเกจ</p>
                    <div className="grid grid-cols-3 gap-2">
                      {info.packages.map((pkg, i) => (
                        <button key={i}
                          className={`rounded-xl p-3 border text-center transition-all ${selectedPkg === i
                            ? "bg-gold/10 border-gold/30 shadow-[0_0_12px_rgba(232,212,139,0.08)]"
                            : "bg-[#08090e] border-white/[0.06] hover:border-white/10"
                          }`}
                          onClick={() => setSelectedPkg(i)}
                        >
                          <p className="text-gold font-semibold text-lg">{pkg.credits}</p>
                          <p className="text-white/30 text-[0.6rem]">เครดิต</p>
                          <p className="text-white/60 text-xs mt-1">{pkg.price} &#3647;</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PromptPay info */}
                  {info.promptPayNumber && (
                    <div className="bg-[#08090e] border border-white/[0.06] rounded-xl p-3 text-center space-y-1">
                      <p className="text-white/30 text-[0.65rem]">โอนผ่าน PromptPay</p>
                      <p className="text-gold font-mono text-lg tracking-wider">{info.promptPayNumber}</p>
                      <p className="text-white/40 text-xs">{info.promptPayName}</p>
                      <p className="text-gold/60 text-sm font-semibold mt-1">{info.packages[selectedPkg]?.price} &#3647;</p>
                    </div>
                  )}

                  {/* Payment reference */}
                  <div className="space-y-2">
                    <p className="text-white/40 text-xs">หมายเลขอ้างอิง / เวลาโอน</p>
                    <input
                      type="text"
                      placeholder="เช่น โอนเวลา 14:30 หรือ Ref: 2024032212345"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-gold/30 outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !paymentRef.trim()}
                    className="w-full py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-30"
                  >
                    {submitting ? "กำลังส่ง..." : "ส่งคำขอเติมเครดิต"}
                  </button>
                </>
              )}

              <button onClick={() => setShowTopUp(false)} className="w-full text-center text-white/25 text-xs hover:text-white/40">ปิด</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
