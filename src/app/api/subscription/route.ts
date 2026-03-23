import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUserSubscription, createSubscription, toggleAutoRenew, SUB_PACKAGES, getUserCredits, addCredits, findUserById } from "@/lib/db";

// GET — current subscription
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ subscription: null, packages: SUB_PACKAGES });
  const sub = getUserSubscription(user.userId);
  return NextResponse.json({ subscription: sub, packages: SUB_PACKAGES, credits: getUserCredits(user.userId) });
}

// POST — subscribe to a package
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { packageId, action } = await req.json();

  // Toggle auto-renew
  if (action === "toggleRenew") {
    const sub = getUserSubscription(user.userId);
    if (!sub) return NextResponse.json({ error: "ไม่มีแพ็กเกจ" }, { status: 400 });
    const newState = toggleAutoRenew(sub.id);
    return NextResponse.json({ ok: true, autoRenew: newState });
  }

  // Subscribe
  if (!packageId || !SUB_PACKAGES[packageId as keyof typeof SUB_PACKAGES]) {
    return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });
  }

  const pkg = SUB_PACKAGES[packageId as keyof typeof SUB_PACKAGES];
  const credits = getUserCredits(user.userId);

  if (credits < pkg.credits) {
    return NextResponse.json({ error: `เครดิตไม่พอ (ต้องการ ${pkg.credits} มี ${credits})`, needCredits: true }, { status: 402 });
  }

  // Deduct credits
  addCredits(user.userId, -pkg.credits);

  // Get LINE user ID
  const dbUser = findUserById(user.userId);
  const lineUserId = dbUser?.lineUserId || "";

  const sub = createSubscription(user.userId, user.username, lineUserId, packageId as keyof typeof SUB_PACKAGES);

  return NextResponse.json({ ok: true, subscription: sub, creditsRemaining: getUserCredits(user.userId) });
}
