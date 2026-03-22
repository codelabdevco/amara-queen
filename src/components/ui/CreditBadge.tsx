"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreditInfo {
  credits: number;
  loggedIn: boolean;
  freeRemaining: number;
  dailyFreeLimit: number;
  creditCost: number;
  packages: { credits: number; price: number; label: string }[];
}

type PaymentStep = "packages" | "processing" | "qr" | "success" | "error";

export default function CreditBadge() {
  const [info, setInfo] = useState<CreditInfo | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<number>(0);
  const [step, setStep] = useState<PaymentStep>("packages");
  const [qrUrl, setQrUrl] = useState("");
  const [addedCredits, setAddedCredits] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchBalance(); }, []);
  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  function fetchBalance() {
    fetch("/api/credits/balance").then(r => r.json()).then(setInfo).catch(() => {});
  }

  function openTopUp() {
    setShowTopUp(true);
    setStep("packages");
    setErrorMsg("");
    fetchBalance();
  }

  async function handlePay() {
    if (!info) return;
    setStep("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIndex: selectedPkg }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "เกิดข้อผิดพลาด");
        setStep("error");
        return;
      }

      if (data.status === "successful") {
        setAddedCredits(data.credits);
        setStep("success");
        fetchBalance();
        return;
      }

      if (data.qrCodeUrl) {
        setQrUrl(data.qrCodeUrl);
        setStep("qr");
        startPolling(data.chargeId, data.credits);
      } else if (data.authorizeUri) {
        window.location.href = data.authorizeUri;
      }
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบชำระเงินได้");
      setStep("error");
    }
  }

  function startPolling(cId: string, credits: number) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 120) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep("error");
        setErrorMsg("หมดเวลาชำระเงิน กรุณาลองใหม่");
        return;
      }
      try {
        const res = await fetch(`/api/payment/status?chargeId=${cId}`);
        const data = await res.json();
        if (data.status === "successful") {
          if (pollRef.current) clearInterval(pollRef.current);
          setAddedCredits(credits);
          setStep("success");
          fetchBalance();
        } else if (data.status === "failed" || data.status === "expired") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("error");
          setErrorMsg("การชำระเงินไม่สำเร็จ กรุณาลองใหม่");
        }
      } catch {}
    }, 5000);
  }

  function closeModal() {
    setShowTopUp(false);
    if (pollRef.current) clearInterval(pollRef.current);
  }

  if (!info?.loggedIn) return null;

  return (
    <>
      <button onClick={openTopUp}
        className="flex items-center gap-1.5 bg-gold/10 rounded-full px-2.5 py-1 hover:bg-gold/15 transition-colors"
      >
        <span className="text-gold text-[0.6rem]">&#9733;</span>
        <span className="text-gold text-xs font-medium">{info.credits}</span>
      </button>

      <AnimatePresence>
        {showTopUp && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative bg-[#2a1215] rounded-2xl p-6 w-full max-w-[380px]"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {step === "packages" && (
                  <motion.div key="pkg" className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="text-center">
                      <h3 className="text-gold font-semibold text-lg">เติมเครดิต</h3>
                      <p className="text-white/30 text-xs mt-1">คงเหลือ: <span className="text-gold">{info.credits}</span> เครดิต</p>
                      <p className="text-white/20 text-[0.6rem] mt-0.5">ฟรี {info.freeRemaining}/{info.dailyFreeLimit} ครั้ง/วัน</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {info.packages.map((pkg, i) => (
                        <button key={i}
                          className={`rounded-xl p-3 border text-center transition-all ${selectedPkg === i
                            ? "bg-gold/10 border-gold/10 shadow-[0_0_12px_rgba(232,212,139,0.08)]"
                            : "bg-[#1e0c0c] border-gold/[0.02] hover:border-gold/[0.02]"}`}
                          onClick={() => setSelectedPkg(i)}
                        >
                          <p className="text-gold font-semibold text-lg">{pkg.credits}</p>
                          <p className="text-white/30 text-[0.6rem]">เครดิต</p>
                          <p className="text-white/60 text-xs mt-1">{pkg.price} &#3647;</p>
                        </button>
                      ))}
                    </div>

                    <button onClick={handlePay}
                      className="w-full py-3 rounded-xl bg-gradient-to-br from-[#e8d48b] to-[#c4a850] text-[#08090e] text-sm font-semibold tracking-wide shadow-[0_4px_24px_rgba(232,212,139,.25)]"
                    >
                      ชำระเงิน {info.packages[selectedPkg]?.price} &#3647;
                    </button>
                    <p className="text-white/15 text-[0.55rem] text-center">PromptPay QR | เครดิตเข้าอัตโนมัติ</p>
                  </motion.div>
                )}

                {step === "processing" && (
                  <motion.div key="proc" className="text-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-10 h-10 border-2 border-gold/10 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-sm">กำลังสร้างรายการชำระเงิน...</p>
                  </motion.div>
                )}

                {step === "qr" && (
                  <motion.div key="qr" className="space-y-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3 className="text-gold font-semibold">สแกน QR เพื่อชำระเงิน</h3>
                    <p className="text-white/40 text-xs">{info.packages[selectedPkg]?.price} &#3647; = {info.packages[selectedPkg]?.credits} เครดิต</p>
                    {qrUrl ? (
                      <div className="bg-white rounded-xl p-4 w-fit mx-auto">
                        <img src={qrUrl} alt="PromptPay QR" className="w-48 h-48" />
                      </div>
                    ) : (
                      <div className="bg-gold/5 rounded-xl w-48 h-48 mx-auto flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400/50 rounded-full animate-pulse" />
                      <p className="text-white/40 text-xs">รอการชำระเงิน... เครดิตจะเข้าอัตโนมัติ</p>
                    </div>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div key="ok" className="text-center py-6 space-y-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                      <span className="text-green-400 text-2xl">&#10003;</span>
                    </div>
                    <h3 className="text-gold text-lg font-semibold">ชำระเงินสำเร็จ!</h3>
                    <p className="text-white/40 text-sm">เพิ่ม <span className="text-gold font-semibold">{addedCredits}</span> เครดิต</p>
                    <button onClick={closeModal}
                      className="w-full py-2.5 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                    >ปิด</button>
                  </motion.div>
                )}

                {step === "error" && (
                  <motion.div key="err" className="text-center py-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                      <span className="text-red-400 text-xl">&#10007;</span>
                    </div>
                    <p className="text-white/60 text-sm">{errorMsg}</p>
                    <button onClick={() => setStep("packages")}
                      className="w-full py-2.5 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                    >ลองใหม่</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={closeModal} className="w-full text-center text-white/15 text-xs hover:text-white/30 mt-3">ปิด</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
