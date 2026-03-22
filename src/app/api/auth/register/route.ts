import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername, createUser } from "@/lib/db";
import { signUserToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password || username.length < 3 || password.length < 4) {
    return NextResponse.json({ error: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร และรหัสผ่านอย่างน้อย 4 ตัวอักษร" }, { status: 400 });
  }
  if (findUserByUsername(username)) {
    return NextResponse.json({ error: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser(username, passwordHash);
  const token = signUserToken(user.id, user.username);
  const res = NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
  res.cookies.set("amara_token", token, { httpOnly: true, path: "/", maxAge: 7 * 86400, sameSite: "lax" });
  return res;
}
