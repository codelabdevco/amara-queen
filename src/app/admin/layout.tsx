import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Amara Queen" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden text-white" style={{ background: "#0a0a0a" }}>{children}</div>;
}
