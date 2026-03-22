# Amara Queen — AI Tarot & Oracle Platform

## Project Overview
Amara Queen เป็นแพลตฟอร์มดูดวงด้วยไพ่ทาโร่และไพ่ยิปซีผ่าน AI เปิดให้ใช้ฟรีไม่จำกัด เน้น UI สวย animation ลื่นไหล mobile-first

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **State:** Zustand
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`)
- **Extras:** Lottie (loading animation)
- **Deploy:** Docker (standalone output) + Nginx reverse proxy

## Design Theme
- **สไตล์:** Dark mystical — พื้นหลังดำ (#08090e) + accent สีทอง (#e8d48b)
- **Font:** Noto Sans Thai (Google Fonts)
- **Effects:** Starfield canvas, golden mist, dust particles, candle animations
- **Mobile-first** แต่ต้อง responsive ทุกขนาดหน้าจอ

## Features to Build

### 1. Intro Screen — เลือกประเภทไพ่
- แสดงชื่อ "AMARA QUEEN" พร้อม subtitle "ราชินีแห่งดวงดาว"
- เลือก 2 โหมด:
  - 🌙 **ไพ่ทาโร่ (Mystic Tarot)** — 78 ใบ Major & Minor Arcana
  - 🔮 **ไพ่ยิปซี (Gypsy Oracle)** — 36 ใบ Lenormand style
- Animation: shimmer text gradient, fade in cards

### 2. Topic Screen — เลือกหัวข้อ
- Grid 2 คอลัมน์ของหัวข้อ: ความรัก, การงาน, การเงิน, สุขภาพ, การเรียน, ครอบครัว, จิตวิญญาณ, การตัดสินใจ, การเดินทาง, ดวงรวม
- แต่ละหัวข้อมี icon, ชื่อไทย, คำอธิบายสั้น, สีประจำหัวข้อ
- มี glow effect ตามสีของหัวข้อ

### 3. Spread Screen — เลือกรูปแบบการวาง
- ขึ้นกับจำนวนไพ่: 1 ใบ (ไพ่ประจำวัน), 1 ใบ (ใช่/ไม่), 3 ใบ (อดีต-ปัจจุบัน-อนาคต), 5 ใบ (กากบาท), 7 ใบ (เกือกม้า), 10 ใบ (เซลติกครอส)
- Default spread ตามหัวข้อที่เลือก

### 4. Question Screen — ตั้งคำถาม
- Textarea ให้พิมพ์คำถาม (ไม่บังคับ)
- แสดงตัวอย่างคำถามจากหัวข้อที่เลือก ให้กดเลือกได้
- ปุ่ม "เริ่มจั่วไพ่"

### 5. Card Pick Screen — จั่วไพ่ (หัวใจของแอป)
- **Meditate phase:** แสดงกองไพ่คว่ำ + เทียน 2 เล่ม + rune symbol + ข้อความ "แตะกองไพ่เพื่อสับ"
- **Shuffle phase:** Animation สับไพ่ (fan out, riffle, cascade) พร้อมเสียง
- **Deal phase:** ไพ่กระจายออกเป็น grid ให้เลือก
- **Pick phase:** กดเลือกไพ่ตามจำนวน spread, ไพ่ที่เลือกจะ highlight, haptic feedback + เสียง
- **Gather → Layout phase:** ไพ่ที่เลือกรวมตัวแล้วบินไปวางตามตำแหน่ง spread
- **Flip phase:** กดพลิกไพ่ทีละใบ (3D flip animation) พร้อมเสียง แล้ว auto-advance ไปหน้า Reading
- ไพ่มีโอกาส 30% กลับหัว (reversed)

### 6. Reading Screen — ผลทำนาย
- Loading: เทียน 2 เล่ม + rune animation + ข้อความลึกลับสลับ
- ผลทำนาย:
  - **Trend Meter** — แถบ 5 ระดับ (ดีมาก/ดี/กลางๆ/ระวัง/ท้าทาย) พร้อมสี + icon
  - **สรุปภาพรวม** — 3-4 ประโยค
  - **คำแนะนำ** — 1-2 ประโยค
  - **รายละเอียดแต่ละใบ** — รูปไพ่ + ชื่อ + ตำแหน่ง + วิเคราะห์
- กดรูปไพ่เพื่อดูขนาดใหญ่ (lightbox)
- ปุ่ม "จั่วไพ่ใหม่" + "แชร์ผล"
- ปุ่ม retry เมื่อ AI error

### 7. AI Reading API (`/api/reading`)
- รับ: topic, spread, question, cards (ชื่อ, ตำแหน่ง, หงาย/คว่ำ)
- ส่ง prompt ภาษาไทยให้ Claude สร้างคำทำนาย
- Response เป็น JSON: trend, trendText, summary, advice, cardInsights[]
- Robust JSON extraction (handle markdown blocks, truncated JSON)
- Rate limit: 10 req/min per IP

### 8. Card Data
- **ไพ่ทาโร่:** 78 ใบ (22 Major Arcana + 56 Minor: Wands, Cups, Swords, Pentacles)
- **ไพ่ยิปซี:** 36 ใบ (Lenormand deck)
- แต่ละใบมี: id, name (จีน), nameEn, nameTh, meaning, meaningTh, analysis, analysisTh, image URL, suit
- รูปไพ่ใช้ Rider-Waite public domain จาก Wikimedia Commons (ดาวน์โหลดไว้ local ใน /public/cards/)

### 9. UI Components ที่ต้องสร้าง
- `CardBack` — หลังไพ่ SVG (geometric pattern + moon + star)
- `MiniCardBack` — หลังไพ่ขนาดเล็ก
- `CardFace` — หน้าไพ่ (รูป + ชื่อ)
- `Button` — ปุ่มหลัก (gold gradient) + variant outline
- `BackButton` — ปุ่มย้อนกลับ
- `Candle` — เทียน CSS animation
- `Starfield` — Canvas พื้นหลังดาว
- `GoldenMist` — CSS mist effect
- `DustParticles` — Floating particles

## File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout (Noto Sans Thai, meta tags)
│   ├── page.tsx            # Entry → TarotApp
│   ├── globals.css         # Tailwind + custom effects
│   └── api/
│       └── reading/
│           └── route.ts    # AI reading endpoint
├── components/
│   ├── TarotApp.tsx        # Main app shell (header, effects, routing)
│   ├── TarotFlow.tsx       # Phase router (AnimatePresence)
│   ├── screens/
│   │   ├── IntroScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── TopicScreen.tsx
│   │   ├── SpreadScreen.tsx
│   │   ├── QuestionScreen.tsx
│   │   ├── CardPickScreen.tsx
│   │   └── ReadingScreen.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── BackButton.tsx
│   │   ├── CardBack.tsx
│   │   ├── MiniCardBack.tsx
│   │   ├── CardFace.tsx
│   │   └── Candle.tsx
│   ├── canvas/
│   │   └── Starfield.tsx
│   └── effects/
│       ├── GoldenMist.tsx
│       └── DustParticles.tsx
├── store/
│   └── useTarotStore.ts    # Zustand store
├── types/
│   ├── tarot.ts            # Types + TOPICS + SPREADS for tarot
│   └── gypsy.ts            # Types + TOPICS + SPREADS for gypsy
├── data/
│   ├── tarot.ts            # 78 tarot card data
│   └── gypsy.ts            # 36 gypsy card data
├── constants/
│   ├── animation.ts        # Easing curves, helpers
│   └── theme.ts            # Theme config
└── lib/
    ├── utils.ts            # shuffleArray, etc.
    └── rate-limit.ts       # IP-based rate limiter
```

## Deploy
- **VPS:** root@76.13.216.123
- **Path:** /root/amara-queen
- **Port:** 3504 (Nginx → container)
- **Docker:** `docker-compose build && docker-compose up -d`
- **Env:** ANTHROPIC_API_KEY ตั้งไว้ใน `.env` แล้ว

## Animation Guidelines
- ใช้ Framer Motion ทุก transition
- Card shuffle: multi-phase (fan out → riffle → cascade → glow)
- Card flip: 3D perspective transform (rotateY 180deg)
- Page transitions: AnimatePresence mode="wait"
- Easing: cubic-bezier(0.25, 0.1, 0.25, 1.0)
- Staggered delays สำหรับ list items (0.04-0.08s per item)

## Important Notes
- ทุกข้อความ UI เป็น **ภาษาไทย**
- AI ตอบเป็น **ภาษาไทย** เสมอ
- ไม่มีระบบ login / เครดิต — **ใช้ฟรีไม่จำกัด**
- Mobile-first แต่ต้องสวยบน desktop ด้วย
- ห้ามใช้ emoji ใน UI — ใช้ Unicode symbols หรือ SVG icons แทน (ยกเว้น IntroScreen ที่ใช้ 🌙 🔮)
