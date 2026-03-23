import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSettings, getUserProfile } from "@/lib/db";
import { getUserFromRequest } from "@/lib/admin-auth";
import { calculateZodiac } from "@/lib/zodiac";
import { requireCredits } from "@/lib/credit-check";

const client = new Anthropic();

// POST — get AI daily fortune for a specific date
export async function POST(req: NextRequest) {
  try {
    // Credit check — 1 เครดิต
    const creditError = requireCredits(req, "siamsi"); // same cost as siamsi (1)
    if (creditError) return creditError;

    const settings = getSettings();
    const { date } = await req.json();
    const user = getUserFromRequest(req);

    const d = new Date(date);
    const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const dayName = dayNames[d.getDay()];

    let userContext = "";
    if (user) {
      const profile = getUserProfile(user.userId);
      if (profile?.birthdate) {
        const zodiac = calculateZodiac(profile.birthdate);
        userContext = `\nผู้ถาม: ${profile.nickname || "ไม่ระบุ"} อายุ ${zodiac.age} ปี ราศี${zodiac.western.signTh} ธาตุ${zodiac.western.elementTh} ปี${zodiac.thai.signTh} เลขนำโชค ${zodiac.luckyNumber}`;
      }
    }

    const prompt = `คุณคือโหราจารย์ผู้เชี่ยวชาญ ทำนายดวงประจำวัน${dayName}ที่ ${date}${userContext}

ตอบเป็น JSON เท่านั้น:
{
  "overall": 1-5,
  "love": 1-5,
  "career": 1-5,
  "money": 1-5,
  "health": 1-5,
  "level": "great|good|neutral|caution",
  "luckyColor": "สีมงคลประจำวัน",
  "luckyNumber": "เลขมงคล 1-2 ตัว",
  "tip": "คำแนะนำสั้นๆ 1 ประโยค",
  "summary": "สรุปดวงวันนี้ 2-3 ประโยค ภาษาง่ายๆ",
  "avoid": "สิ่งที่ควรหลีกเลี่ยง 1 ประโยค",
  "isAuspicious": true/false,
  "specialDay": "ถ้ามีวันสำคัญ เช่น วันพระ วันมงคล ใส่ที่นี่ ถ้าไม่มีใส่ \"\""
}

กฎ: ทุกอย่างเป็นภาษาไทย ห้ามมี markdown ตอบ JSON เท่านั้น`;

    const message = await client.messages.create({
      model: settings.model,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const parsed = JSON.parse(text.slice(start, end + 1));
      return NextResponse.json({ fortune: { date, dayName, ...parsed } });
    } catch {
      return NextResponse.json({ fortune: { date, dayName, summary: text, level: "neutral", overall: 3, love: 3, career: 3, money: 3, health: 3, luckyColor: "", luckyNumber: "", tip: "", avoid: "", isAuspicious: false, specialDay: "" } });
    }
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ error: "ไม่สามารถวิเคราะห์ดวงได้" }, { status: 500 });
  }
}
