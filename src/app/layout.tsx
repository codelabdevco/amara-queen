import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Amara Queen — ดูดวงไพ่ทาโร่",
  description: "เปิดไพ่ทาโร่เพื่อค้นหาคำตอบที่จักรวาลมีให้คุณ ดูดวงความรัก การงาน การเงิน สุขภาพ ด้วย AI",
  keywords: ["ดูดวง", "ไพ่ทาโร่", "tarot", "ดวง", "ทำนาย", "Amara Queen", "amara-queen"],
  authors: [{ name: "Amara Queen" }],
  manifest: "/manifest.json",
  icons: [{ url: "/icons/icon-192.svg", sizes: "192x192" }, { url: "/icons/icon-512.svg", sizes: "512x512" }],
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Amara Queen" },
  openGraph: {
    title: "Amara Queen — ดูดวงไพ่ทาโร่",
    description: "เปิดไพ่ทาโร่เพื่อค้นหาคำตอบที่จักรวาลมีให้คุณ",
    type: "website",
    locale: "th_TH",
    siteName: "Amara Queen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amara Queen — ดูดวงไพ่ทาโร่",
    description: "เปิดไพ่ทาโร่เพื่อค้นหาคำตอบที่จักรวาลมีให้คุณ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08090e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="font-noto antialiased">{children}</body>
    </html>
  );
}
