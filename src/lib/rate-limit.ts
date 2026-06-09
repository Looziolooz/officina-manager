import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LRUCache } from "lru-cache";

// Fallback in-memory se Redis non è configurato
const ipCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 1000,
  ttl: 60 * 1000, // 1 minuto
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

// Redis ratelimiter (se configurato)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 tentativi per minuto
      prefix: "ratelimit:auth",
    })
  : null;

export async function checkRateLimit(request: Request): Promise<boolean> {
  const ip = getClientIp(request);

  // Usa Upstash se disponibile
  if (ratelimit) {
    const { success } = await ratelimit.limit(ip);
    return !success; // true se bloccato
  }

  // Fallback in-memory
  const now = Date.now();
  const entry = ipCache.get(ip);

  if (!entry || now > entry.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return false; // non bloccato
  }

  if (entry.count >= 5) {
    return true; // bloccato
  }

  entry.count++;
  return false; // non bloccato
}
