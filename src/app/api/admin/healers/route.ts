import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllHealers, findHealerById, saveHealer, deleteHealer, type Healer } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const healers = getAllHealers();
  const stats = {
    total: healers.length,
    active: healers.filter((h) => h.active).length,
    totalBookings: healers.reduce((sum, h) => sum + h.totalBookings, 0),
  };

  return NextResponse.json({ healers, stats });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json();
  const healer: Healer = {
    id: crypto.randomUUID(),
    name: body.name || "",
    title: body.title || "อาจารย์",
    pictureUrl: body.pictureUrl || "",
    bio: body.bio || "",
    specialties: body.specialties || [],
    priceCredits: body.priceCredits || 10,
    sessionMinutes: body.sessionMinutes || 30,
    availability: body.availability || [],
    blockedDates: body.blockedDates || [],
    rating: 0,
    totalBookings: 0,
    active: body.active ?? true,
    sortOrder: body.sortOrder ?? 0,
    createdAt: Date.now(),
  };

  saveHealer(healer);
  return NextResponse.json({ ok: true, healer });
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json();
  const existing = findHealerById(body.id);
  if (!existing) return NextResponse.json({ error: "ไม่พบหมอดู" }, { status: 404 });

  const updated: Healer = { ...existing, ...body, createdAt: existing.createdAt };
  saveHealer(updated);
  return NextResponse.json({ ok: true, healer: updated });
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await req.json();
  const ok = deleteHealer(id);
  return NextResponse.json({ ok });
}
