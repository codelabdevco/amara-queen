import { AIReading } from "@/store/useTarotStore";

export interface ReadingRecord {
  id: string;
  timestamp: number;
  topic: string;
  topicIcon: string;
  topicColor: string;
  spread: string;
  question: string;
  cards: { nameTh: string; nameEn: string; isReversed: boolean }[];
  reading: AIReading;
}

const STORAGE_KEY = "amara_history";
const MAX_RECORDS = 50;

export function getHistory(): ReadingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReading(record: Omit<ReadingRecord, "id" | "timestamp">): void {
  const history = getHistory();
  const entry: ReadingRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(entry);
  if (history.length > MAX_RECORDS) history.length = MAX_RECORDS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function deleteReading(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
