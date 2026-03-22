import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getTopUpRequestsList, processTopUpRequest, addCredits } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const result = getTopUpRequestsList(status);
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { requestId, action, userId, manualCredits } = await req.json();

  // Manual credit adjustment
  if (userId && manualCredits) {
    const result = addCredits(userId, manualCredits);
    return NextResponse.json(result);
  }

  // Process top-up request
  if (!requestId || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const result = processTopUpRequest(requestId, action);
  return NextResponse.json(result);
}
