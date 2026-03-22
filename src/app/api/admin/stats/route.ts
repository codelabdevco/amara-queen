import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getOverviewStats, getUserCount } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const stats = getOverviewStats();
  const userCount = getUserCount();
  return NextResponse.json({ ...stats, userCount });
}
