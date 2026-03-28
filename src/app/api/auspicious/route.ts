import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUserProfile } from "@/lib/db";
import { calculateZodiac } from "@/lib/zodiac";
import { requireCredits } from "@/lib/credit-check";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const settings = getSettings();
    const { event, date } = await req.json();

    // Credit check — 2 เครดิต
    const creditError = requireCredits(req, "auspicious", `ฤกษ์ยาม - ${event}`);
    if (creditError) return creditError;

    const d = new Date(date);
    const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const dayName = dayNames[d.getDay()];

    let userContext = "";
    const user = getUserFromRequest(req);
    if (user) {
      const profile = getUserProfile(user.userId);
      if (profile?.birthdate) {
        const zodiac = calculateZodiac(profile.birthdate);
        userContext = `\nผู้ถาม: ${profile.nickname || "ไม่ระบุ"} อายุ ${zodiac.age} ปี ราศี${zodiac.western.signTh} ธาตุ${zodiac.western.elementTh} ปี${zodiac.thai.signTh}`;
      }
    }

    const prompt = `คุณคือโหราจารย์ผู้เชี่ยวชาญ วิเคราะห์ฤกษ์ยามสำหรับ "${event}" ในวัน${dayName}ที่ ${date}${userContext}

ตอบเป็น JSON เท่านั้น:
{
  "level": "excellent|good|fair|poor",
  "levelText": "ดีมาก|ดี|กลางๆ|ไม่เหมาะ",
  "analysis": "วิเคราะห์ฤกษ์ 3-4 ประโยค ภาษาง่ายๆ",
  "goodTimes": ["10:00-11:00", "14:00-15:00"],
  "goodTimesDesc": "คำอธิบายช่วงเวลาที่ดี 1 ประโยค",
  "avoid": ["สิ่งที่ควรหลีกเลี่ยง 1", "สิ่งที่ควรหลีกเลี่ยง 2"],
  "recommendation": "คำแนะนำเพิ่มเติม 1-2 ประโยค"
}

กฎ: วิเคราะห์ตามหลักโหราศาสตร์ไทย ดูวันมงคล วันอุบาทว์ ข้างขึ้นข้างแรม
ตอบ JSON เท่านั้น ไม่มี markdown`;

    const message = await client.messages.create({
      model: settings.model,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const parsed = JSON.parse(text.slice(start, end + 1));
      return NextResponse.json({ result: { date, dayName, event, ...parsed } });
    } catch {
      return NextResponse.json({ result: { date, dayName, event, level: "fair", levelText: "กลางๆ", analysis: text, goodTimes: [], goodTimesDesc: "", avoid: [], recommendation: "" } });
    }
  } catch (error) {
    console.error("Auspicious error:", error);
    return NextResponse.json({ error: "ไม่สามารถวิเคราะห์ได้" }, { status: 500 });
  }
}
