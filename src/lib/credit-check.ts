import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getSettings, incrementUserReading, checkGuestLimit } from "@/lib/db";

/**
 * Check if user has credits to use a service.
 * Returns null if allowed, or a NextResponse error if not.
 */
export function requireCredits(req: NextRequest): NextResponse | null {
  const settings = getSettings();
  const user = getUserFromRequest(req);

  if (!user) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const guestCheck = checkGuestLimit(ip);
    if (!guestCheck.allowed) {
      return NextResponse.json(
        { error: "เครดิตฟรีหมดแล้ว สมัครสมาชิกเพื่อเติมเครดิตใช้ต่อ", needCredits: true, needLogin: true },
        { status: 402 }
      );
    }
    return null;
  }

  const usageCheck = incrementUserReading(user.userId);
  if (!usageCheck.allowed) {
    return NextResponse.json(
      { error: `เครดิตหมดแล้ว กรุณาเติมเครดิตเพื่อใช้งานต่อ (ใช้ ${settings.creditCostPerReading} เครดิต/ครั้ง)`, needCredits: true },
      { status: 402 }
    );
  }

  return null;
}
