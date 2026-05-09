import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getSettings, getUserCredits, addCredits, findUserById } from "@/lib/db";

export type ServiceName = "tarot" | "gypsy" | "siamsi" | "auspicious" | "calendar" | "numerology" | "general";

export function getServiceCost(service: ServiceName): number {
  const settings = getSettings();
  switch (service) {
    case "tarot": return settings.creditCostTarot;
    case "gypsy": return settings.creditCostGypsy;
    case "siamsi": return settings.creditCostSiamsi;
    case "auspicious": return settings.creditCostAuspicious;
    case "calendar": return settings.creditCostCalendar ?? 1;
    case "numerology": return settings.creditCostNumerology ?? 1;
    default: return settings.creditCostPerReading;
  }
}

/** Check credits without deducting. Also grants monthly free credits. */
export function checkCredits(req: NextRequest, service: ServiceName = "general"): NextResponse | null {
  const user = getUserFromRequest(req);
  const cost = getServiceCost(service);

  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบเพื่อใช้บริการ", needLogin: true, cost },
      { status: 401 }
    );
  }

  const dbUser = findUserById(user.userId);
  if (dbUser && (dbUser as unknown as { banned?: boolean }).banned) {
    return NextResponse.json({ error: "บัญชีของคุณถูกระงับ" }, { status: 403 });
  }

  // Monthly free credits — single source of truth
  const settings = getSettings();
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (dbUser && (dbUser.lastFreeMonth || "") !== currentMonth) {
    addCredits(user.userId, settings.monthlyFreeCredits);
    // Update lastFreeMonth via addCredits side-effect is not enough, need direct update
    // This is handled inside addCredits now
  }

  const credits = getUserCredits(user.userId);
  if (credits < cost) {
    return NextResponse.json(
      { error: `เครดิตไม่พอ (ต้องการ ${cost} มี ${credits})`, needCredits: true, cost, credits },
      { status: 402 }
    );
  }

  return null; // OK to proceed
}

/** Deduct credits after service succeeds. Call this AFTER AI call completes. */
export function deductCredits(req: NextRequest, service: ServiceName = "general"): void {
  const user = getUserFromRequest(req);
  if (!user) return;
  const cost = getServiceCost(service);
  addCredits(user.userId, -cost);
}

/** Legacy: check + deduct in one call (for backward compat, but prefer checkCredits + deductCredits) */
export function requireCredits(req: NextRequest, service: ServiceName = "general"): NextResponse | null {
  const err = checkCredits(req, service);
  if (err) return err;
  deductCredits(req, service);
  return null;
}
