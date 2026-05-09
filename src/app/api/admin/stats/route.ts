import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getOverviewStats, getUserCount, getAllTransactions, getAllBookings,
  getAllHealers, getActiveHealers, getAllUsers, getReadings,
  getTopUpRequestsList, getAllOrders, getAllSubscriptions,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const stats = getOverviewStats();
  const { users } = getAllUsers(9999, 0);
  const userCount = users.length;
  const { transactions } = getAllTransactions(9999, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTs = new Date(today + "T00:00:00").getTime();

  // Users
  const newUsersToday = users.filter(u => u.createdAt >= todayTs).length;
  const newUsersWeek = users.filter(u => u.createdAt >= todayTs - 7 * 86400000).length;
  const totalCreditsHeld = users.reduce((s, u) => s + (u.credits || 0), 0);

  // Revenue
  const successTxns = transactions.filter(t => t.status === "successful");
  const totalRevenue = successTxns.reduce((sum, t) => sum + t.amount / 100, 0);
  const totalCreditsIssued = successTxns.reduce((sum, t) => sum + t.credits, 0);
  const pendingPayments = transactions.filter(t => t.status === "pending").length;
  const todayRevenue = successTxns
    .filter(t => t.completedAt && t.completedAt >= todayTs)
    .reduce((sum, t) => sum + t.amount / 100, 0);

  // Payment method breakdown
  const methodBreakdown: Record<string, { count: number; amount: number }> = {};
  successTxns.forEach(t => {
    if (!methodBreakdown[t.method]) methodBreakdown[t.method] = { count: 0, amount: 0 };
    methodBreakdown[t.method].count++;
    methodBreakdown[t.method].amount += t.amount / 100;
  });

  // Revenue last 7 days
  const revenueLast7: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayStart = new Date(key + "T00:00:00").getTime();
    const dayEnd = dayStart + 86400000;
    const dayAmount = successTxns
      .filter(t => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd)
      .reduce((sum, t) => sum + t.amount / 100, 0);
    revenueLast7.push({ date: key, amount: dayAmount });
  }

  // Booking stats
  const { bookings: allBookings } = getAllBookings(9999, 0);
  const bookingStats = {
    total: allBookings.length,
    todayBookings: allBookings.filter(b => b.date === today).length,
    upcoming: allBookings.filter(b => b.date >= today && (b.status === "confirmed" || b.status === "pending")).length,
    completed: allBookings.filter(b => b.status === "completed").length,
    cancelled: allBookings.filter(b => b.status === "cancelled").length,
    totalCreditsEarned: allBookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.creditCost, 0),
  };

  // Healer stats
  const healerStats = {
    total: getAllHealers().length,
    active: getActiveHealers().length,
  };

  // Top-up requests pending
  const { requests: pendingTopUps } = getTopUpRequestsList("pending", 9999, 0);

  // Orders pending
  const { orders } = getAllOrders(9999, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  // Subscriptions
  const subs = getAllSubscriptions();
  const activeSubs = subs.filter(s => s.status === "active" && s.endDate > Date.now()).length;

  // Recent activity (last 10 items)
  type Activity = { type: string; text: string; time: number; color: string };
  const activities: Activity[] = [];

  // Recent readings
  const { readings } = getReadings(5, 0);
  readings.forEach(r => activities.push({
    type: "reading", text: `ดูดวง "${r.topic}" — ${r.spread}`, time: r.timestamp, color: "#d4af37",
  }));

  // Recent transactions
  transactions.slice(0, 5).forEach(t => activities.push({
    type: "payment",
    text: `${t.username} ${t.status === "successful" ? "ชำระ" : t.status === "pending" ? "รอชำระ" : "ล้มเหลว"} ฿${(t.amount / 100).toLocaleString()}`,
    time: t.createdAt, color: t.status === "successful" ? "#22c55e" : t.status === "pending" ? "#eab308" : "#ef4444",
  }));

  // Recent bookings
  allBookings.slice(0, 5).forEach(b => activities.push({
    type: "booking", text: `จองหมอดู วันที่ ${b.date} เวลา ${b.timeSlot}`, time: b.createdAt, color: "#3b82f6",
  }));

  activities.sort((a, b) => b.time - a.time);

  return NextResponse.json({
    ...stats,
    userCount,
    newUsersToday,
    newUsersWeek,
    totalCreditsHeld,
    totalRevenue,
    todayRevenue,
    totalCreditsIssued,
    pendingPayments,
    methodBreakdown,
    revenueLast7,
    bookingStats,
    healerStats,
    pendingTopUps: pendingTopUps.length,
    pendingOrders,
    activeSubs,
    recentActivity: activities.slice(0, 10),
  });
}
