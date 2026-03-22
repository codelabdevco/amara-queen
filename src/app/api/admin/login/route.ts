import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, signAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  const token = signAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("amara_token", token, { httpOnly: true, path: "/", maxAge: 86400, sameSite: "lax" });
  return res;
}
