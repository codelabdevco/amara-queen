import { NextRequest, NextResponse } from "next/server";
import { completeTransaction } from "@/lib/db";

// Omise sends webhooks when charge status changes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body;

    // Verify this is a charge event
    if (event.key !== "charge.complete") {
      return NextResponse.json({ ok: true });
    }

    const charge = event.data;
    const chargeId = charge.id;
    const status = charge.status;

    if (status === "successful") {
      completeTransaction(chargeId, "successful");
      console.log(`Payment successful: ${chargeId}`);
    } else if (status === "failed") {
      completeTransaction(chargeId, "failed");
      console.log(`Payment failed: ${chargeId}`);
    } else if (status === "expired") {
      completeTransaction(chargeId, "expired");
      console.log(`Payment expired: ${chargeId}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
