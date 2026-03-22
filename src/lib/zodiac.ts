// Thai + Western Zodiac calculation from birthdate

export interface ZodiacInfo {
  western: { sign: string; signTh: string; element: string; elementTh: string };
  thai: { sign: string; signTh: string };
  luckyNumber: number;
  age: number;
  birthDay: { name: string; nameTh: string; color: string; planet: string; planetTh: string };
  personality: string;
  luckyColor: string;
  compatibility: string;
}

const WESTERN_ZODIAC: { sign: string; signTh: string; element: string; elementTh: string; startMonth: number; startDay: number; endMonth: number; endDay: number }[] = [
  { sign: "Capricorn", signTh: "มังกร", element: "Earth", elementTh: "ดิน", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: "Aquarius", signTh: "กุมภ์", element: "Air", elementTh: "ลม", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: "Pisces", signTh: "มีน", element: "Water", elementTh: "น้ำ", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { sign: "Aries", signTh: "เมษ", element: "Fire", elementTh: "ไฟ", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: "Taurus", signTh: "พฤษภ", element: "Earth", elementTh: "ดิน", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: "Gemini", signTh: "เมถุน", element: "Air", elementTh: "ลม", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { sign: "Cancer", signTh: "กรกฎ", element: "Water", elementTh: "น้ำ", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { sign: "Leo", signTh: "สิงห์", element: "Fire", elementTh: "ไฟ", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: "Virgo", signTh: "กันย์", element: "Earth", elementTh: "ดิน", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: "Libra", signTh: "ตุลย์", element: "Air", elementTh: "ลม", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { sign: "Scorpio", signTh: "พิจิก", element: "Water", elementTh: "น้ำ", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { sign: "Sagittarius", signTh: "ธนู", element: "Fire", elementTh: "ไฟ", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
];

// Thai zodiac based on birth year (animal year)
const THAI_ANIMALS = [
  { sign: "Monkey", signTh: "วอก (ลิง)" },
  { sign: "Rooster", signTh: "ระกา (ไก่)" },
  { sign: "Dog", signTh: "จอ (หมา)" },
  { sign: "Pig", signTh: "กุน (หมู)" },
  { sign: "Rat", signTh: "ชวด (หนู)" },
  { sign: "Ox", signTh: "ฉลู (วัว)" },
  { sign: "Tiger", signTh: "ขาล (เสือ)" },
  { sign: "Rabbit", signTh: "เถาะ (กระต่าย)" },
  { sign: "Dragon", signTh: "มะโรง (งูใหญ่)" },
  { sign: "Snake", signTh: "มะเส็ง (งูเล็ก)" },
  { sign: "Horse", signTh: "มะเมีย (ม้า)" },
  { sign: "Goat", signTh: "มะแม (แพะ)" },
];

const DAY_INFO = [
  { name: "Sunday", nameTh: "อาทิตย์", color: "แดง", planet: "Sun", planetTh: "พระอาทิตย์" },
  { name: "Monday", nameTh: "จันทร์", color: "เหลือง", planet: "Moon", planetTh: "พระจันทร์" },
  { name: "Tuesday", nameTh: "อังคาร", color: "ชมพู", planet: "Mars", planetTh: "พระอังคาร" },
  { name: "Wednesday", nameTh: "พุธ", color: "เขียว", planet: "Mercury", planetTh: "พระพุธ" },
  { name: "Thursday", nameTh: "พฤหัสบดี", color: "ส้ม", planet: "Jupiter", planetTh: "พระพฤหัสบดี" },
  { name: "Friday", nameTh: "ศุกร์", color: "ฟ้า", planet: "Venus", planetTh: "พระศุกร์" },
  { name: "Saturday", nameTh: "เสาร์", color: "ม่วง", planet: "Saturn", planetTh: "พระเสาร์" },
];

const ZODIAC_PERSONALITY: Record<string, string> = {
  Aries: "กล้าหาญ มุ่งมั่น เป็นผู้นำโดยธรรมชาติ มีพลังงานสูง",
  Taurus: "อดทน มั่นคง รักความสวยงาม ให้ความสำคัญกับความมั่นคง",
  Gemini: "ฉลาด ช่างพูด ปรับตัวเก่ง ชอบเรียนรู้สิ่งใหม่",
  Cancer: "อ่อนโยน ห่วงใยคนรอบข้าง สัญชาตญาณแม่นยำ ผูกพันกับครอบครัว",
  Leo: "มั่นใจ มีเสน่ห์ ใจกว้าง ชอบเป็นจุดสนใจ",
  Virgo: "ละเอียดรอบคอบ ช่างวิเคราะห์ รักความเป็นระเบียบ ขยันขันแข็ง",
  Libra: "รักความยุติธรรม มีรสนิยม ชอบความสมดุล เข้ากับคนง่าย",
  Scorpio: "ลึกซึ้ง มีพลัง เด็ดขาด ซื่อสัตย์ต่อคนที่รัก",
  Sagittarius: "รักอิสระ มองโลกกว้าง ชอบผจญภัย มองโลกในแง่ดี",
  Capricorn: "มีระเบียบวินัย ทะเยอทะยาน อดทน มุ่งสู่เป้าหมาย",
  Aquarius: "ความคิดล้ำ เป็นตัวของตัวเอง รักเพื่อนมนุษย์ สร้างสรรค์",
  Pisces: "จินตนาการสูง เห็นอกเห็นใจ สัมผัสที่หก ศิลปินในตัว",
};

const ZODIAC_LUCKY_COLOR: Record<string, string> = {
  Aries: "แดง", Taurus: "เขียว", Gemini: "เหลือง", Cancer: "เงิน",
  Leo: "ทอง", Virgo: "น้ำตาล", Libra: "ชมพู", Scorpio: "แดงเข้ม",
  Sagittarius: "ม่วง", Capricorn: "ดำ", Aquarius: "ฟ้า", Pisces: "เขียวทะเล",
};

const ZODIAC_COMPAT: Record<string, string> = {
  Aries: "สิงห์ ธนู กุมภ์",
  Taurus: "กันย์ มังกร มีน",
  Gemini: "ตุลย์ กุมภ์ เมษ",
  Cancer: "พิจิก มีน พฤษภ",
  Leo: "เมษ ธนู เมถุน",
  Virgo: "พฤษภ มังกร กรกฎ",
  Libra: "เมถุน กุมภ์ สิงห์",
  Scorpio: "กรกฎ มีน กันย์",
  Sagittarius: "เมษ สิงห์ ตุลย์",
  Capricorn: "พฤษภ กันย์ พิจิก",
  Aquarius: "เมถุน ตุลย์ ธนู",
  Pisces: "กรกฎ พิจิก มังกร",
};

export function calculateZodiac(birthdate: string): ZodiacInfo {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  // Western zodiac
  let western = WESTERN_ZODIAC[0]; // default Capricorn
  for (const z of WESTERN_ZODIAC) {
    if (z.startMonth === z.endMonth) {
      if (month === z.startMonth && day >= z.startDay && day <= z.endDay) { western = z; break; }
    } else if (z.startMonth > z.endMonth) {
      // Capricorn wraps around
      if ((month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay)) { western = z; break; }
    } else {
      if ((month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay)) { western = z; break; }
    }
  }

  // Thai zodiac (animal year)
  const thaiIndex = year % 12;
  const thai = THAI_ANIMALS[thaiIndex];

  // Lucky number (numerology: sum all digits of birthdate until single digit)
  const digits = birthdate.replace(/-/g, "");
  let sum = 0;
  for (const ch of digits) sum += parseInt(ch);
  while (sum > 9) {
    let newSum = 0;
    for (const ch of String(sum)) newSum += parseInt(ch);
    sum = newSum;
  }

  // Age
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;

  // Day of week
  const dayOfWeek = date.getDay();
  const birthDayInfo = DAY_INFO[dayOfWeek];

  return {
    western: { sign: western.sign, signTh: western.signTh, element: western.element, elementTh: western.elementTh },
    thai: { sign: thai.sign, signTh: thai.signTh },
    luckyNumber: sum,
    age,
    birthDay: birthDayInfo,
    personality: ZODIAC_PERSONALITY[western.sign] || "",
    luckyColor: ZODIAC_LUCKY_COLOR[western.sign] || "",
    compatibility: ZODIAC_COMPAT[western.sign] || "",
  };
}
