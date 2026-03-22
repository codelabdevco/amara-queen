import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUserProfile, updateUserProfile, findUserById, getReadings, type UserProfile } from "@/lib/db";
import { calculateZodiac } from "@/lib/zodiac";

// GET — get current user profile + zodiac info + reading stats
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });

  const profile = getUserProfile(user.userId);
  const dbUser = findUserById(user.userId);

  let zodiac = null;
  if (profile?.birthdate) {
    zodiac = calculateZodiac(profile.birthdate);
  }

  // Reading stats
  const { total: totalReadings } = getReadings(1, 0, { userId: user.userId });

  return NextResponse.json({
    profile: profile || null,
    zodiac,
    lineDisplayName: dbUser?.lineDisplayName || null,
    linePictureUrl: dbUser?.linePictureUrl || null,
    credits: dbUser?.credits || 0,
    totalReadings,
  });
}

// PUT — update user profile
export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });

  const body = await req.json();
  const profile: UserProfile = {
    nickname: (body.nickname || "").trim().slice(0, 50),
    firstName: (body.firstName || "").trim().slice(0, 100),
    lastName: (body.lastName || "").trim().slice(0, 100),
    birthdate: body.birthdate || "",
    gender: ["male", "female", "other"].includes(body.gender) ? body.gender : "",
    phone: (body.phone || "").trim().slice(0, 20),
    email: (body.email || "").trim().slice(0, 100),
    birthTime: body.birthTime || "",
    relationshipStatus: ["single", "taken", "complicated"].includes(body.relationshipStatus) ? body.relationshipStatus : "",
    occupation: (body.occupation || "").trim().slice(0, 100),
  };

  if (!profile.nickname) {
    return NextResponse.json({ error: "กรุณากรอกชื่อเล่น" }, { status: 400 });
  }
  if (!profile.birthdate) {
    return NextResponse.json({ error: "กรุณากรอกวันเกิด" }, { status: 400 });
  }

  const updated = updateUserProfile(user.userId, profile);
  if (!updated) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

  const zodiac = calculateZodiac(profile.birthdate);

  return NextResponse.json({ ok: true, profile, zodiac });
}
