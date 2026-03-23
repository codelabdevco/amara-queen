import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "amara-secret-change-me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export interface AdminPayload {
  role: "admin";
  iat: number;
}

export interface UserPayload {
  role: "user";
  userId: string;
  username: string;
  iat: number;
}

type TokenPayload = AdminPayload | UserPayload;

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" } as AdminPayload, JWT_SECRET, { expiresIn: "24h" });
}

export function signUserToken(userId: string, username: string): string {
  return jwt.sign({ role: "user", userId, username } as UserPayload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get("amara_token");
  if (cookie) return cookie.value;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  // Check admin cookie first, then shared cookie
  const adminCookie = req.cookies.get("amara_admin_token");
  const token = adminCookie?.value || getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  return null;
}

export function getUserFromRequest(req: NextRequest): UserPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "user") return null;
  return payload as UserPayload;
}
