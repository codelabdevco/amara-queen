import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts, saveProduct, deleteProduct, getCategories, saveCategories } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ products: getAllProducts(), categories: getCategories() });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();

  // Category management
  if (body._action === "saveCategories") {
    saveCategories(body.categories);
    return NextResponse.json({ ok: true, categories: body.categories });
  }

  // Product save
  const product = body;
  if (!product.id) product.id = crypto.randomUUID();
  if (!product.sku) product.sku = "";
  if (!product.images) product.images = [];
  if (!product.longDescription) product.longDescription = "";
  if (product.salePrice === undefined) product.salePrice = 0;
  if (product.weight === undefined) product.weight = 0;
  if (product.sortOrder === undefined) product.sortOrder = 0;
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
