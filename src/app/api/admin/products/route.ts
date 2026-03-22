import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts, saveProduct, deleteProduct } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ products: getAllProducts() });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const product = await req.json();
  if (!product.id) product.id = crypto.randomUUID();
  saveProduct(product);
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
