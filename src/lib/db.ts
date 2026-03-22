import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";

// Data directory — mounted as Docker volume for persistence
const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

// ── Generic JSON file helpers ──
function readJSON<T>(filename: string, fallback: T): T {
  ensureDir();
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) return fallback;
  try {
    return JSON.parse(readFileSync(filepath, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJSON(filename: string, data: unknown): void {
  ensureDir();
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// ── READINGS ──
export interface ReadingRecord {
  id: string;
  timestamp: number;
  userId: string | null;
  ip: string;
  topic: string;
  topicIcon: string;
  spread: string;
  question: string;
  cards: { nameTh: string; nameEn: string; isReversed: boolean; positionName: string }[];
  trend: string;
  trendText: string;
  summary: string;
  advice: string;
  cardInsights: string[];
  modelUsed: string;
  tokensUsed: number;
}

export function saveReading(reading: ReadingRecord): void {
  ensureDir();
  const line = JSON.stringify(reading) + "\n";
  appendFileSync(join(DATA_DIR, "readings.jsonl"), line);

  // Update daily stats
  const today = new Date().toISOString().slice(0, 10);
  const stats = getDailyStats();
  if (!stats[today]) stats[today] = { count: 0, topics: {}, spreads: {}, tokens: 0 };
  stats[today].count++;
  stats[today].topics[reading.topic] = (stats[today].topics[reading.topic] || 0) + 1;
  stats[today].spreads[reading.spread] = (stats[today].spreads[reading.spread] || 0) + 1;
  stats[today].tokens += reading.tokensUsed;
  writeJSON("daily-stats.json", stats);
}

export function getReadings(limit = 50, offset = 0, filters?: { topic?: string; date?: string; userId?: string }): { readings: ReadingRecord[]; total: number } {
  ensureDir();
  const filepath = join(DATA_DIR, "readings.jsonl");
  if (!existsSync(filepath)) return { readings: [], total: 0 };

  const lines = readFileSync(filepath, "utf-8").trim().split("\n").filter(Boolean);
  let readings: ReadingRecord[] = lines.map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean) as ReadingRecord[];

  // Apply filters
  if (filters?.topic) readings = readings.filter((r) => r.topic === filters.topic);
  if (filters?.date) readings = readings.filter((r) => new Date(r.timestamp).toISOString().slice(0, 10) === filters.date);
  if (filters?.userId) readings = readings.filter((r) => r.userId === filters.userId);

  // Sort newest first
  readings.sort((a, b) => b.timestamp - a.timestamp);
  const total = readings.length;
  return { readings: readings.slice(offset, offset + limit), total };
}

export function deleteReading(id: string): boolean {
  ensureDir();
  const filepath = join(DATA_DIR, "readings.jsonl");
  if (!existsSync(filepath)) return false;

  const lines = readFileSync(filepath, "utf-8").trim().split("\n").filter(Boolean);
  const filtered = lines.filter((l) => {
    try { return JSON.parse(l).id !== id; } catch { return true; }
  });

  if (filtered.length === lines.length) return false;
  writeFileSync(filepath, filtered.join("\n") + "\n");
  return true;
}

// ── DAILY STATS ──
interface DayStats {
  count: number;
  topics: Record<string, number>;
  spreads: Record<string, number>;
  tokens: number;
}

export function getDailyStats(): Record<string, DayStats> {
  return readJSON("daily-stats.json", {});
}

export function getOverviewStats() {
  const stats = getDailyStats();
  const days = Object.entries(stats);
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = stats[today] || { count: 0, topics: {}, spreads: {}, tokens: 0 };

  const totalReadings = days.reduce((sum, [, d]) => sum + d.count, 0);
  const totalTokens = days.reduce((sum, [, d]) => sum + d.tokens, 0);

  // Aggregate topics & spreads
  const topicTotals: Record<string, number> = {};
  const spreadTotals: Record<string, number> = {};
  for (const [, d] of days) {
    for (const [t, c] of Object.entries(d.topics)) topicTotals[t] = (topicTotals[t] || 0) + c;
    for (const [s, c] of Object.entries(d.spreads)) spreadTotals[s] = (spreadTotals[s] || 0) + c;
  }

  // Last 7 days chart data
  const last7: { date: string; count: number; tokens: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7.push({ date: key, count: stats[key]?.count || 0, tokens: stats[key]?.tokens || 0 });
  }

  // Estimated cost (Claude Sonnet: ~$3/MTok input, ~$15/MTok output, rough avg $5/MTok)
  const estimatedCost = (totalTokens / 1_000_000) * 5;

  return {
    totalReadings,
    todayReadings: todayStats.count,
    totalTokens,
    todayTokens: todayStats.tokens,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    topTopics: Object.entries(topicTotals).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topSpreads: Object.entries(spreadTotals).sort((a, b) => b[1] - a[1]).slice(0, 5),
    last7,
  };
}

// ── USERS ──
export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  subDistrict: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  nickname: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: "male" | "female" | "other" | "";
  phone: string;
  email: string;
  birthTime: string;
  relationshipStatus: "single" | "taken" | "complicated" | "";
  occupation: string;
  savedAddresses?: SavedAddress[];
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
  profile?: UserProfile;
  createdAt: number;
  readingsToday: number;
  lastReadingDate: string;
  lastFreeMonth: string;
  credits: number;
}

function getUsers(): User[] {
  return readJSON("users.json", []);
}

function saveUsers(users: User[]): void {
  writeJSON("users.json", users);
}

export function findUserByUsername(username: string): User | null {
  return getUsers().find((u) => u.username === username) || null;
}

export function findUserById(id: string): User | null {
  return getUsers().find((u) => u.id === id) || null;
}

export function findUserByLineId(lineUserId: string): User | null {
  return getUsers().find((u) => u.lineUserId === lineUserId) || null;
}

export function createLineUser(lineUserId: string, displayName: string, pictureUrl: string): User {
  const users = getUsers();
  const settings = getSettings();
  const user: User = {
    id: crypto.randomUUID(),
    username: displayName,
    passwordHash: "",
    lineUserId,
    lineDisplayName: displayName,
    linePictureUrl: pictureUrl,
    createdAt: Date.now(),
    readingsToday: 0,
    lastReadingDate: "",
    lastFreeMonth: "",
    credits: settings.welcomeCredits,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUserProfile(userId: string, profile: UserProfile): User | null {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.profile = profile;
  if (profile.nickname) user.username = profile.nickname;
  saveUsers(users);
  return user;
}

export function getUserProfile(userId: string): UserProfile | null {
  const user = findUserById(userId);
  return user?.profile || null;
}

export function getSavedAddresses(userId: string): SavedAddress[] {
  const user = findUserById(userId);
  return user?.profile?.savedAddresses || [];
}

export function saveAddress(userId: string, address: SavedAddress): SavedAddress[] {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user || !user.profile) return [];

  if (!user.profile.savedAddresses) user.profile.savedAddresses = [];

  if (address.isDefault) {
    user.profile.savedAddresses.forEach(a => { a.isDefault = false; });
  }

  const idx = user.profile.savedAddresses.findIndex(a => a.id === address.id);
  if (idx >= 0) user.profile.savedAddresses[idx] = address;
  else user.profile.savedAddresses.push(address);

  saveUsers(users);
  return user.profile.savedAddresses;
}

export function deleteAddress(userId: string, addressId: string): SavedAddress[] {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user?.profile?.savedAddresses) return [];
  user.profile.savedAddresses = user.profile.savedAddresses.filter(a => a.id !== addressId);
  saveUsers(users);
  return user.profile.savedAddresses;
}

export function createUser(username: string, passwordHash: string): User {
  const users = getUsers();
  const settings = getSettings();
  const user: User = {
    id: crypto.randomUUID(),
    username,
    passwordHash,
    createdAt: Date.now(),
    readingsToday: 0,
    lastReadingDate: "",
    lastFreeMonth: "",
    credits: settings.welcomeCredits,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function incrementUserReading(userId: string): { allowed: boolean; remaining: number; useCredit: boolean } {
  const users = getUsers();
  const settings = getSettings();
  const user = users.find((u) => u.id === userId);
  if (!user) return { allowed: false, remaining: 0, useCredit: false };

  // Monthly free credits — give once per month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  if (user.lastFreeMonth !== currentMonth) {
    user.credits += settings.monthlyFreeCredits;
    user.lastFreeMonth = currentMonth;
  }

  // Use credits
  const cost = settings.creditCostPerReading;
  if ((user.credits || 0) >= cost) {
    user.credits -= cost;
    saveUsers(users);
    return { allowed: true, remaining: user.credits, useCredit: true };
  }

  saveUsers(users);
  return { allowed: false, remaining: 0, useCredit: false };
}

export function getUserCredits(userId: string): number {
  const user = findUserById(userId);
  return user?.credits ?? 0;
}

export function addCredits(userId: string, amount: number): { success: boolean; newBalance: number } {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, newBalance: 0 };
  user.credits = (user.credits || 0) + amount;
  saveUsers(users);
  return { success: true, newBalance: user.credits };
}

// ── TOP-UP REQUESTS ──
export interface TopUpRequest {
  id: string;
  userId: string;
  username: string;
  credits: number;
  price: number;
  paymentRef: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
}

function getTopUpRequests(): TopUpRequest[] {
  return readJSON("topup-requests.json", []);
}

function saveTopUpRequests(requests: TopUpRequest[]): void {
  writeJSON("topup-requests.json", requests);
}

export function createTopUpRequest(userId: string, username: string, credits: number, price: number, paymentRef: string): TopUpRequest {
  const requests = getTopUpRequests();
  const req: TopUpRequest = {
    id: crypto.randomUUID(),
    userId,
    username,
    credits,
    price,
    paymentRef,
    status: "pending",
    createdAt: Date.now(),
  };
  requests.push(req);
  saveTopUpRequests(requests);
  return req;
}

export function getTopUpRequestsList(status?: string, limit = 50, offset = 0): { requests: TopUpRequest[]; total: number } {
  let requests = getTopUpRequests().sort((a, b) => b.createdAt - a.createdAt);
  if (status) requests = requests.filter((r) => r.status === status);
  const total = requests.length;
  return { requests: requests.slice(offset, offset + limit), total };
}

export function getUserTopUpRequests(userId: string): TopUpRequest[] {
  return getTopUpRequests().filter((r) => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function processTopUpRequest(requestId: string, action: "approved" | "rejected"): { success: boolean; request?: TopUpRequest } {
  const requests = getTopUpRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req || req.status !== "pending") return { success: false };

  req.status = action;
  req.processedAt = Date.now();

  if (action === "approved") {
    addCredits(req.userId, req.credits);
  }

  saveTopUpRequests(requests);
  return { success: true, request: req };
}

// ── PAYMENT TRANSACTIONS ──
export interface PaymentTransaction {
  id: string;
  userId: string;
  username: string;
  chargeId: string;
  method: "promptpay" | "card" | "truemoney" | "manual";
  amount: number; // in satang (THB * 100)
  credits: number;
  status: "pending" | "successful" | "failed" | "expired";
  createdAt: number;
  completedAt?: number;
  qrCodeUrl?: string;
}

function getTransactions(): PaymentTransaction[] {
  return readJSON("transactions.json", []);
}

function saveTransactions(txns: PaymentTransaction[]): void {
  writeJSON("transactions.json", txns);
}

export function createTransaction(txn: PaymentTransaction): void {
  const txns = getTransactions();
  txns.push(txn);
  saveTransactions(txns);
}

export function findTransaction(chargeId: string): PaymentTransaction | null {
  return getTransactions().find(t => t.chargeId === chargeId) || null;
}

export function completeTransaction(chargeId: string, status: "successful" | "failed" | "expired"): PaymentTransaction | null {
  const txns = getTransactions();
  const txn = txns.find(t => t.chargeId === chargeId);
  if (!txn || txn.status !== "pending") return null;

  txn.status = status;
  txn.completedAt = Date.now();

  if (status === "successful") {
    addCredits(txn.userId, txn.credits);
  }

  saveTransactions(txns);
  return txn;
}

export function getPaymentHistory(userId: string): PaymentTransaction[] {
  return getTransactions().filter(t => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllTransactions(limit = 50, offset = 0): { transactions: PaymentTransaction[]; total: number } {
  const txns = getTransactions().sort((a, b) => b.createdAt - a.createdAt);
  return { transactions: txns.slice(offset, offset + limit), total: txns.length };
}

// ── SHOP PRODUCTS ──
export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  image: string;
  category: string;
  stock: number;
  active: boolean;
}

const DEFAULT_PRODUCTS: ShopProduct[] = [
  { id: "amulet", name: "พระเครื่อง หลวงพ่อโต", description: "พระเครื่องเสริมบารมี ป้องกันภัย", price: 199, icon: "☸", image: "", category: "พระเครื่อง", stock: 50, active: true },
  { id: "necklace", name: "สร้อยนพเก้า เสริมดวง", description: "สร้อยคอนพเก้า 9 สี เสริมดวงชะตา", price: 299, icon: "◈", image: "", category: "เครื่องประดับ", stock: 30, active: true },
  { id: "yantra", name: "ยันต์ห้าแถว กันภัย", description: "ผ้ายันต์ห้าแถว ป้องกันอันตราย", price: 149, icon: "⬡", image: "", category: "ยันต์", stock: 100, active: true },
  { id: "holywater", name: "น้ำมนต์ เสริมโชค", description: "น้ำมนต์จากพระอาจารย์ดัง เสริมโชคลาภ", price: 99, icon: "❈", image: "", category: "น้ำมนต์", stock: 200, active: true },
  { id: "bag", name: "ถุงเงินถุงทอง", description: "ถุงมงคล ดึงดูดเงินทอง", price: 129, icon: "✦", image: "", category: "ของมงคล", stock: 80, active: true },
  { id: "candle", name: "เทียนชัยมงคล", description: "เทียนชัย จุดเสริมสิริมงคล", price: 79, icon: "♦", image: "", category: "เทียน", stock: 150, active: true },
];

export function getProducts(): ShopProduct[] {
  const products = readJSON<ShopProduct[]>("products.json", []);
  return products.length > 0 ? products.filter(p => p.active) : DEFAULT_PRODUCTS;
}

export function getAllProducts(): ShopProduct[] {
  const products = readJSON<ShopProduct[]>("products.json", []);
  return products.length > 0 ? products : DEFAULT_PRODUCTS;
}

export function saveProduct(product: ShopProduct): void {
  const products = getAllProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx >= 0) products[idx] = product;
  else products.push(product);
  writeJSON("products.json", products);
}

export function deleteProduct(id: string): void {
  const products = getAllProducts().filter(p => p.id !== id);
  writeJSON("products.json", products);
}

// ── ORDERS ──
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  userId: string;
  username: string;
  items: OrderItem[];
  total: number;
  paymentMethod: "credit" | "omise";
  paymentStatus: "pending" | "paid" | "failed";
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  createdAt: number;
  updatedAt: number;
}

function getOrders(): Order[] {
  return readJSON("orders.json", []);
}

function saveOrders(orders: Order[]): void {
  writeJSON("orders.json", orders);
}

export function createOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function getUserOrders(userId: string): Order[] {
  return getOrders().filter(o => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllOrders(limit = 50, offset = 0): { orders: Order[]; total: number } {
  const orders = getOrders().sort((a, b) => b.createdAt - a.createdAt);
  return { orders: orders.slice(offset, offset + limit), total: orders.length };
}

export function updateOrder(orderId: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;
  Object.assign(order, updates, { updatedAt: Date.now() });
  saveOrders(orders);
  return order;
}

export function getUserCount(): number {
  return getUsers().length;
}

export function getAllUsers(limit = 50, offset = 0): { users: Omit<User, "passwordHash">[]; total: number } {
  const users = getUsers().sort((a, b) => b.createdAt - a.createdAt);
  const total = users.length;
  const sliced = users.slice(offset, offset + limit).map(({ passwordHash: _, ...rest }) => rest);
  return { users: sliced, total };
}

// ── SETTINGS ──
export interface AppSettings {
  promptTemplate: string;
  model: string;
  maxTokens: number;
  dailyFreeLimit: number;
  rateLimitPerMinute: number;
  maintenanceMode: boolean;
  welcomeCredits: number;
  monthlyFreeCredits: number;
  creditCostPerReading: number;
  creditPackages: { credits: number; price: number; label: string }[];
  promptPayNumber: string;
  promptPayName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  promptTemplate: `คุณคือนักอ่านไพ่ทาโร่ผู้เชี่ยวชาญ อ่านไพ่ให้ผู้ใช้ที่เป็นคนทั่วไป (ไม่ใช่ผู้เชี่ยวชาญ) ให้เข้าใจง่าย

หมวด: "{{topic}}"
คำถาม: "{{question}}"
รูปแบบการวาง: "{{spread}}"

ไพ่ที่จั่วได้:
{{cardDetails}}

ตอบเป็น JSON เท่านั้น ตามโครงสร้างนี้:
{
  "trend": "very_positive" | "positive" | "neutral" | "caution" | "challenging",
  "trendText": "คำอธิบายแนวโน้มสั้นๆ 1 ประโยค",
  "summary": "สรุปคำทำนายภาพรวม 3-4 ประโยค ภาษาง่ายๆ อบอุ่น",
  "advice": "คำแนะนำปฏิบัติได้จริง 1-2 ประโยค",
  "cardInsights": ["วิเคราะห์ไพ่แต่ละใบ 2-3 ประโยค"]
}

กฎ:
- trend ให้ประเมินจากภาพรวมไพ่ทุกใบรวมกัน
- summary เขียนเหมือนเล่าเรื่อง ไม่ใช่ list
- cardInsights ต้องมีจำนวนเท่ากับไพ่ที่จั่ว ({{cardCount}} ใบ)
- ไพ่กลับหัวให้ตีความว่าเป็นสิ่งที่ต้องระวังหรือพัฒนา
- ทุกอย่างเป็นภาษาไทย ห้ามมี markdown
- ตอบ JSON เท่านั้น ไม่มีข้อความอื่นก่อนหรือหลัง`,
  model: "claude-sonnet-4-20250514",
  maxTokens: 2000,
  dailyFreeLimit: 5,
  rateLimitPerMinute: 10,
  maintenanceMode: false,
  welcomeCredits: 5,
  monthlyFreeCredits: 3,
  creditCostPerReading: 1,
  creditPackages: [
    { credits: 10, price: 29, label: "10 เครดิต" },
    { credits: 30, price: 79, label: "30 เครดิต" },
    { credits: 100, price: 199, label: "100 เครดิต" },
  ],
  promptPayNumber: "",
  promptPayName: "",
};

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJSON("settings.json", {}) };
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  writeJSON("settings.json", updated);
  return updated;
}

// ── GUEST USAGE TRACKING ──
export function checkGuestLimit(ip: string): { allowed: boolean; remaining: number } {
  const settings = getSettings();
  const today = new Date().toISOString().slice(0, 10);
  const guestUsage: Record<string, Record<string, number>> = readJSON("guest-usage.json", {});

  if (!guestUsage[today]) guestUsage[today] = {};
  const used = guestUsage[today][ip] || 0;

  if (used >= settings.dailyFreeLimit) {
    return { allowed: false, remaining: 0 };
  }

  guestUsage[today][ip] = used + 1;

  // Clean up old days (keep only today)
  const cleaned: Record<string, Record<string, number>> = { [today]: guestUsage[today] };
  writeJSON("guest-usage.json", cleaned);

  return { allowed: true, remaining: settings.dailyFreeLimit - used - 1 };
}
