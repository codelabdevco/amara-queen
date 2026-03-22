import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { findTransaction } from "@/lib/db";

// GET — check charge status (polling from frontend)
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });

  const chargeId = new URL(req.url).searchParams.get("chargeId");
  if (!chargeId) return NextResponse.json({ error: "ไม่มี chargeId" }, { status: 400 });

  const txn = findTransaction(chargeId);
  if (!txn || txn.userId !== user.userId) {
    return NextResponse.json({ status: "not_found" });
  }

  return NextResponse.json({
    status: txn.status,
    credits: txn.credits,
    completedAt: txn.completedAt,
  });
}
