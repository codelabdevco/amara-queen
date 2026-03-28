import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUserCreditTransactions } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบเพื่อดูประวัติ" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const limitParam = parseInt(url.searchParams.get("limit") || "50");
    const limit = Math.min(Math.max(limitParam, 1), 100); // จำกัด 1-100 records
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);

    const result = getUserCreditTransactions(user.userId, limit, offset);

    return NextResponse.json({
      transactions: result.transactions,
      total: result.total,
    });
  } catch (error) {
    console.error("Credits history API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงประวัติ" },
      { status: 500 }
    );
  }
}