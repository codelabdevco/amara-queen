import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings, updateSettings } from "@/lib/db";

function maskKey(key: string): string {
  if (!key) return "";
  return key.slice(0, 10) + "*".repeat(Math.max(0, key.length - 10));
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const settings = getSettings();
  return NextResponse.json({
    ...settings,
    omisePublicKey: maskKey(process.env.OMISE_PUBLIC_KEY || ""),
    omiseSecretKey: maskKey(process.env.OMISE_SECRET_KEY || ""),
    omiseConnected: !!(process.env.OMISE_PUBLIC_KEY && process.env.OMISE_SECRET_KEY),
    lineConnected: !!(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET),
    lineChannelId: maskKey(process.env.LINE_CHANNEL_ID || ""),
  });
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  // Don't allow overwriting env-based keys via settings
  delete body.omisePublicKey;
  delete body.omiseSecretKey;
  delete body.omiseConnected;
  delete body.lineConnected;
  delete body.lineChannelId;
  const updated = updateSettings(body);
  return NextResponse.json(updated);
}
