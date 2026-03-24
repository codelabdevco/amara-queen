import { NextRequest, NextResponse } from "next/server";
import { findUserByLineId, createLineUser } from "@/lib/db";
import { signUserToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const LINE_CLIENT_ID = process.env.LINE_CHANNEL_ID || "";
const LINE_CLIENT_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const REDIRECT_URI = process.env.LINE_CALLBACK_URL || "";

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.cookies.get("line_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=line_auth_failed", baseUrl));
  }

  try {
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINE_CLIENT_ID,
        client_secret: LINE_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      console.error("LINE token error:", await tokenRes.text());
      return NextResponse.redirect(new URL("/?error=line_token_failed", baseUrl));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/?error=line_profile_failed", baseUrl));
    }

    const profile = await profileRes.json();
    const lineUserId = profile.userId;
    const displayName = profile.displayName;
    const pictureUrl = profile.pictureUrl || "";

    let user = findUserByLineId(lineUserId);
    if (!user) {
      user = createLineUser(lineUserId, displayName, pictureUrl);
    }

    const token = signUserToken(user.id, user.username);
    const needProfile = !user.profile?.birthdate;

    const res = NextResponse.redirect(new URL(needProfile ? "/?setup=profile" : "/home", baseUrl));
    res.cookies.set("amara_token", token, { httpOnly: true, path: "/", maxAge: 30 * 86400, sameSite: "lax" });
    res.cookies.delete("line_state");
    return res;
  } catch (error) {
    console.error("LINE callback error:", error);
    return NextResponse.redirect(new URL("/?error=line_error", baseUrl));
  }
}
