import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "@/lib/db";
import { signUserToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = findUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  const token = signUserToken(user.id, user.username);
  const res = NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
  res.cookies.set("amara_token", token, { httpOnly: true, path: "/", maxAge: 7 * 86400, sameSite: "lax" });
  return res;
}
