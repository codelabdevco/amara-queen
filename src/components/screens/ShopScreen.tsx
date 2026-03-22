"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: string;
}

interface CartItem extends Product { qty: number }

type Step = "browse" | "login" | "shipping" | "payment" | "processing" | "success" | "error";

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState<Step>("browse");
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [credits, setCredits] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [payMethod, setPayMethod] = useState<"credit" | "transfer">("transfer");
  const [promptPayInfo, setPromptPayInfo] = useState({ number: "", name: "" });

  // Shipping form
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
    fetch("/api/credits/balance").then(r => r.json()).then(d => { setCredits(d.credits || 0); setLoggedIn(d.loggedIn || false); }).catch(() => {});
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function addToCart(p: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  async function handleCheckout() {
    if (!shippingName || !shippingPhone || !shippingAddress) {
      setErrorMsg("กรุณากรอกข้อมูลจัดส่งให้ครบ");
      return;
    }

    setStep("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, qty: i.qty })),
          paymentMethod: payMethod,
          shippingName,
          shippingPhone: shippingPhone.replace(/[^0-9]/g, ""),
          shippingAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "สั่งซื้อไม่สำเร็จ");
        setStep("error");
        return;
      }
      setOrderId(data.order?.id || "");
      if (data.promptPayNumber) setPromptPayInfo({ number: data.promptPayNumber, name: data.promptPayName || "" });
      setCart([]);
      setStep("success");
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อได้");
      setStep("error");
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10 relative"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <motion.div className="text-center mb-5" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }}>
        <h2 className="text-lg text-gold font-semibold tracking-wide">ร้านค้ามงคล</h2>
        <p className="text-gold/25 text-xs mt-1">วัตถุมงคล เครื่องราง ของดี เสริมดวง</p>
      </motion.div>

      {/* Cart floating button */}
      {cartCount > 0 && step === "browse" && (
        <motion.button
          className="fixed bottom-24 left-4 right-4 z-[101] py-3 rounded-xl bg-gold text-[#1a0a0a] text-sm font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] text-center"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setShowCart(true); setStep("browse"); }}
        >
          ตะกร้า ({cartCount} ชิ้น) — ฿{cartTotal} · สั่งซื้อ
        </motion.button>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
        {products.map((product, idx) => (
          <motion.div key={product.id} className="rounded-2xl bg-[#2a1215]/90 overflow-hidden"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05, duration: 0.4, ease: EASE }}
          >
            <div className="aspect-square bg-[#1e0c0c] flex items-center justify-center">
              <span className="text-3xl text-gold/60">{product.icon}</span>
            </div>
            <div className="p-3">
              <p className="text-white/80 text-xs font-medium leading-tight mb-0.5">{product.name}</p>
              <p className="text-white/30 text-[0.55rem] leading-4 mb-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-gold text-sm font-semibold">฿{product.price}</span>
                <motion.button
                  className="px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-[0.6rem] font-medium active:bg-gold/20"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                >
                  + ตะกร้า
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Cart / Checkout Panel ── */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowCart(false); setStep("browse"); }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[130] bg-[#2a1215] rounded-t-3xl max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="p-5">
                <div className="w-10 h-1 rounded-full bg-gold/15 mx-auto mb-4" />

                <AnimatePresence mode="wait">
                  {/* ── Cart Items ── */}
                  {(step === "browse") && (
                    <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h3 className="text-gold text-sm font-semibold mb-4">ตะกร้าสินค้า</h3>
                      {cart.length === 0 ? (
                        <p className="text-white/30 text-xs text-center py-8">ยังไม่มีสินค้า</p>
                      ) : (
                        <>
                          <div className="space-y-3 mb-4">
                            {cart.map(item => (
                              <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-gold/50 text-lg">{item.icon}</span>
                                  <div>
                                    <p className="text-white/70 text-xs">{item.name}</p>
                                    <p className="text-gold/50 text-[0.65rem]">฿{item.price} x {item.qty} = ฿{item.price * item.qty}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="w-7 h-7 rounded-full bg-[#1e0c0c] text-white/40 text-sm flex items-center justify-center" onClick={() => updateQty(item.id, -1)}>-</button>
                                  <span className="text-white/70 text-xs w-4 text-center">{item.qty}</span>
                                  <button className="w-7 h-7 rounded-full bg-[#1e0c0c] text-white/40 text-sm flex items-center justify-center" onClick={() => updateQty(item.id, 1)}>+</button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center py-3 mb-4">
                            <span className="text-white/40 text-sm">รวม</span>
                            <span className="text-gold text-lg font-semibold">฿{cartTotal}</span>
                          </div>
                          <button onClick={() => setStep("shipping")}
                            className="w-full py-3 rounded-xl bg-gold text-[#1a0a0a] text-sm font-semibold"
                          >ดำเนินการสั่งซื้อ</button>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* ── Login Prompt ── */}
                  {step === "login" && (
                    <motion.div key="login" className="text-center py-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
                        <span className="text-gold text-xl">♦</span>
                      </div>
                      <p className="text-white/60 text-sm">กรุณาเข้าสู่ระบบก่อนสั่งซื้อ</p>
                      <a href="/api/auth/line"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold"
                        style={{ background: "#06C755", color: "#fff" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.81 2 10.44c0 3.7 3.04 6.9 7.34 7.93-.1.38-.66 2.44-.68 2.6 0 0-.01.1.05.14.06.03.13.01.13.01.17-.02 2-1.3 2.32-1.53.61.09 1.24.14 1.84.14 5.52 0 10-3.81 10-8.44C22 5.81 17.52 2 12 2z"/></svg>
                        LINE Login
                      </a>
                      <a href="/api/auth/line" className="block text-gold/40 text-xs hover:text-gold/70">Demo — ทดลองใช้งาน</a>
                      <button onClick={() => setStep("browse")} className="text-white/30 text-xs">ย้อนกลับ</button>
                    </motion.div>
                  )}

                  {/* ── Shipping Form ── */}
                  {step === "shipping" && (
                    <motion.div key="shipping" className="space-y-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <h3 className="text-gold text-sm font-semibold">ที่อยู่จัดส่ง</h3>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">ชื่อผู้รับ *</label>
                        <input type="text" value={shippingName} onChange={e => setShippingName(e.target.value)}
                          placeholder="ชื่อ-นามสกุล" className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:ring-1 focus:ring-gold/20" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">เบอร์โทร *</label>
                        <input type="tel" inputMode="numeric" value={shippingPhone} onChange={e => setShippingPhone(e.target.value.replace(/[^0-9-]/g, "").slice(0, 12))}
                          placeholder="08X-XXX-XXXX" className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:ring-1 focus:ring-gold/20 font-mono" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">ที่อยู่ *</label>
                        <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)}
                          placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                          rows={3} className="w-full bg-[#1e0c0c] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:ring-1 focus:ring-gold/20 resize-none" />
                      </div>
                      {errorMsg && <p className="text-red-400/80 text-xs">{errorMsg}</p>}
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setStep("browse"); setErrorMsg(""); }} className="flex-1 py-2.5 rounded-xl bg-[#1e0c0c] text-white/40 text-sm">ย้อนกลับ</button>
                        <button onClick={() => setStep("payment")} className="flex-1 py-2.5 rounded-xl bg-gold text-[#1a0a0a] text-sm font-semibold">ถัดไป</button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Payment ── */}
                  {step === "payment" && (
                    <motion.div key="payment" className="space-y-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <h3 className="text-gold text-sm font-semibold">ชำระเงิน</h3>

                      {/* Order summary */}
                      <div className="bg-[#1e0c0c] rounded-xl p-4 space-y-2">
                        {cart.map(i => (
                          <div key={i.id} className="flex justify-between text-xs">
                            <span className="text-white/50">{i.name} x{i.qty}</span>
                            <span className="text-white/70">฿{i.price * i.qty}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 text-sm font-semibold">
                          <span className="text-white/60">รวม</span>
                          <span className="text-gold">฿{cartTotal}</span>
                        </div>
                      </div>

                      {/* Shipping summary */}
                      <div className="bg-[#1e0c0c] rounded-xl p-4 text-xs space-y-1">
                        <p className="text-gold/50 text-[0.6rem] uppercase tracking-wider mb-2">ส่งถึง</p>
                        <p className="text-white/70">{shippingName} · {shippingPhone}</p>
                        <p className="text-white/40">{shippingAddress}</p>
                      </div>

                      {/* Payment method */}
                      <div className="bg-[#1e0c0c] rounded-xl p-4 space-y-3">
                        <p className="text-gold/50 text-[0.6rem] uppercase tracking-wider">เลือกวิธีชำระ</p>

                        <button onClick={() => setPayMethod("transfer")}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${payMethod === "transfer" ? "bg-gold/10 ring-1 ring-gold/20" : "bg-[#2a1215]"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gold">฿</span>
                            <span className="text-white/70 text-sm">โอนเงิน / PromptPay</span>
                          </div>
                          <span className="text-gold text-sm font-semibold">฿{cartTotal}</span>
                        </button>

                        {loggedIn && (
                          <button onClick={() => setPayMethod("credit")}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${payMethod === "credit" ? "bg-gold/10 ring-1 ring-gold/20" : "bg-[#2a1215]"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gold">&#9733;</span>
                              <span className="text-white/70 text-sm">ใช้เครดิต</span>
                            </div>
                            <span className={`text-xs font-mono ${credits >= cartTotal ? "text-green-400" : "text-red-400"}`}>{credits} เครดิต</span>
                          </button>
                        )}
                      </div>

                      {payMethod === "credit" && credits < cartTotal && (
                        <p className="text-red-400/60 text-xs">เครดิตไม่พอ (ต้องการ {cartTotal} มี {credits})</p>
                      )}

                      {errorMsg && <p className="text-red-400/80 text-xs">{errorMsg}</p>}

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setStep("shipping"); setErrorMsg(""); }} className="flex-1 py-2.5 rounded-xl bg-[#1e0c0c] text-white/40 text-sm">ย้อนกลับ</button>
                        <button onClick={handleCheckout}
                          disabled={payMethod === "credit" && credits < cartTotal}
                          className="flex-1 py-2.5 rounded-xl bg-gold text-[#1a0a0a] text-sm font-semibold disabled:opacity-30"
                        >ยืนยันสั่งซื้อ ฿{cartTotal}</button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Processing ── */}
                  {step === "processing" && (
                    <motion.div key="proc" className="text-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-white/50 text-sm">กำลังดำเนินการ...</p>
                    </motion.div>
                  )}

                  {/* ── Success ── */}
                  {step === "success" && (
                    <motion.div key="ok" className="text-center py-6 space-y-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                        <span className="text-green-400 text-2xl">&#10003;</span>
                      </div>
                      <h3 className="text-gold text-lg font-semibold">สั่งซื้อสำเร็จ!</h3>
                      <p className="text-white/40 text-xs">หมายเลขออเดอร์: {orderId.slice(0, 8)}</p>

                      {payMethod === "transfer" && (
                        <div className="bg-[#1e0c0c] rounded-xl p-4 text-left space-y-2 mt-2">
                          <p className="text-gold/60 text-[0.65rem] uppercase tracking-wider text-center">กรุณาโอนเงินมาที่</p>
                          {promptPayInfo.number ? (
                            <>
                              <p className="text-gold font-mono text-lg text-center tracking-wider">{promptPayInfo.number}</p>
                              {promptPayInfo.name && <p className="text-white/40 text-xs text-center">{promptPayInfo.name}</p>}
                            </>
                          ) : (
                            <p className="text-white/40 text-xs text-center">ติดต่อแอดมินเพื่อรับข้อมูลการโอนเงิน</p>
                          )}
                          <p className="text-gold text-center font-semibold">฿{cartTotal || "—"}</p>
                          <p className="text-white/25 text-[0.6rem] text-center">โอนแล้วแจ้งแอดมิน ออเดอร์จะถูกยืนยันอัตโนมัติ</p>
                        </div>
                      )}

                      {payMethod === "credit" && (
                        <p className="text-green-400/60 text-xs">หักเครดิตเรียบร้อย</p>
                      )}

                      <Button variant="outline" onClick={() => { setShowCart(false); setStep("browse"); }}>ปิด</Button>
                    </motion.div>
                  )}

                  {/* ── Error ── */}
                  {step === "error" && (
                    <motion.div key="err" className="text-center py-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                        <span className="text-red-400 text-xl">&#10007;</span>
                      </div>
                      <p className="text-white/60 text-sm">{errorMsg}</p>
                      <Button variant="outline" onClick={() => setStep("payment")}>ลองใหม่</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
