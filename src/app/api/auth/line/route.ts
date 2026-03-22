import { NextRequest, NextResponse } from "next/server";

const LINE_CLIENT_ID = process.env.LINE_CHANNEL_ID || "";
const REDIRECT_URI = process.env.LINE_CALLBACK_URL || "";

export async function GET(req: NextRequest) {
  if (!LINE_CLIENT_ID || !REDIRECT_URI) {
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    return NextResponse.redirect(new URL("/?error=line_not_configured", `${proto}://${host}`));
  }

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
