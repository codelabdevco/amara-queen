"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LaurelButton from "@/components/ui/LaurelButton";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchBalance();
    checkAdminStatus();
  }, []);
  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  function fetchBalance() {
    fetch("/api/credits/balance").then(r => r.json()).then(setInfo).catch(() => {});
  }

  function checkAdminStatus() {
    fetch("/api/admin/verify").then(r => r.ok).then(setIsAdmin).catch(() => setIsAdmin(false));
  }

  function openTopUp() { setShowTopUp(true); setStep("packages"); setErrorMsg(""); fetchBalance(); }

  async function handleTestTopUp() {
    if (!info) return;
    try {
      const pkg = info.packages[selectedPkg];
      const res = await fetch("/api/test-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pkg.credits,
          reason: `เทสเติม ${pkg.credits} เครดิต`
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "เกิดข้อผิดพลาด");
        setStep("error");
        return;
      }
      setAddedCredits(data.addedAmount);
      setStep("success");
      fetchBalance();
    } catch {
      setErrorMsg("ไม่สามารถเติมเครดิตได้");
      setStep("error");
    }
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
      if (!res.ok) { setErrorMsg(data.error || "เกิดข้อผิดพลาด"); setStep("error"); return; }
      if (data.status === "successful") { setAddedCredits(data.credits); setStep("success"); fetchBalance(); return; }
      if (data.qrCodeUrl) { setQrUrl(data.qrCodeUrl); setStep("qr"); startPolling(data.chargeId, data.credits); }
      else if (data.authorizeUri) { window.location.href = data.authorizeUri; }
    } catch { setErrorMsg("ไม่สามารถเชื่อมต่อระบบชำระเงินได้"); setStep("error"); }
  }

  function startPolling(cId: string, credits: number) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 120) { if (pollRef.current) clearInterval(pollRef.current); setStep("error"); setErrorMsg("หมดเวลาชำระเงิน"); return; }
      try {
        const res = await fetch(`/api/payment/status?chargeId=${cId}`);
        const data = await res.json();
        if (data.status === "successful") { if (pollRef.current) clearInterval(pollRef.current); setAddedCredits(credits); setStep("success"); fetchBalance(); }
        else if (data.status === "failed" || data.status === "expired") { if (pollRef.current) clearInterval(pollRef.current); setStep("error"); setErrorMsg("การชำระเงินไม่สำเร็จ"); }
      } catch {}
    }, 5000);
  }

  function closeModal() { setShowTopUp(false); if (pollRef.current) clearInterval(pollRef.current); }

  if (!info?.loggedIn) return null;

  return (
    <>
      <button onClick={openTopUp}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors"
        style={{ background: "#3A0E0E", border: "0.5px solid #8B7A4A30" }}
      >
        <span className="text-[#d4af37] text-[0.6rem]">&#9733;</span>
        <span className="text-[#d4af37] text-xs font-medium">{info.credits}</span>
      </button>

      <AnimatePresence>
        {showTopUp && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative rounded-lg p-5 w-full max-w-[380px]"
              style={{ background: "linear-gradient(135deg, #2D0A0A, #3A0E0E)", border: "1px solid #8B7A4A20" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold ornament top */}
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #d4af3740, transparent)" }} />

              <AnimatePresence mode="wait">
                {/* ── Package Selection ── */}
                {step === "packages" && (
                  <motion.div key="pkg" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Header */}
                    <div className="text-center">
                      <h3
                        className="text-base font-semibold tracking-[0.1em]"
                        style={{
                          background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
                          backgroundSize: "200% 200%",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          animation: "shimmer-text 4s ease-in-out infinite",
                        }}
                      >เติมเครดิต</h3>
                      <div className="h-[1px] w-12 mx-auto mt-2 mb-3" style={{ background: "linear-gradient(90deg, transparent, #8B7A4A, transparent)" }} />
                    </div>

                    {/* Balance */}
                    <div className="rounded-lg p-3 text-center" style={{ background: "#1e0c0c", border: "0.5px solid #8B7A4A10" }}>
                      <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-wider">เครดิตคงเหลือ</p>
                      <p className="text-[#d4af37] text-2xl font-semibold mt-0.5">{info.credits}</p>
                      <p className="text-[#8B7A4A]/30 text-[0.55rem] mt-1">ฟรี {info.freeRemaining}/{info.dailyFreeLimit} ครั้ง/วัน · ใช้ {info.creditCost} เครดิต/ครั้ง</p>
                    </div>

                    {/* Packages */}
                    <div>
                      <p className="text-[#8B7A4A]/40 text-[0.55rem] uppercase tracking-[0.2em] mb-2">เลือกแพ็กเกจ</p>
                      <div className="grid grid-cols-3 gap-2">
                        {info.packages.map((pkg, i) => {
                          const isSelected = selectedPkg === i;
                          const perCredit = (pkg.price / pkg.credits).toFixed(1);
                          return (
                            <button key={i}
                              className="rounded-lg p-3 text-center transition-all"
                              style={{
                                background: isSelected ? "#3A0E0E" : "#1e0c0c",
                                border: isSelected ? "1px solid #8B7A4A40" : "0.5px solid #8B7A4A10",
                                boxShadow: isSelected ? "0 0 12px rgba(212,175,55,0.06)" : "none",
                              }}
                              onClick={() => setSelectedPkg(i)}
                            >
                              <p className="text-[#d4af37] font-semibold text-xl">{pkg.credits}</p>
                              <p className="text-[#8B7A4A]/40 text-[0.55rem]">เครดิต</p>
                              <p className="text-[#E2D4A0]/70 text-sm font-medium mt-1.5">฿{pkg.price}</p>
                              <p className="text-[#8B7A4A]/30 text-[0.5rem] mt-0.5">฿{perCredit}/เครดิต</p>
                              {i === 2 && <p className="text-[#d4af37]/50 text-[0.5rem] mt-1">คุ้มสุด</p>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg p-3" style={{ background: "#1e0c0c", border: "0.5px solid #8B7A4A10" }}>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8B7A4A]/50 text-xs">แพ็กเกจที่เลือก</span>
                        <span className="text-[#E2D4A0] text-xs">{info.packages[selectedPkg]?.credits} เครดิต</span>
                      </div>
                      <div className="h-[1px] my-2" style={{ background: "#8B7A4A15" }} />
                      <div className="flex justify-between items-center">
                        <span className="text-[#8B7A4A]/50 text-xs">ยอดชำระ</span>
                        <span className="text-[#d4af37] text-base font-semibold">฿{info.packages[selectedPkg]?.price}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <LaurelButton variant="gold" onClick={handlePay} className="w-full">
                        ชำระเงิน ฿{info.packages[selectedPkg]?.price}
                      </LaurelButton>

                      {isAdmin && (
                        <LaurelButton variant="crimson" onClick={handleTestTopUp} className="w-full">
                          🧪 เทสเติมเครดิต ({info.packages[selectedPkg]?.credits} เครดิต)
                        </LaurelButton>
                      )}
                    </div>

                    <p className="text-[#8B7A4A]/25 text-[0.5rem] text-center">PromptPay QR · เครดิตเข้าอัตโนมัติเมื่อชำระสำเร็จ</p>
                  </motion.div>
                )}

                {/* ── Processing ── */}
                {step === "processing" && (
                  <motion.div key="proc" className="text-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-10 h-10 border-2 border-[#8B7A4A]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#E2D4A0]/50 text-sm">กำลังสร้างรายการชำระเงิน...</p>
                  </motion.div>
                )}

                {/* ── QR Code ── */}
                {step === "qr" && (
                  <motion.div key="qr" className="space-y-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3
                      className="text-sm font-semibold tracking-[0.1em]"
                      style={{ background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer-text 4s ease-in-out infinite" }}
                    >สแกน QR เพื่อชำระเงิน</h3>
                    <p className="text-[#8B7A4A]/50 text-xs">฿{info.packages[selectedPkg]?.price} = {info.packages[selectedPkg]?.credits} เครดิต</p>
                    {qrUrl ? (
                      <div className="bg-white rounded-lg p-3 w-fit mx-auto">
                        <img src={qrUrl} alt="PromptPay QR" className="w-44 h-44" />
                      </div>
                    ) : (
                      <div className="rounded-lg w-44 h-44 mx-auto flex items-center justify-center" style={{ background: "#1e0c0c" }}>
                        <div className="w-6 h-6 border-2 border-[#8B7A4A]/30 border-t-[#d4af37] rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-[#d4af37]/50 rounded-full animate-pulse" />
                      <p className="text-[#8B7A4A]/50 text-xs">รอการชำระเงิน... เครดิตจะเข้าอัตโนมัติ</p>
                    </div>
                  </motion.div>
                )}

                {/* ── Success ── */}
                {step === "success" && (
                  <motion.div key="ok" className="text-center py-6 space-y-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#1e0c0c", border: "1px solid #8B7A4A30" }}>
                      <span className="text-[#d4af37] text-2xl">&#10003;</span>
                    </div>
                    <h3 className="text-[#d4af37] text-base font-semibold">ชำระเงินสำเร็จ!</h3>
                    <div className="rounded-lg p-3" style={{ background: "#1e0c0c", border: "0.5px solid #8B7A4A10" }}>
                      <p className="text-[#8B7A4A]/40 text-[0.55rem]">เครดิตที่ได้รับ</p>
                      <p className="text-[#d4af37] text-xl font-semibold">+{addedCredits}</p>
                      <p className="text-[#8B7A4A]/30 text-[0.55rem] mt-1">ยอดคงเหลือ: {info.credits} เครดิต</p>
                    </div>
                    <LaurelButton variant="crimson" onClick={closeModal} className="w-full">ปิด</LaurelButton>
                  </motion.div>
                )}

                {/* ── Error ── */}
                {step === "error" && (
                  <motion.div key="err" className="text-center py-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#1e0c0c", border: "1px solid #7a202030" }}>
                      <span className="text-[#7a2020] text-xl">&#10007;</span>
                    </div>
                    <p className="text-[#E2D4A0]/60 text-sm">{errorMsg}</p>
                    <LaurelButton variant="crimson" onClick={() => setStep("packages")} className="w-full">ลองใหม่</LaurelButton>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={closeModal} className="w-full text-center text-[#8B7A4A]/25 text-[0.6rem] hover:text-[#8B7A4A]/50 mt-3">ปิด</button>

              {/* Gold ornament bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #d4af3740, transparent)" }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
