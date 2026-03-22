import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUserProfile, updateUserProfile, findUserById, type UserProfile } from "@/lib/db";
import { calculateZodiac } from "@/lib/zodiac";

// GET — get current user profile + zodiac info
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });

  const profile = getUserProfile(user.userId);
  const dbUser = findUserById(user.userId);

  let zodiac = null;
  if (profile?.birthdate) {
    zodiac = calculateZodiac(profile.birthdate);
  }

  return NextResponse.json({
    profile: profile || null,
    zodiac,
    lineDisplayName: dbUser?.lineDisplayName || null,
    linePictureUrl: dbUser?.linePictureUrl || null,
  });
}

// PUT — update user profile
export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });

  const body = await req.json();
  const profile: UserProfile = {
    nickname: (body.nickname || "").trim().slice(0, 50),
    birthdate: body.birthdate || "",
    gender: ["male", "female", "other"].includes(body.gender) ? body.gender : "",
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
