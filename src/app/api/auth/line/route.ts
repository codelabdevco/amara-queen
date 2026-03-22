import { NextRequest, NextResponse } from "next/server";
import { findUserByLineId, createLineUser } from "@/lib/db";
import { signUserToken } from "@/lib/admin-auth";

const LINE_CLIENT_ID = process.env.LINE_CHANNEL_ID || "";
const REDIRECT_URI = process.env.LINE_CALLBACK_URL || "";

export async function GET(req: NextRequest) {
  // If LINE is configured, redirect to real LINE OAuth
  if (LINE_CLIENT_ID && REDIRECT_URI) {
    const state = crypto.randomUUID();
    const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", LINE_CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "profile openid");

    const res = NextResponse.redirect(url.toString());
    res.cookies.set("line_state", state, { httpOnly: true, path: "/", maxAge: 600, sameSite: "lax" });
    return res;
  }

  // Demo mode: simulate LINE login
  const demoLineId = "line_demo_" + crypto.randomUUID().slice(0, 8);
  let user = findUserByLineId(demoLineId);
  if (!user) {
    user = createLineUser(demoLineId, "LINE User", "");
  }

  const token = signUserToken(user.id, user.username);
  const needProfile = !user.profile?.birthdate;

  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;
  const res = NextResponse.redirect(new URL(needProfile ? "/?setup=profile" : "/", baseUrl));
  res.cookies.set("amara_token", token, { httpOnly: true, path: "/", maxAge: 30 * 86400, sameSite: "lax" });
  return res;
}
