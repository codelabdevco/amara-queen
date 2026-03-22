import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllUsers, addCredits, findUserById } from "@/lib/db";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");

function getUsers() {
  const filepath = join(DATA_DIR, "users.json");
  if (!existsSync(filepath)) return [];
  try { return JSON.parse(readFileSync(filepath, "utf-8")); } catch { return []; }
}

function saveUsers(users: unknown[]) {
  writeFileSync(join(DATA_DIR, "users.json"), JSON.stringify(users, null, 2));
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  return NextResponse.json(getAllUsers(limit, offset));
}

// PUT — update user (ban/unban, add credits)
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { userId, action, amount } = await req.json();

  if (action === "addCredits" && userId && typeof amount === "number") {
    const result = addCredits(userId, amount);
    return NextResponse.json(result);
  }

  if (action === "ban" && userId) {
    const users = getUsers();
    const user = users.find((u: { id: string }) => u.id === userId);
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    user.banned = true;
    saveUsers(users);
    return NextResponse.json({ ok: true });
  }

  if (action === "unban" && userId) {
    const users = getUsers();
    const user = users.find((u: { id: string }) => u.id === userId);
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    user.banned = false;
    saveUsers(users);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });
}

// DELETE — delete user
export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { userId } = await req.json();
  const users = getUsers();
  const filtered = users.filter((u: { id: string }) => u.id !== userId);
  if (filtered.length === users.length) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  saveUsers(filtered);
  return NextResponse.json({ ok: true });
}
