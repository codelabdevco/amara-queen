import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/admin-auth";
import { findUserById } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ user: null });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null });
  if (payload.role === "admin") return NextResponse.json({ user: { role: "admin" } });

  const dbUser = findUserById(payload.userId);
  return NextResponse.json({
    user: {
      role: "user",
      userId: payload.userId,
      username: dbUser?.username || payload.username,
      linePictureUrl: dbUser?.linePictureUrl || null,
      lineDisplayName: dbUser?.lineDisplayName || null,
    }
  });
}
