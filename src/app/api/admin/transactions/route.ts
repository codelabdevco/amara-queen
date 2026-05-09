import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllTransactions, findUserById } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const status = url.searchParams.get("status") || undefined;
  const method = url.searchParams.get("method") || undefined;
  const dateFrom = url.searchParams.get("dateFrom") || undefined;
  const dateTo = url.searchParams.get("dateTo") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const result = getAllTransactions(limit, offset);

  let filtered = result.transactions;

  if (status) filtered = filtered.filter((t) => t.status === status);
  if (method) filtered = filtered.filter((t) => t.method === method);
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    filtered = filtered.filter((t) => t.createdAt >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime() + 86400000;
    filtered = filtered.filter((t) => t.createdAt < to);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.username?.toLowerCase().includes(q));
  }

  // Enrich with user info
  const userCache = new Map<string, { displayName: string; pictureUrl: string; credits: number } | null>();
  const enriched = filtered.map((t) => {
    let user = null;
    if (t.userId) {
      if (userCache.has(t.userId)) {
        user = userCache.get(t.userId)!;
      } else {
        const dbUser = findUserById(t.userId);
        if (dbUser) {
          user = {
            displayName: dbUser.lineDisplayName || dbUser.profile?.nickname || dbUser.username || "ไม่ระบุ",
            pictureUrl: dbUser.linePictureUrl || "",
            credits: dbUser.credits ?? 0,
          };
        }
        userCache.set(t.userId, user);
      }
    }
    return { ...t, user };
  });

  return NextResponse.json({ transactions: enriched, total: filtered.length });
}
