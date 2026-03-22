import { NextRequest, NextResponse } from "next/server";
import { searchAddressByProvince, searchAddressByAmphoe } from "thai-address-database";

// GET /api/address-lookup?province=xxx or ?amphoe=xxx&province=xxx
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const province = url.searchParams.get("province") || "";
  const amphoe = url.searchParams.get("amphoe") || "";

  if (amphoe && province) {
    // Get sub-districts for a specific amphoe in province
    const results = searchAddressByAmphoe(amphoe) as { district: string; amphoe: string; province: string; zipcode: string }[];
    const filtered = results.filter(r => r.province === province);
    const subDistricts = [...new Set(filtered.map(r => r.district))].sort();
    const zipcodes: Record<string, string> = {};
    filtered.forEach(r => { zipcodes[r.district] = String(r.zipcode); });
    return NextResponse.json({ subDistricts, zipcodes });
  }

  if (province) {
    // Get amphoes for a province
    const results = searchAddressByProvince(province) as { district: string; amphoe: string; province: string; zipcode: string }[];
    const amphoes = [...new Set(results.map(r => r.amphoe))].sort();
    return NextResponse.json({ amphoes });
  }

  return NextResponse.json({ error: "ต้องระบุ province" }, { status: 400 });
}
