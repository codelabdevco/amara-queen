import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Amara Queen" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#1e0c0c] text-white">{children}</div>;
}
