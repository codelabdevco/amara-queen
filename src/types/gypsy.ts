import type { Topic, Spread, SpreadPosition } from "./tarot";

export const GYPSY_TOPICS: Topic[] = [
  { id: "love", icon: "♥", nameTH: "ความรัก / คู่ครอง", nameEN: "Love", color: "#c44a5a", desc: "เนื้อคู่ แอบชอบ คืนดี", examples: ["เขาคิดอย่างไรกับฉัน", "จะเจอเนื้อคู่เมื่อไร", "ความรักจะไปรอดไหม"] },
  { id: "career", icon: "⚙", nameTH: "การงาน / อาชีพ", nameEN: "Career", color: "#c9a84c", desc: "เลื่อนขั้น เปลี่ยนงาน", examples: ["ควรเปลี่ยนงานไหม", "จะได้เลื่อนตำแหน่งไหม"] },
  { id: "money", icon: "★", nameTH: "การเงิน / โชคลาภ", nameEN: "Money", color: "#4a9e6e", desc: "รายได้ หนี้ ลงทุน", examples: ["การเงินช่วงนี้เป็นอย่างไร", "ควรลงทุนไหม"] },
  { id: "health", icon: "✚", nameTH: "สุขภาพ", nameEN: "Health", color: "#9b7dd4", desc: "กาย จิต ความเครียด", examples: ["สุขภาพช่วงนี้เป็นอย่างไร"] },
  { id: "general", icon: "✦", nameTH: "ดวงรวม", nameEN: "General", color: "#888780", desc: "ภาพรวม สัปดาห์ เดือน", examples: ["ดวงช่วงนี้เป็นอย่างไร", "มีข้อความอะไรจากจักรวาล"] },
];

export const GYPSY_SPREADS: Spread[] = [
  { id: "single", name: "Single Card", nameTH: "ไพ่ใบเดียว", cardCount: 1, desc: "จั่ว 1 ใบ ดูคำตอบทันที",
    positions: [{ id: 1, nameTH: "คำตอบ", nameEN: "Answer" }] },
  { id: "three", name: "Three Card", nameTH: "อดีต ปัจจุบัน อนาคต", cardCount: 3, desc: "3 ใบ ดูทิศทาง",
    positions: [
      { id: 1, nameTH: "อดีต", nameEN: "Past" },
      { id: 2, nameTH: "ปัจจุบัน", nameEN: "Present" },
      { id: 3, nameTH: "อนาคต", nameEN: "Future" },
    ] },
  { id: "five", name: "Cross", nameTH: "กากบาท 5 ใบ", cardCount: 5, desc: "5 ใบ ดูครบทุกมิติ",
    positions: [
      { id: 1, nameTH: "สถานการณ์ปัจจุบัน", nameEN: "Present" },
      { id: 2, nameTH: "อุปสรรค", nameEN: "Obstacle" },
      { id: 3, nameTH: "อดีต", nameEN: "Past" },
      { id: 4, nameTH: "อนาคต", nameEN: "Future" },
      { id: 5, nameTH: "ผลลัพธ์", nameEN: "Outcome" },
    ] },
  { id: "grand", name: "Grand Tableau", nameTH: "แกรนด์ทาโบล 9 ใบ", cardCount: 9, desc: "9 ใบ วิเคราะห์ละเอียด",
    positions: [
      { id: 1, nameTH: "ตัวคุณ", nameEN: "Self" },
      { id: 2, nameTH: "สิ่งที่อยู่ใกล้", nameEN: "Near" },
      { id: 3, nameTH: "ความหวัง", nameEN: "Hope" },
      { id: 4, nameTH: "สิ่งที่ไม่คาดคิด", nameEN: "Surprise" },
      { id: 5, nameTH: "อดีต", nameEN: "Past" },
      { id: 6, nameTH: "อนาคตอันใกล้", nameEN: "Near future" },
      { id: 7, nameTH: "ตัวคุณในอนาคต", nameEN: "Future self" },
      { id: 8, nameTH: "สิ่งแวดล้อม", nameEN: "Environment" },
      { id: 9, nameTH: "ผลลัพธ์สุดท้าย", nameEN: "Final outcome" },
    ] },
];

export const GYPSY_TOPIC_DEFAULT_SPREAD: Record<string, string> = {
  love: "three", career: "five", money: "three", health: "single", general: "three",
};
