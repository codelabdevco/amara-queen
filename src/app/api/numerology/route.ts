import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSettings, getUserProfile } from "@/lib/db";
import { getUserFromRequest } from "@/lib/admin-auth";
import { calculateZodiac } from "@/lib/zodiac";
import { requireCredits } from "@/lib/credit-check";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const creditError = requireCredits(req, "siamsi"); // 1 credit
    if (creditError) return creditError;

    const settings = getSettings();
    const { type, number, bank } = await req.json();

    const typeLabels: Record<string, string> = {
      phone: "เบอร์โทรศัพท์",
      lucky: "เบอร์มงคล",
      bank: "เลขบัญชีธนาคาร",
      car: "เลขทะเบียนรถ",
      id: "เลขบัตรประชาชน",
    };

    let typeLabel = typeLabels[type] || "ตัวเลข";
    if (type === "bank" && bank) typeLabel = `เลขบัญชีธนาคาร${bank}`;
    const user = getUserFromRequest(req);
    let userContext = "";
    if (user) {
      const profile = getUserProfile(user.userId);
      if (profile?.birthdate) {
        const zodiac = calculateZodiac(profile.birthdate);
        userContext = `\nผู้ถาม: ${profile.nickname || ""} อายุ ${zodiac.age} ปี ราศี${zodiac.western.signTh} ธาตุ${zodiac.western.elementTh} เลขนำโชค ${zodiac.luckyNumber}`;
      }
    }

    const prompt = `คุณคือนักเลขศาสตร์ผู้เชี่ยวชาญ วิเคราะห์${typeLabel}: "${number}"${userContext}

ตอบเป็น JSON เท่านั้น:
{
  "score": 1-10,
  "level": "excellent|good|neutral|caution|bad",
  "levelText": "ดีมาก|ดี|ปกติ|ระวัง|ไม่ดี",
  "summary": "สรุปความหมายของเลขนี้ 2-3 ประโยค",
  "digitAnalysis": "วิเคราะห์แต่ละหลัก/กลุ่มตัวเลขสำคัญ 2-3 ประโยค",
  "strengths": "จุดเด่นของเลขนี้ 1-2 ประโยค",
  "weaknesses": "จุดอ่อน/ข้อควรระวัง 1 ประโยค",
  "compatibility": "เข้ากับเจ้าของไหม (ดูจากราศี/ธาตุ/เลขนำโชค) 1 ประโยค",
  "suggestion": "แนะนำ${type === "lucky" ? "เบอร์มงคล" : ""} 1 ประโยค"
}

กฎ: วิเคราะห์ตามหลักเลขศาสตร์ไทย+จีน ภาษาไทย ห้ามมี markdown ตอบ JSON เท่านั้น`;

    const message = await client.messages.create({
      model: settings.model,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const parsed = JSON.parse(text.slice(start, end + 1));
      return NextResponse.json({ result: { type, number, ...parsed } });
    } catch {
      return NextResponse.json({ result: { type, number, score: 5, level: "neutral", levelText: "ปกติ", summary: text, digitAnalysis: "", strengths: "", weaknesses: "", compatibility: "", suggestion: "" } });
    }
  } catch (error) {
    console.error("Numerology error:", error);
    return NextResponse.json({ error: "ไม่สามารถวิเคราะห์ได้" }, { status: 500 });
  }
}
