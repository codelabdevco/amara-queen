import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getTopUpRequestsList, processTopUpRequest, addCredits, findUserById } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const result = getTopUpRequestsList(status, limit, offset);

  // Calculate stats from all requests (unfiltered)
  const all = getTopUpRequestsList(undefined, 9999, 0);
  const totalPending = all.requests.filter((r) => r.status === "pending").length;
  const approved = all.requests.filter((r) => r.status === "approved");
  const rejected = all.requests.filter((r) => r.status === "rejected");
  const totalIssued = approved.reduce((sum, r) => sum + r.credits, 0);
  const totalRevenue = approved.reduce((sum, r) => sum + r.price, 0);

  // Enrich with user info
  const userCache = new Map<string, { displayName: string; pictureUrl: string; credits: number } | null>();
  const enriched = result.requests.map((r) => {
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
    return { ...r, user };
  });

  return NextResponse.json({
    requests: enriched,
    total: result.total,
    stats: {
      totalPending,
      totalApproved: approved.length,
      totalRejected: rejected.length,
      totalIssued,
      totalRevenue,
    },
  });
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
