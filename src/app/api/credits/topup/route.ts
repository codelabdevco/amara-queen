import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { createTopUpRequest, getUserTopUpRequests } from "@/lib/db";
import { getSettings } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const settings = getSettings();
  const { credits, price, paymentRef } = await req.json();
  const validPackage = settings.creditPackages.find((p: { credits: number; price: number }) => p.credits === credits && p.price === price);
  if (!validPackage) return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });
  if (!credits || !price || !paymentRef) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  const request = createTopUpRequest(user.userId, user.username, credits, price, paymentRef);
  return NextResponse.json({ ok: true, request });
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ requests: [] });
  const requests = getUserTopUpRequests(user.userId);
  return NextResponse.json({ requests });
}
