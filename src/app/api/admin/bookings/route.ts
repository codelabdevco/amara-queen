import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllBookings,
  updateBookingStatus,
  findUserById,
  findHealerById,
  type BookingStatus,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const status = url.searchParams.get("status") as BookingStatus | null;
  const healerId = url.searchParams.get("healerId") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const search = url.searchParams.get("search") || "";

  const { bookings, total } = getAllBookings(limit, offset, {
    status: status || undefined,
    healerId,
    date,
  });

  // Enrich with user + healer info
  const userCache: Record<string, { name: string; picture: string }> = {};
  const healerCache: Record<string, { name: string; title: string }> = {};

  const enriched = bookings
    .map((b) => {
      if (!userCache[b.userId]) {
        const u = findUserById(b.userId);
        userCache[b.userId] = {
          name: u?.lineDisplayName || u?.username || "ไม่ทราบ",
          picture: u?.linePictureUrl || "",
        };
      }
      if (!healerCache[b.healerId]) {
        const h = findHealerById(b.healerId);
        healerCache[b.healerId] = {
          name: h?.name || "ไม่ทราบ",
          title: h?.title || "",
        };
      }
      return {
        ...b,
        userName: userCache[b.userId].name,
        userPicture: userCache[b.userId].picture,
        healerName: healerCache[b.healerId].name,
        healerTitle: healerCache[b.healerId].title,
      };
    })
    .filter((b) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        b.userName.toLowerCase().includes(s) ||
        b.healerName.toLowerCase().includes(s) ||
        b.note.toLowerCase().includes(s)
      );
    });

  // Stats
  const allData = getAllBookings(9999, 0);
  const stats = {
    total: allData.total,
    pending: allData.bookings.filter((b) => b.status === "pending").length,
    confirmed: allData.bookings.filter((b) => b.status === "confirmed").length,
    completed: allData.bookings.filter((b) => b.status === "completed").length,
    cancelled: allData.bookings.filter((b) => b.status === "cancelled").length,
    totalCredits: allData.bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.creditCost, 0),
  };

  return NextResponse.json({ bookings: enriched, total, stats });
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { bookingId, status, adminNote } = await req.json();
  const result = updateBookingStatus(bookingId, status, adminNote);
  return NextResponse.json(result);
}
