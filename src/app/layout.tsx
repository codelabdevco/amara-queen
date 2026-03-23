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
      <body className="font-noto antialiased">
        {/* SVG Defs for Laurel Buttons */}
        <svg style={{ position: "absolute", width: 0, height: 0 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3A0E0E"/><stop offset="50%" stopColor="#521515"/><stop offset="100%" stopColor="#380D0D"/></linearGradient>
            <linearGradient id="gG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9A8050"/><stop offset="25%" stopColor="#C4AD72"/><stop offset="50%" stopColor="#D8CA96"/><stop offset="75%" stopColor="#C4AD72"/><stop offset="100%" stopColor="#9A8050"/></linearGradient>
            <symbol id="fl-c" viewBox="0 0 200 56" preserveAspectRatio="none">
              <rect x="0" y="0" width="200" height="56" rx="1.5" fill="#2D0A0A"/>
              <rect x="1" y="1" width="198" height="54" rx="1" fill="url(#cG)" opacity=".9"/>
              <rect x="1" y="1" width="198" height="54" rx="1" fill="none" stroke="#8B7A4A" strokeWidth="0.6"/>
              <rect x="5" y="5" width="190" height="46" rx=".5" fill="none" stroke="#5A4E34" strokeWidth=".25"/>
              <g stroke="#8B7A4A" fill="#6B5D38" strokeWidth=".35" opacity=".5"><path d="M6,28 C4.5,22 4,16 4.5,10" fill="none" strokeWidth=".6"/><path d="M6,28 C4.5,34 4,40 4.5,46" fill="none" strokeWidth=".6"/><ellipse cx="4" cy="12" rx="2.5" ry="1.1" transform="rotate(-25 4 12)"/><ellipse cx="5.5" cy="15" rx="2.2" ry=".9" transform="rotate(15 5.5 15)"/><ellipse cx="4" cy="18" rx="2.5" ry="1.1" transform="rotate(-20 4 18)"/><ellipse cx="5.5" cy="21" rx="2.2" ry=".9" transform="rotate(12 5.5 21)"/><ellipse cx="4.5" cy="24" rx="2.3" ry="1" transform="rotate(-10 4.5 24)"/><ellipse cx="5.5" cy="32" rx="2.2" ry=".9" transform="rotate(10 5.5 32)"/><ellipse cx="4" cy="35" rx="2.5" ry="1.1" transform="rotate(-15 4 35)"/><ellipse cx="5.5" cy="38" rx="2.2" ry=".9" transform="rotate(20 5.5 38)"/><ellipse cx="4" cy="41" rx="2.5" ry="1.1" transform="rotate(-25 4 41)"/><ellipse cx="5.5" cy="44" rx="2.2" ry=".9" transform="rotate(15 5.5 44)"/></g>
              <g stroke="#8B7A4A" fill="#6B5D38" strokeWidth=".35" opacity=".5" transform="translate(200,0) scale(-1,1)"><path d="M6,28 C4.5,22 4,16 4.5,10" fill="none" strokeWidth=".6"/><path d="M6,28 C4.5,34 4,40 4.5,46" fill="none" strokeWidth=".6"/><ellipse cx="4" cy="12" rx="2.5" ry="1.1" transform="rotate(-25 4 12)"/><ellipse cx="5.5" cy="15" rx="2.2" ry=".9" transform="rotate(15 5.5 15)"/><ellipse cx="4" cy="18" rx="2.5" ry="1.1" transform="rotate(-20 4 18)"/><ellipse cx="5.5" cy="21" rx="2.2" ry=".9" transform="rotate(12 5.5 21)"/><ellipse cx="4.5" cy="24" rx="2.3" ry="1" transform="rotate(-10 4.5 24)"/><ellipse cx="5.5" cy="32" rx="2.2" ry=".9" transform="rotate(10 5.5 32)"/><ellipse cx="4" cy="35" rx="2.5" ry="1.1" transform="rotate(-15 4 35)"/><ellipse cx="5.5" cy="38" rx="2.2" ry=".9" transform="rotate(20 5.5 38)"/><ellipse cx="4" cy="41" rx="2.5" ry="1.1" transform="rotate(-25 4 41)"/><ellipse cx="5.5" cy="44" rx="2.2" ry=".9" transform="rotate(15 5.5 44)"/></g>
              <g stroke="#7A6842" fill="#5A4E34" strokeWidth=".3" opacity=".45"><ellipse cx="84" cy="3" rx="2.5" ry="1" transform="rotate(-35 84 3)"/><ellipse cx="90" cy="2" rx="2.5" ry="1" transform="rotate(-18 90 2)"/><ellipse cx="110" cy="2" rx="2.5" ry="1" transform="rotate(18 110 2)"/><ellipse cx="116" cy="3" rx="2.5" ry="1" transform="rotate(35 116 3)"/></g>
              <g stroke="#7A6842" fill="#5A4E34" strokeWidth=".3" opacity=".45" transform="translate(0,56) scale(1,-1)"><ellipse cx="84" cy="3" rx="2.5" ry="1" transform="rotate(-35 84 3)"/><ellipse cx="90" cy="2" rx="2.5" ry="1" transform="rotate(-18 90 2)"/><ellipse cx="110" cy="2" rx="2.5" ry="1" transform="rotate(18 110 2)"/><ellipse cx="116" cy="3" rx="2.5" ry="1" transform="rotate(35 116 3)"/></g>
              <circle cx="100" cy="1.5" r="1.8" fill="#2D0A0A" stroke="#8B7A4A" strokeWidth=".5" opacity=".5"/><circle cx="100" cy="54.5" r="1.8" fill="#2D0A0A" stroke="#8B7A4A" strokeWidth=".5" opacity=".5"/>
            </symbol>
            <symbol id="fl-g" viewBox="0 0 200 56" preserveAspectRatio="none">
              <rect x="0" y="0" width="200" height="56" rx="1.5" fill="#7A6842"/>
              <rect x="1" y="1" width="198" height="54" rx="1" fill="url(#gG)"/>
              <rect x="1" y="1" width="198" height="54" rx="1" fill="none" stroke="#5A4015" strokeWidth="0.6"/>
              <rect x="5" y="5" width="190" height="46" rx=".5" fill="none" stroke="rgba(60,40,10,.3)" strokeWidth=".25"/>
              <g stroke="#5A4015" fill="#4A3510" strokeWidth=".35" opacity=".45"><path d="M6,28 C4.5,22 4,16 4.5,10" fill="none" strokeWidth=".6"/><path d="M6,28 C4.5,34 4,40 4.5,46" fill="none" strokeWidth=".6"/><ellipse cx="4" cy="12" rx="2.5" ry="1.1" transform="rotate(-25 4 12)"/><ellipse cx="5.5" cy="15" rx="2.2" ry=".9" transform="rotate(15 5.5 15)"/><ellipse cx="4" cy="18" rx="2.5" ry="1.1" transform="rotate(-20 4 18)"/><ellipse cx="5.5" cy="21" rx="2.2" ry=".9" transform="rotate(12 5.5 21)"/><ellipse cx="4.5" cy="24" rx="2.3" ry="1" transform="rotate(-10 4.5 24)"/><ellipse cx="5.5" cy="32" rx="2.2" ry=".9" transform="rotate(10 5.5 32)"/><ellipse cx="4" cy="35" rx="2.5" ry="1.1" transform="rotate(-15 4 35)"/><ellipse cx="5.5" cy="38" rx="2.2" ry=".9" transform="rotate(20 5.5 38)"/><ellipse cx="4" cy="41" rx="2.5" ry="1.1" transform="rotate(-25 4 41)"/><ellipse cx="5.5" cy="44" rx="2.2" ry=".9" transform="rotate(15 5.5 44)"/></g>
              <g stroke="#5A4015" fill="#4A3510" strokeWidth=".35" opacity=".45" transform="translate(200,0) scale(-1,1)"><path d="M6,28 C4.5,22 4,16 4.5,10" fill="none" strokeWidth=".6"/><path d="M6,28 C4.5,34 4,40 4.5,46" fill="none" strokeWidth=".6"/><ellipse cx="4" cy="12" rx="2.5" ry="1.1" transform="rotate(-25 4 12)"/><ellipse cx="5.5" cy="15" rx="2.2" ry=".9" transform="rotate(15 5.5 15)"/><ellipse cx="4" cy="18" rx="2.5" ry="1.1" transform="rotate(-20 4 18)"/><ellipse cx="5.5" cy="21" rx="2.2" ry=".9" transform="rotate(12 5.5 21)"/><ellipse cx="4.5" cy="24" rx="2.3" ry="1" transform="rotate(-10 4.5 24)"/><ellipse cx="5.5" cy="32" rx="2.2" ry=".9" transform="rotate(10 5.5 32)"/><ellipse cx="4" cy="35" rx="2.5" ry="1.1" transform="rotate(-15 4 35)"/><ellipse cx="5.5" cy="38" rx="2.2" ry=".9" transform="rotate(20 5.5 38)"/><ellipse cx="4" cy="41" rx="2.5" ry="1.1" transform="rotate(-25 4 41)"/><ellipse cx="5.5" cy="44" rx="2.2" ry=".9" transform="rotate(15 5.5 44)"/></g>
              <g stroke="#5A4015" fill="#4A3510" strokeWidth=".3" opacity=".4"><ellipse cx="84" cy="3" rx="2.5" ry="1" transform="rotate(-35 84 3)"/><ellipse cx="90" cy="2" rx="2.5" ry="1" transform="rotate(-18 90 2)"/><ellipse cx="110" cy="2" rx="2.5" ry="1" transform="rotate(18 110 2)"/><ellipse cx="116" cy="3" rx="2.5" ry="1" transform="rotate(35 116 3)"/></g>
              <g stroke="#5A4015" fill="#4A3510" strokeWidth=".3" opacity=".4" transform="translate(0,56) scale(1,-1)"><ellipse cx="84" cy="3" rx="2.5" ry="1" transform="rotate(-35 84 3)"/><ellipse cx="90" cy="2" rx="2.5" ry="1" transform="rotate(-18 90 2)"/><ellipse cx="110" cy="2" rx="2.5" ry="1" transform="rotate(18 110 2)"/><ellipse cx="116" cy="3" rx="2.5" ry="1" transform="rotate(35 116 3)"/></g>
              <circle cx="100" cy="1.5" r="1.8" fill="#C4AD72" stroke="#5A4015" strokeWidth=".5" opacity=".45"/><circle cx="100" cy="54.5" r="1.8" fill="#C4AD72" stroke="#5A4015" strokeWidth=".5" opacity=".45"/>
            </symbol>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
