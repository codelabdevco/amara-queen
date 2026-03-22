import { NextRequest, NextResponse } from "next/server";
import omise from "@/lib/omise";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getSettings, createTransaction, findUserById, getPaymentHistory } from "@/lib/db";

// POST — create a charge (PromptPay QR or card)
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { packageIndex, token } = await req.json();
  const settings = getSettings();

  const pkg = settings.creditPackages[packageIndex];
  if (!pkg) return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });

  const amountSatang = pkg.price * 100; // THB to satang
  const dbUser = findUserById(user.userId);

  try {
    let charge;

    if (token) {
      // Card payment — charge directly with token from Omise.js
      charge = await omise.charges.create({
        amount: amountSatang,
        currency: "THB",
        card: token,
        description: `Amara Queen - ${pkg.credits} credits for ${user.username}`,
        metadata: { userId: user.userId, credits: pkg.credits },
      });
    } else {
      // PromptPay — create source then charge
      const source = await omise.sources.create({
        type: "promptpay",
        amount: amountSatang,
        currency: "THB",
      });

      charge = await omise.charges.create({
        amount: amountSatang,
        currency: "THB",
        source: source.id,
        description: `Amara Queen - ${pkg.credits} credits for ${user.username}`,
        metadata: { userId: user.userId, credits: pkg.credits },
        return_uri: `${req.headers.get("origin") || ""}/?payment=complete`,
      });
    }

    // Save transaction
    createTransaction({
      id: crypto.randomUUID(),
      userId: user.userId,
      username: dbUser?.username || user.username,
      chargeId: charge.id,
      method: token ? "card" : "promptpay",
      amount: amountSatang,
      credits: pkg.credits,
      status: charge.status === "successful" ? "successful" : "pending",
      createdAt: Date.now(),
      completedAt: charge.status === "successful" ? Date.now() : undefined,
      qrCodeUrl: charge.source?.scannable_code?.image?.download_uri || undefined,
    });

    // If card payment was instant success, add credits now
    if (charge.status === "successful") {
      const { addCredits } = await import("@/lib/db");
      addCredits(user.userId, pkg.credits);
    }

    return NextResponse.json({
      chargeId: charge.id,
      status: charge.status,
      authorizeUri: charge.authorize_uri || null,
      qrCodeUrl: charge.source?.scannable_code?.image?.download_uri || null,
      credits: pkg.credits,
      amount: pkg.price,
    });
  } catch (error: unknown) {
    console.error("Payment error:", error);
    const message = error instanceof Error ? error.message : "ไม่สามารถสร้างรายการชำระเงินได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — payment history
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ history: [] });
  const history = getPaymentHistory(user.userId);
  return NextResponse.json({ history });
}
