import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getOverviewStats, getUserCount, getAllTransactions } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const stats = getOverviewStats();
  const userCount = getUserCount();
  const { transactions } = getAllTransactions(9999, 0);

  const totalRevenue = transactions
    .filter(t => t.status === "successful")
    .reduce((sum, t) => sum + t.amount / 100, 0);
  const totalCreditsIssued = transactions
    .filter(t => t.status === "successful")
    .reduce((sum, t) => sum + t.credits, 0);
  const pendingPayments = transactions.filter(t => t.status === "pending").length;

  // Payment method breakdown
  const methodBreakdown: Record<string, { count: number; amount: number }> = {};
  transactions.filter(t => t.status === "successful").forEach(t => {
    if (!methodBreakdown[t.method]) methodBreakdown[t.method] = { count: 0, amount: 0 };
    methodBreakdown[t.method].count++;
    methodBreakdown[t.method].amount += t.amount / 100;
  });

  return NextResponse.json({
    ...stats,
    userCount,
    totalRevenue,
    totalCreditsIssued,
    pendingPayments,
    methodBreakdown,
  });
}
