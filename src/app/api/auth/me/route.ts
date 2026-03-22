import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ user: null });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null });
  if (payload.role === "admin") return NextResponse.json({ user: { role: "admin" } });
  return NextResponse.json({ user: { role: "user", userId: payload.userId, username: payload.username } });
}
