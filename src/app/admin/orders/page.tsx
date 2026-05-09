"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Icon from "@/components/ui/Icon";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  userId: string;
  username: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  createdAt: number;
}

const STATUS_OPTIONS: Order["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_BADGE: Record<Order["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  shipped: "bg-purple-500/10 text-purple-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งถึงแล้ว",
  cancelled: "ยกเลิก",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setOrders(data.orders ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    let result = orders;
    if (filterStatus) result = result.filter(o => o.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.username?.toLowerCase().includes(q) || o.shippingName?.toLowerCase().includes(q));
    }
    return result;
  }, [orders, filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paged = filtered.slice((page - 1) * limit, page * limit);

  useEffect(() => { setPage(1); }, [filterStatus, search]);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function formatCurrency(n: number) {
    return n.toLocaleString("th-TH", { minimumFractionDigits: 0 });
  }

  async function updateOrder(orderId: string, status: Order["status"], trackingNumber?: string) {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, trackingNumber: trackingNumber ?? "" }),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, trackingNumber: trackingNumber ?? o.trackingNumber } : o));
      }
    } catch {} finally { setUpdating(null); }
  }

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const shippedCount = orders.filter(o => o.status === "shipped").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">คำสั่งซื้อ</h2>
            <p className="text-white/30 text-sm mt-1">{orders.length} รายการ</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">ทั้งหมด</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">{orders.length}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">รอดำเนินการ</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">จัดส่งแล้ว</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{shippedCount}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">ส่งถึงแล้ว</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{deliveredCount}</p>
          </div>
          <div className="bg-[#111111] rounded-xl p-4">
            <p className="text-white/30 text-xs">รายได้รวม</p>
            <p className="text-2xl font-bold text-[#d4af37] mt-1">฿{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้สั่ง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/30 w-56"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-[#d4af37]/30"
          >
            <option value="">ทุกสถานะ</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          {(filterStatus || search) && (
            <button onClick={() => { setFilterStatus(""); setSearch(""); }} className="text-white/30 hover:text-white/60 text-xs transition-colors">
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : paged.length === 0 ? (
          <div className="bg-[#111111] rounded-xl p-10 text-center text-white/20 text-sm">
            {search || filterStatus ? "ไม่พบคำสั่งซื้อ" : "ยังไม่มีคำสั่งซื้อ"}
          </div>
        ) : (
          <>
            <div className="bg-[#111111] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[140px_1fr_80px_100px_90px_100px_40px] gap-3 px-5 py-3 text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                <span>วันที่</span>
                <span>ผู้สั่ง</span>
                <span className="text-center">รายการ</span>
                <span className="text-right">ยอดรวม</span>
                <span className="text-center">ชำระ</span>
                <span className="text-center">สถานะ</span>
                <span></span>
              </div>

              {paged.map((order) => {
                const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <div key={order.id}>
                    <div
                      className="grid grid-cols-[140px_1fr_80px_100px_90px_100px_40px] gap-3 px-5 py-3 text-sm hover:bg-[#d4af37]/[0.02] cursor-pointer transition-colors items-center border-b border-white/[0.03]"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      <span className="text-white/30 text-xs">{formatDate(order.createdAt)}</span>
                      <span className="text-white/70 truncate">{order.username}</span>
                      <span className="text-center text-white/50 text-xs">{itemCount} ชิ้น</span>
                      <span className="text-right text-[#d4af37] text-xs font-mono">฿{formatCurrency(order.total)}</span>
                      <span className="text-center">
                        <span className={`text-xs ${order.paymentStatus === "paid" ? "text-green-400" : "text-yellow-400"}`}>
                          {order.paymentStatus === "paid" ? "ชำระแล้ว" : "รอชำระ"}
                        </span>
                      </span>
                      <span className="text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${STATUS_BADGE[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </span>
                      <span className="text-center">
                        <Icon name={expanded === order.id ? "chevron-up" : "chevron-down"} size={12} className="text-white/20" />
                      </span>
                    </div>

                    {expanded === order.id && (
                      <div className="px-5 py-4 bg-white/[0.01] border-b border-white/[0.03]">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-white/30 text-xs mb-2">รายการสินค้า</p>
                              <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-white/70">{item.name} x{item.qty}</span>
                                    <span className="text-[#d4af37]/70 text-xs font-mono">฿{formatCurrency(item.price * item.qty)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-sm border-t border-white/5 pt-1 mt-2">
                                  <span className="text-white/50">รวม</span>
                                  <span className="text-[#d4af37] font-mono">฿{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-white/30 text-xs mb-2">ที่อยู่จัดส่ง</p>
                              <p className="text-white/70 text-sm">{order.shippingName}</p>
                              <p className="text-white/50 text-sm">{order.shippingPhone}</p>
                              <p className="text-white/40 text-sm mt-1">{order.shippingAddress}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-white/30 text-xs mb-2">อัปเดตสถานะ</p>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrder(order.id, e.target.value as Order["status"], trackingInputs[order.id])}
                                disabled={updating === order.id}
                                className="bg-[#0a0a0a] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#d4af37]/30 w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {STATUS_OPTIONS.map(s => (
                                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <p className="text-white/30 text-xs mb-2">เลขพัสดุ</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={trackingInputs[order.id] ?? order.trackingNumber ?? ""}
                                  onChange={(e) => setTrackingInputs(p => ({ ...p, [order.id]: e.target.value }))}
                                  placeholder="กรอกเลขพัสดุ"
                                  className="bg-[#0a0a0a] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1.5 flex-1 focus:outline-none focus:border-[#d4af37]/30 placeholder:text-white/20"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateOrder(order.id, order.status, trackingInputs[order.id]); }}
                                  disabled={updating === order.id}
                                  className="px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] text-sm rounded-lg hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30"
                                >
                                  บันทึก
                                </button>
                              </div>
                            </div>

                            {updating === order.id && (
                              <p className="text-white/30 text-xs">กำลังบันทึก...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">ก่อนหน้า</button>
                <span className="text-white/40 text-sm px-3">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">ถัดไป</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
