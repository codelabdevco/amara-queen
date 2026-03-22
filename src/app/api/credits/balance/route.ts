import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUserCredits, getSettings, findUserById } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ credits: 0, loggedIn: false });
  const credits = getUserCredits(user.userId);
  const settings = getSettings();
  const dbUser = findUserById(user.userId);
  const today = new Date().toISOString().slice(0, 10);
  const readingsToday = dbUser?.lastReadingDate === today ? dbUser.readingsToday : 0;
  const freeRemaining = Math.max(0, settings.dailyFreeLimit - readingsToday);
  return NextResponse.json({
    credits,
    loggedIn: true,
    freeRemaining,
    dailyFreeLimit: settings.dailyFreeLimit,
    creditCost: settings.creditCostPerReading,
    packages: settings.creditPackages,
    promptPayNumber: settings.promptPayNumber,
    promptPayName: settings.promptPayName,
  });
}
