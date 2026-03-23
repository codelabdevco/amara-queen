import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getSettings, getUserCredits, addCredits, findUserById } from "@/lib/db";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export type ServiceName = "tarot" | "gypsy" | "siamsi" | "auspicious" | "general";

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");

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

function giveMonthlyCreditsIfNeeded(userId: string): void {
  const settings = getSettings();
  const filepath = join(DATA_DIR, "users.json");
  if (!existsSync(filepath)) return;

  try {
    const users = JSON.parse(readFileSync(filepath, "utf-8"));
    const user = users.find((u: { id: string }) => u.id === userId);
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    if ((user.lastFreeMonth || "") !== currentMonth) {
      user.credits = (user.credits || 0) + settings.monthlyFreeCredits;
      user.lastFreeMonth = currentMonth;
      writeFileSync(filepath, JSON.stringify(users, null, 2));
    }
  } catch {}
}

export function requireCredits(req: NextRequest, service: ServiceName = "general"): NextResponse | null {
  const user = getUserFromRequest(req);
  const cost = getServiceCost(service);

  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบเพื่อใช้บริการ", needLogin: true, cost },
      { status: 401 }
    );
  }

  const dbUser = findUserById(user.userId);

  // Banned check
  if (dbUser && (dbUser as unknown as { banned?: boolean }).banned) {
    return NextResponse.json({ error: "บัญชีของคุณถูกระงับ กรุณาติดต่อแอดมิน" }, { status: 403 });
  }

  // Monthly free credits (properly saved)
  giveMonthlyCreditsIfNeeded(user.userId);

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
