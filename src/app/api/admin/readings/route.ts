import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getReadings, deleteReading } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const topic = url.searchParams.get("topic") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const userId = url.searchParams.get("userId") || undefined;
  const result = getReadings(limit, offset, { topic, date, userId });
  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  const deleted = deleteReading(id);
  return NextResponse.json({ deleted });
}
