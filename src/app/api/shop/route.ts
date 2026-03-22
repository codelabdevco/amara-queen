import { NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ products: getProducts() });
}
