const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  requests.forEach((val, key) => {
    if (now > val.resetAt) requests.delete(key);
  });
}, 5 * 60_000);

export function checkRateLimit(ip: string, maxRequests = MAX_REQUESTS): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}
