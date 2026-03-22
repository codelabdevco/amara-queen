import { NextRequest, NextResponse } from "next/server";
import { searchAddressByProvince, searchAddressByAmphoe } from "thai-address-database";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const province = url.searchParams.get("province") || "";
  const amphoe = url.searchParams.get("amphoe") || "";

  if (amphoe && province) {
    const results = searchAddressByAmphoe(amphoe);
    const filtered = results.filter(r => r.province === province);
    const subDistrictSet: Record<string, boolean> = {};
    const zipcodes: Record<string, string> = {};
    filtered.forEach(r => {
      subDistrictSet[r.district] = true;
      zipcodes[r.district] = String(r.zipcode);
    });
    return NextResponse.json({ subDistricts: Object.keys(subDistrictSet).sort(), zipcodes });
  }

  if (province) {
    const results = searchAddressByProvince(province);
    const amphoeSet: Record<string, boolean> = {};
    results.forEach(r => { amphoeSet[r.amphoe] = true; });
    return NextResponse.json({ amphoes: Object.keys(amphoeSet).sort() });
  }

  return NextResponse.json({ error: "ต้องระบุ province" }, { status: 400 });
}
