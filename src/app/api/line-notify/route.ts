import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

// POST — send LINE message to user
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });

  const { message, lineUserId } = await req.json();
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json({ error: "LINE Messaging API ยังไม่ได้ตั้งค่า", sent: false });
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{
          type: "flex",
          altText: "ดวงประจำวัน — Queen Amara",
          contents: message,
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("LINE push error:", err);
      return NextResponse.json({ error: "ส่ง LINE ไม่สำเร็จ", sent: false });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("LINE notify error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด", sent: false });
  }
}
