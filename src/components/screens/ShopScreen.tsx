"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

/* ── Types ── */
interface Product {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface CartItem extends Product {
  qty: number;
}

/* ── Data ── */
const PRODUCTS: Product[] = [
  { id: "amulet", name: "พระเครื่อง หลวงพ่อโต", price: 199, icon: "☸" },
  { id: "necklace", name: "สร้อยนพเก้า เสริมดวง", price: 299, icon: "◈" },
  { id: "yantra", name: "ยันต์ห้าแถว กันภัย", price: 149, icon: "⬡" },
  { id: "holywater", name: "น้ำมนต์ เสริมโชค", price: 99, icon: "❈" },
  { id: "bag", name: "ถุงเงินถุงทอง", price: 129, icon: "✦" },
  { id: "candle", name: "เทียนชัยมงคล", price: 79, icon: "♦" },
];

/* ── Component ── */
export default function ShopScreen() {
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function handleCheckout() {
    setShowCart(false);
    setShowSuccess(true);
    setCart([]);
  }

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Cart button */}
      <motion.button
        className="fixed top-3 right-3 z-[110] w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:bg-white/10 backdrop-blur-sm"
        style={{ top: "max(12px, env(safe-area-inset-top))" }}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => setShowCart(true)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {cartCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-[0.55rem] text-[#08090e] font-bold flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {cartCount}
          </motion.span>
        )}
      </motion.button>

      {/* Header */}
      <motion.div
        className="text-center mb-5"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <h2 className="text-lg text-gold font-semibold tracking-wide">ร้านค้ามงคล</h2>
        <p className="text-white/25 text-xs mt-1">วัตถุมงคล เครื่องราง ของดี เสริมดวง</p>
      </motion.div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
        {PRODUCTS.map((product, idx) => (
          <motion.div
            key={product.id}
            className="rounded-2xl border border-white/[0.06] bg-[#0c0d14]/90 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05, duration: 0.4, ease: EASE }}
          >
            {/* Image placeholder */}
            <div className="aspect-square bg-[#0a0b12] flex items-center justify-center border-b border-white/[0.04]">
              <span className="text-3xl text-gold/60">{product.icon}</span>
            </div>

            <div className="p-3">
              <p className="text-white/80 text-xs font-medium leading-tight mb-1">{product.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gold text-sm font-semibold">฿{product.price}</span>
                <motion.button
                  className="px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/25 text-gold text-[0.6rem] font-medium active:bg-gold/20"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                >
                  หยิบใส่ตะกร้า
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Cart Panel (slide up) ── */}
      <AnimatePresence>
        {showCart && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[130] bg-[#0c0d14]/98 border-t border-white/10 rounded-t-3xl max-h-[70vh] overflow-y-auto backdrop-blur-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="p-5">
                {/* Handle */}
                <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-4" />

                <h3 className="text-gold text-sm font-semibold mb-4">ตะกร้าสินค้า</h3>

                {cart.length === 0 ? (
                  <p className="text-white/30 text-xs text-center py-8">ยังไม่มีสินค้าในตะกร้า</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-5">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-gold/50 text-lg">{item.icon}</span>
                            <div>
                              <p className="text-white/70 text-xs">{item.name}</p>
                              <p className="text-gold/60 text-[0.65rem]">฿{item.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="w-6 h-6 rounded-full border border-white/15 text-white/40 text-xs flex items-center justify-center active:bg-white/10"
                              onClick={() => updateQty(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="text-white/70 text-xs w-4 text-center">{item.qty}</span>
                            <button
                              className="w-6 h-6 rounded-full border border-white/15 text-white/40 text-xs flex items-center justify-center active:bg-white/10"
                              onClick={() => updateQty(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center border-t border-white/[0.06] pt-3 mb-5">
                      <span className="text-white/40 text-xs">รวมทั้งหมด</span>
                      <span className="text-gold text-base font-semibold">฿{cartTotal}</span>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleCheckout}>ชำระเงิน</Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Success overlay ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0c0d14] border border-white/10 rounded-2xl p-8 flex flex-col items-center max-w-xs mx-4"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-gold text-sm font-semibold mb-1">สั่งซื้อสำเร็จ!</p>
              <p className="text-white/35 text-xs text-center mb-5">ขอบคุณที่อุดหนุน ขอให้โชคดี</p>
              <Button variant="outline" onClick={() => setShowSuccess(false)}>ปิด</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
