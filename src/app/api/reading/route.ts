import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSettings, saveReading, getUserProfile } from "@/lib/db";
import { getUserFromRequest } from "@/lib/admin-auth";
import { calculateZodiac } from "@/lib/zodiac";
import { requireCredits } from "@/lib/credit-check";

const client = new Anthropic();

interface ReadingResult {
  trend: string;
  trendText: string;
  summary: string;
  advice: string;
  cardInsights: string[];
}

const FALLBACK: ReadingResult = {
  trend: "neutral",
  trendText: "",
  summary: "",
  advice: "",
  cardInsights: [],
};

function extractJSON(raw: string): ReadingResult {
  try {
    return validateReading(JSON.parse(raw));
  } catch { /* continue */ }

  try {
    const stripped = raw
      .replace(/^[\s\S]*?```(?:json)?[\s\n]*/i, "")
      .replace(/[\s\n]*```[\s\S]*$/, "")
      .trim();
    return validateReading(JSON.parse(stripped));
  } catch { /* continue */ }

  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return validateReading(JSON.parse(raw.slice(start, end + 1)));
    }
  } catch { /* continue */ }

  try {
    const start = raw.indexOf("{");
    if (start !== -1) {
      let truncated = raw.slice(start);
      const openQuotes = (truncated.match(/"/g) || []).length;
      if (openQuotes % 2 !== 0) truncated += '"';
      const openBrackets = (truncated.match(/\[/g) || []).length - (truncated.match(/\]/g) || []).length;
      for (let i = 0; i < openBrackets; i++) truncated += "]";
      const openBraces = (truncated.match(/\{/g) || []).length - (truncated.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces; i++) truncated += "}";
      return validateReading(JSON.parse(truncated));
    }
  } catch { /* continue */ }

  console.error("JSON extraction failed, raw:", raw.slice(0, 200));
  return { ...FALLBACK, summary: raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim() };
}

function validateReading(obj: Record<string, unknown>): ReadingResult {
  return {
    trend: typeof obj.trend === "string" ? obj.trend : "neutral",
    trendText: typeof obj.trendText === "string" ? obj.trendText : "",
    summary: typeof obj.summary === "string" ? obj.summary : "",
    advice: typeof obj.advice === "string" ? obj.advice : "",
    cardInsights: Array.isArray(obj.cardInsights)
      ? obj.cardInsights.map((s) => (typeof s === "string" ? s : ""))
      : [],
  };
}

interface CardInfo {
  nameTh: string;
  nameEn: string;
  meaningTh?: string;
  meaning: string;
  isReversed: boolean;
  positionName: string;
}

interface ReadingRequest {
  topic: string;
  topicIcon?: string;
  spread: string;
  question: string;
  cards: CardInfo[];
}

export async function POST(req: NextRequest) {
  try {
    const settings = getSettings();

    // Maintenance mode
    if (settings.maintenanceMode) {
      return NextResponse.json({ error: "ระบบกำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง" }, { status: 503 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Rate limit (per minute)
    const rateCheck = checkRateLimit(ip, settings.rateLimitPerMinute);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "คุณส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ReadingRequest & { service?: string };
    const { topic, topicIcon, spread, question, cards } = body;

    // Credit check — tarot 3 เครดิต, gypsy 2 เครดิต
    const service = body.service === "gypsy" ? "gypsy" as const : "tarot" as const;
    const creditError = requireCredits(req, service, topic);
    if (creditError) return creditError;

    const user = getUserFromRequest(req);

    const cardDetails = cards
      .map(
        (c, i) =>
          `${i + 1}. ตำแหน่ง "${c.positionName}" — ${c.nameTh} (${c.nameEn})${c.isReversed ? " [กลับหัว]" : ""}\n   ความหมาย: ${c.meaningTh || c.meaning}`
      )
      .join("\n");

    // Build user context from profile
    let userContext = "";
    if (user) {
      const profile = getUserProfile(user.userId);
      if (profile?.birthdate) {
        const zodiac = calculateZodiac(profile.birthdate);
        const parts: string[] = [];
        if (profile.nickname) parts.push(`ชื่อเล่น: ${profile.nickname}`);
        if (profile.firstName) parts.push(`ชื่อจริง: ${profile.firstName}${profile.lastName ? " " + profile.lastName : ""}`);
        parts.push(`อายุ: ${zodiac.age} ปี`);
        if (profile.gender) parts.push(`เพศ: ${profile.gender === "male" ? "ชาย" : profile.gender === "female" ? "หญิง" : "อื่นๆ"}`);
        parts.push(`ราศี: ${zodiac.western.signTh} (ธาตุ${zodiac.western.elementTh})`);
        parts.push(`ปีนักษัตร: ${zodiac.thai.signTh}`);
        parts.push(`เลขนำโชค: ${zodiac.luckyNumber}`);
        if (profile.birthTime) parts.push(`เวลาเกิด: ${profile.birthTime}`);
        if (profile.relationshipStatus) {
          const statusMap: Record<string, string> = { single: "โสด", taken: "มีคู่", complicated: "ซับซ้อน" };
          parts.push(`สถานะ: ${statusMap[profile.relationshipStatus] || profile.relationshipStatus}`);
        }
        if (profile.occupation) parts.push(`อาชีพ: ${profile.occupation}`);
        userContext = `\n\nข้อมูลผู้ถาม:\n${parts.join("\n")}`;
      }
    }

    // Build prompt from settings template
    const prompt = settings.promptTemplate
      .replace("{{topic}}", topic)
      .replace("{{question}}", question)
      .replace("{{spread}}", spread)
      .replace("{{cardDetails}}", cardDetails)
      .replace("{{cardCount}}", String(cards.length))
      + userContext;

    const message = await client.messages.create({
      model: settings.model,
      max_tokens: settings.maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const tokensUsed = (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0);

    const parsed = extractJSON(text);

    // Save to DB
    saveReading({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: user?.userId || null,
      ip,
      topic,
      topicIcon: topicIcon || "",
      spread,
      question,
      cards: cards.map((c) => ({
        nameTh: c.nameTh,
        nameEn: c.nameEn,
        isReversed: c.isReversed,
        positionName: c.positionName,
      })),
      trend: parsed.trend,
      trendText: parsed.trendText,
      summary: parsed.summary,
      advice: parsed.advice,
      cardInsights: parsed.cardInsights,
      modelUsed: settings.model,
      tokensUsed,
    });

    return NextResponse.json({ reading: parsed });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างคำทำนายได้" },
      { status: 500 }
    );
  }
}
