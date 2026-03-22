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
    // Credit check
    const creditError = requireCredits(req);
    if (creditError) return creditError;

    const settings = getSettings();
    const { stickNumber } = await req.json();

    let userContext = "";
    const user = getUserFromRequest(req);
    if (user) {
      const profile = getUserProfile(user.userId);
      if (profile?.birthdate) {
        const zodiac = calculateZodiac(profile.birthdate);
        userContext = `\nผู้ถาม: ${profile.nickname || "ไม่ระบุ"} อายุ ${zodiac.age} ปี ราศี${zodiac.western.signTh} ธาตุ${zodiac.western.elementTh}`;
      }
    }

    const prompt = `คุณคือหมอดูผู้เชี่ยวชาญ ตีความเซียมซีใบที่ ${stickNumber} จาก 100 ใบ${userContext}

ตอบเป็น JSON เท่านั้น:
{
  "poem": "กลอนเซียมซี 4 บรรทัด ภาษาไทยโบราณ สัมผัสสระ",
  "interpretation": "คำตีความ 3-4 ประโยค ภาษาง่ายๆ อบอุ่น",
  "luck": "great|good|fair|caution",
  "luckText": "คำอธิบายดวง 1 ประโยค",
  "advice": "คำแนะนำ 1 ประโยค"
}

กฎ: ใบ 1-25 ดวงดีมาก, 26-50 ดวงดี, 51-75 กลางๆ, 76-100 ระวัง
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
      return NextResponse.json({ fortune: { number: stickNumber, ...parsed } });
    } catch {
      return NextResponse.json({ fortune: { number: stickNumber, poem: text, interpretation: "", luck: "fair", luckText: "", advice: "" } });
    }
  } catch (error) {
    console.error("Siamsi error:", error);
    return NextResponse.json({ error: "ไม่สามารถตีความได้" }, { status: 500 });
  }
}
