"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

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
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setOrders(data.orders ?? []);
          setTotal(data.total ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

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
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status, trackingNumber: trackingNumber ?? o.trackingNumber } : o
          )
        );
      }
    } catch {
      /* silent */
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">คำสั่งซื้อ</h2>
          <span className="text-white/30 text-sm">{orders.length} รายการ</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">คำสั่งซื้อทั้งหมด</p>
            <p className="text-gold text-xl font-semibold mt-1">{orders.length}</p>
          </div>
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">รอดำเนินการ</p>
            <p className="text-yellow-400 text-xl font-semibold mt-1">{pendingCount}</p>
          </div>
          <div className="bg-[#2a1215] rounded-xl p-4">
            <p className="text-white/30 text-[0.6rem] uppercase tracking-wider">รายได้รวม</p>
            <p className="text-green-400 text-xl font-semibold mt-1">฿{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-white/30 text-center py-20">กำลังโหลด...</div>
        ) : orders.length === 0 ? (
          <div className="text-white/30 text-center py-20">ยังไม่มีคำสั่งซื้อ</div>
        ) : (
          <div className="bg-[#2a1215] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-[0.6rem] uppercase tracking-wider border-b border-white/5">
                  <th className="text-left px-4 py-3">วันที่</th>
                  <th className="text-left px-4 py-3">ผู้สั่ง</th>
                  <th className="text-center px-4 py-3">รายการ</th>
                  <th className="text-right px-4 py-3">ยอดรวม</th>
                  <th className="text-center px-4 py-3">ชำระเงิน</th>
                  <th className="text-center px-4 py-3">สถานะ</th>
                  <th className="text-center px-4 py-3">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    expanded={expanded === order.id}
                    updating={updating === order.id}
                    trackingInput={trackingInputs[order.id] ?? order.trackingNumber ?? ""}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                    onTrackingChange={(v) => setTrackingInputs((p) => ({ ...p, [order.id]: v }))}
                    onStatusChange={(status) => updateOrder(order.id, status, trackingInputs[order.id])}
                    onSaveTracking={() => updateOrder(order.id, order.status, trackingInputs[order.id])}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  updating,
  trackingInput,
  onToggle,
  onTrackingChange,
  onStatusChange,
  onSaveTracking,
  formatDate,
  formatCurrency,
}: {
  order: Order;
  expanded: boolean;
  updating: boolean;
  trackingInput: string;
  onToggle: () => void;
  onTrackingChange: (v: string) => void;
  onStatusChange: (s: Order["status"]) => void;
  onSaveTracking: () => void;
  formatDate: (ts: number) => string;
  formatCurrency: (n: number) => string;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-white/50">{formatDate(order.createdAt)}</td>
        <td className="px-4 py-3 text-white/80">{order.username}</td>
        <td className="px-4 py-3 text-center text-white/50">{itemCount} ชิ้น</td>
        <td className="px-4 py-3 text-right text-gold">฿{formatCurrency(order.total)}</td>
        <td className="px-4 py-3 text-center">
          <span className="text-white/50 text-xs">{order.paymentMethod}</span>
          <span className={`ml-1 text-xs ${order.paymentStatus === "paid" ? "text-green-400" : "text-yellow-400"}`}>
            ({order.paymentStatus})
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${STATUS_BADGE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-white/30 text-xs">{expanded ? "▲" : "▼"}</span>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-[#1e0c0c]">
            <div className="grid grid-cols-2 gap-6">
              {/* Items */}
              <div>
                <p className="text-white/30 text-[0.6rem] uppercase tracking-wider mb-2">รายการสินค้า</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-white/70">{item.name} x{item.qty}</span>
                      <span className="text-gold">฿{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t border-white/10 pt-1 mt-2">
                    <span className="text-white/50 font-medium">รวม</span>
                    <span className="text-gold font-semibold">฿{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p className="text-white/30 text-[0.6rem] uppercase tracking-wider mb-2">ที่อยู่จัดส่ง</p>
                <p className="text-white/70 text-sm">{order.shippingName}</p>
                <p className="text-white/50 text-sm">{order.shippingPhone}</p>
                <p className="text-white/50 text-sm mt-1">{order.shippingAddress}</p>
              </div>

              {/* Status update */}
              <div>
                <p className="text-white/30 text-[0.6rem] uppercase tracking-wider mb-2">อัปเดตสถานะ</p>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(e.target.value as Order["status"])}
                    disabled={updating}
                    className="bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  {updating && <span className="text-white/30 text-xs">กำลังบันทึก...</span>}
                </div>
              </div>

              {/* Tracking */}
              <div>
                <p className="text-white/30 text-[0.6rem] uppercase tracking-wider mb-2">เลขพัสดุ</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => onTrackingChange(e.target.value)}
                    placeholder="กรอกเลขพัสดุ"
                    className="bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-1.5 flex-1 focus:outline-none focus:border-gold/50 placeholder:text-white/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onSaveTracking(); }}
                    disabled={updating}
                    className="px-3 py-1.5 bg-gold/10 text-gold text-sm rounded-lg hover:bg-gold/20 transition-colors disabled:opacity-50"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
