import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getReadings, deleteReading, findUserById, getSettings } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const topic = url.searchParams.get("topic") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const userId = url.searchParams.get("userId") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const result = getReadings(limit, offset, { topic, date, userId });

  // Search filter (question text)
  if (search) {
    const q = search.toLowerCase();
    result.readings = result.readings.filter(
      (r) =>
        r.question.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.spread.toLowerCase().includes(q)
    );
    result.total = result.readings.length;
  }

  const settings = getSettings();

  // Enrich readings with user info
  const userCache = new Map<string, { displayName: string; pictureUrl: string; credits: number } | null>();
  const enriched = result.readings.map((r) => {
    let user = null;
    if (r.userId) {
      if (userCache.has(r.userId)) {
        user = userCache.get(r.userId)!;
      } else {
        const dbUser = findUserById(r.userId);
        if (dbUser) {
          user = {
            displayName: dbUser.lineDisplayName || dbUser.profile?.nickname || dbUser.username || "ไม่ระบุ",
            pictureUrl: dbUser.linePictureUrl || "",
            credits: dbUser.credits ?? 0,
          };
        }
        userCache.set(r.userId, user);
      }
    }

    return {
      ...r,
      user,
      creditCost: settings.creditCostTarot,
    };
  });

  return NextResponse.json({ readings: enriched, total: result.total });
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  const deleted = deleteReading(id);
  return NextResponse.json({ deleted });
}
