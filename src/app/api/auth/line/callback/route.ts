import { NextRequest, NextResponse } from "next/server";
import { findUserByLineId, createLineUser } from "@/lib/db";
import { signUserToken } from "@/lib/admin-auth";

const LINE_CLIENT_ID = process.env.LINE_CHANNEL_ID || "";
const LINE_CLIENT_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const REDIRECT_URI = process.env.LINE_CALLBACK_URL || "";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.cookies.get("line_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=line_auth_failed", req.url));
  }

  try {
    // Exchange code for access token
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
      return NextResponse.redirect(new URL("/?error=line_token_failed", req.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get user profile
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/?error=line_profile_failed", req.url));
    }

    const profile = await profileRes.json();
    const lineUserId = profile.userId;
    const displayName = profile.displayName;
    const pictureUrl = profile.pictureUrl || "";

    // Find or create user
    let user = findUserByLineId(lineUserId);
    if (!user) {
      user = createLineUser(lineUserId, displayName, pictureUrl);
    }

    // Sign JWT
    const token = signUserToken(user.id, user.username);
    const needProfile = !user.profile?.birthdate;

    const res = NextResponse.redirect(new URL(needProfile ? "/?setup=profile" : "/", req.url));
    res.cookies.set("amara_token", token, { httpOnly: true, path: "/", maxAge: 30 * 86400, sameSite: "lax" });
    res.cookies.delete("line_state");
    return res;
  } catch (error) {
    console.error("LINE callback error:", error);
    return NextResponse.redirect(new URL("/?error=line_error", req.url));
  }
}
