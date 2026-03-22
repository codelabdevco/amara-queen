import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { createOrder, getUserOrders, getProducts, getUserCredits, addCredits, getSettings } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const { items, paymentMethod, shippingName, shippingPhone, shippingAddress } = await req.json();

  if (!items?.length) return NextResponse.json({ error: "ไม่มีสินค้า" }, { status: 400 });
  if (!shippingName || !shippingPhone || !shippingAddress) return NextResponse.json({ error: "กรุณากรอกที่อยู่จัดส่ง" }, { status: 400 });

  // Credit payment requires login
  if (paymentMethod === "credit" && !user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบเพื่อใช้เครดิต" }, { status: 401 });
  }

  const products = getProducts();
  let total = 0;
  const orderItems = items.map((item: { productId: string; qty: number }) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error("Product not found");
    total += product.price * item.qty;
    return { productId: product.id, name: product.name, price: product.price, qty: item.qty };
  });

  // Credit payment — deduct
  if (paymentMethod === "credit" && user) {
    const credits = getUserCredits(user.userId);
    if (credits < total) {
      return NextResponse.json({ error: `เครดิตไม่พอ (ต้องการ ${total} มี ${credits})` }, { status: 400 });
    }
    addCredits(user.userId, -total);
  }

  const settings = getSettings();

  const order = {
    id: crypto.randomUUID(),
    userId: user?.userId || "guest",
    username: user?.username || shippingName,
    items: orderItems,
    total,
    paymentMethod: paymentMethod || "transfer",
    paymentStatus: paymentMethod === "credit" ? "paid" as const : "pending" as const,
    shippingName,
    shippingPhone,
    shippingAddress,
    status: "pending" as const,
    trackingNumber: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  createOrder(order);

  return NextResponse.json({
    ok: true,
    order,
    // Send PromptPay info for transfer payment
    promptPayNumber: paymentMethod === "transfer" ? settings.promptPayNumber : undefined,
    promptPayName: paymentMethod === "transfer" ? settings.promptPayName : undefined,
  });
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ orders: [] });
  return NextResponse.json({ orders: getUserOrders(user.userId) });
}
