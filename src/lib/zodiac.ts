// Thai + Western Zodiac calculation from birthdate

export interface ZodiacInfo {
  western: { sign: string; signTh: string; element: string; elementTh: string };
  thai: { sign: string; signTh: string };
  luckyNumber: number;
  age: number;
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

  return {
    western: { sign: western.sign, signTh: western.signTh, element: western.element, elementTh: western.elementTh },
    thai: { sign: thai.sign, signTh: thai.signTh },
    luckyNumber: sum,
    age,
  };
}
