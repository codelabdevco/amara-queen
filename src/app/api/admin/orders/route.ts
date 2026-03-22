import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllOrders, updateOrder } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  return NextResponse.json(getAllOrders(limit, offset));
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { orderId, status, trackingNumber } = await req.json();
  const updated = updateOrder(orderId, { status, trackingNumber });
  return NextResponse.json({ ok: !!updated, order: updated });
}
