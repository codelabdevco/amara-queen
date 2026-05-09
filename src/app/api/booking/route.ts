import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import {
  getActiveHealers,
  findHealerById,
  createBooking,
  getUserBookings,
  getBookedSlots,
  getUserCredits,
} from "@/lib/db";

// GET: list healers or user bookings
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Public: get active healers
  if (action === "healers") {
    const healers = getActiveHealers().map(
      ({ blockedDates: _bd, ...h }) => h
    );
    return NextResponse.json({ healers });
  }

  // Public: get available slots for a healer on a date
  if (action === "slots") {
    const healerId = url.searchParams.get("healerId");
    const date = url.searchParams.get("date");
    if (!healerId || !date) {
      return NextResponse.json({ error: "ต้องระบุ healerId และ date" }, { status: 400 });
    }

    const healer = findHealerById(healerId);
    if (!healer || !healer.active) {
      return NextResponse.json({ error: "ไม่พบหมอดู" }, { status: 404 });
    }

    // Check blocked date
    if (healer.blockedDates.includes(date)) {
      return NextResponse.json({ slots: [], message: "หมอดูไม่ว่างในวันนี้" });
    }

    // Get day of week for the requested date
    const dayOfWeek = new Date(date + "T00:00:00").getDay();
    const dayAvail = healer.availability.find((a) => a.dayOfWeek === dayOfWeek);

    if (!dayAvail || dayAvail.slots.length === 0) {
      return NextResponse.json({ slots: [], message: "ไม่มีช่วงเวลาว่างในวันนี้" });
    }

    // Get already booked slots
    const booked = getBookedSlots(healerId, date);

    // Generate time slots from availability ranges
    const availableSlots: { time: string; available: boolean }[] = [];
    for (const range of dayAvail.slots) {
      const [startH, startM] = range.start.split(":").map(Number);
      const [endH, endM] = range.end.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const step = healer.sessionMinutes || 30;

      for (let m = startMin; m + step <= endMin; m += step) {
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        const time = `${hh}:${mm}`;
        availableSlots.push({ time, available: !booked.includes(time) });
      }
    }

    return NextResponse.json({
      slots: availableSlots,
      healer: { name: healer.name, title: healer.title, priceCredits: healer.priceCredits, sessionMinutes: healer.sessionMinutes },
    });
  }

  // Auth required: get my bookings
  if (action === "my") {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

    const bookings = getUserBookings(user.userId);
    return NextResponse.json({ bookings });
  }

  return NextResponse.json({ error: "ระบุ action: healers, slots, my" }, { status: 400 });
}

// POST: create booking
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { healerId, date, timeSlot, note } = await req.json();
  if (!healerId || !date || !timeSlot) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  // Check user credits first
  const healer = findHealerById(healerId);
  if (!healer) return NextResponse.json({ error: "ไม่พบหมอดู" }, { status: 404 });

  const credits = getUserCredits(user.userId);
  if (credits < healer.priceCredits) {
    return NextResponse.json({
      error: `เครดิตไม่เพียงพอ (ต้องการ ${healer.priceCredits} มี ${credits})`,
      needCredits: healer.priceCredits,
      currentCredits: credits,
    }, { status: 400 });
  }

  const result = createBooking({ userId: user.userId, healerId, date, timeSlot, note });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, booking: result.booking });
}
