import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getSettings, getUserCredits, addCredits, findUserById } from "@/lib/db";

export type ServiceName = "tarot" | "gypsy" | "siamsi" | "auspicious" | "general";

export function getServiceCost(service: ServiceName): number {
  const settings = getSettings();
  switch (service) {
    case "tarot": return settings.creditCostTarot;
    case "gypsy": return settings.creditCostGypsy;
    case "siamsi": return settings.creditCostSiamsi;
    case "auspicious": return settings.creditCostAuspicious;
    default: return settings.creditCostPerReading;
  }
}

/**
 * Check credits + deduct. Handles monthly free credits.
 * Returns null if OK, or NextResponse error.
 */
export function requireCredits(req: NextRequest, service: ServiceName = "general"): NextResponse | null {
  const user = getUserFromRequest(req);
  const cost = getServiceCost(service);

  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบเพื่อใช้บริการ", needLogin: true, cost },
      { status: 401 }
    );
  }

  const settings = getSettings();
  const dbUser = findUserById(user.userId);

  // Banned check
  if (dbUser && (dbUser as unknown as { banned?: boolean }).banned) {
    return NextResponse.json(
      { error: "บัญชีของคุณถูกระงับ กรุณาติดต่อแอดมิน" },
      { status: 403 }
    );
  }

  // Monthly free credits
  if (dbUser) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if ((dbUser.lastFreeMonth || "") !== currentMonth) {
      addCredits(user.userId, settings.monthlyFreeCredits);
      // Update lastFreeMonth via direct write
      dbUser.lastFreeMonth = currentMonth;
      // Save is handled by addCredits internally, but lastFreeMonth needs separate save
      // We'll handle this in incrementUserReading which already does it
    }
  }

  const credits = getUserCredits(user.userId);
  if (credits < cost) {
    return NextResponse.json(
      { error: `เครดิตไม่พอ (ต้องการ ${cost} มี ${credits})`, needCredits: true, cost, credits },
      { status: 402 }
    );
  }

  // Deduct
  addCredits(user.userId, -cost);
  return null;
}
