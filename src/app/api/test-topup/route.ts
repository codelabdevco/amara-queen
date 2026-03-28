import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getUserFromRequest } from "@/lib/admin-auth";
import { addCredits, findUserById } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Require admin authentication
  const adminCheck = requireAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { amount, reason } = body;

    // Validate input
    if (typeof amount !== "number" || amount < 1 || amount > 1000) {
      return NextResponse.json({ error: "จำนวนเครดิตไม่ถูกต้อง (1-1000)" }, { status: 400 });
    }

    // Get user from request context (the one using the modal)
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 400 });
    }

    // Verify user exists in database
    const dbUser = findUserById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้ในระบบ" }, { status: 404 });
    }

    // Add credits to user
    const result = addCredits(user.userId, amount, reason || "เทสเติมเครดิต (Admin)", "test");

    if (!result.success) {
      return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "เติมเครดิตสำเร็จ",
      newBalance: result.newBalance,
      addedAmount: amount,
    });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}