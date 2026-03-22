import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getSavedAddresses, saveAddress, deleteAddress } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ addresses: [] });
  return NextResponse.json({ addresses: getSavedAddresses(user.userId) });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const body = await req.json();
  const address = {
    id: body.id || crypto.randomUUID(),
    label: body.label || "ที่อยู่หลัก",
    name: body.name || "",
    phone: body.phone || "",
    address: body.address || "",
    district: body.district || "",
    subDistrict: body.subDistrict || "",
    province: body.province || "",
    postalCode: body.postalCode || "",
    isDefault: body.isDefault ?? true,
  };
  const addresses = saveAddress(user.userId, address);
  return NextResponse.json({ ok: true, addresses });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const { id } = await req.json();
  const addresses = deleteAddress(user.userId, id);
  return NextResponse.json({ ok: true, addresses });
}
