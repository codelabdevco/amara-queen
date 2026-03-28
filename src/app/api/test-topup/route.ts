import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { addCredits } from "@/lib/db";

export async function POST(req: NextRequest) {
  // เฉพาะ development mode หรือเมื่อเปิดใช้งาน test topup เท่านั้น
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTestEnabled = process.env.NEXT_PUBLIC_ENABLE_TEST_TOPUP === 'true';

  if (!isDevelopment && !isTestEnabled) {
    return NextResponse.json({ error: "API นี้ใช้ได้เฉพาะ development mode หรือเมื่อเปิดใช้งาน test topup เท่านั้น" }, { status: 403 });
  }

  // ตรวจสอบ user token
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const { packageIndex } = await req.json();

    // กำหนดแพ็กเกจเครดิต (ตรงกับที่มีใน CreditBadge)
    const packages = [
      { credits: 100, price: 50 },
      { credits: 250, price: 120 },
      { credits: 600, price: 250 }
    ];

    if (packageIndex < 0 || packageIndex >= packages.length) {
      return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });
    }

    const selectedPackage = packages[packageIndex];

    // เพิ่มเครดิตโดยตรงโดยไม่ต้องชำระเงิน (สำหรับทดสอบ)
    const result = addCredits(user.userId, selectedPackage.credits);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "เกิดข้อผิดพลาด" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credits: selectedPackage.credits,
      newBalance: result.newBalance,
      message: `เพิ่มเครดิต ${selectedPackage.credits} เครดิต สำเร็จ (TEST MODE)`
    });

  } catch (error) {
    console.error("Test topup error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}