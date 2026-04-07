interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;

    const entry = this.store.get(identifier);

    if (!entry || entry.windowStart < windowStart) {
      // New window or no previous entry
      this.store.set(identifier, {
        count: 1,
        windowStart: windowStart
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    // Increment count within current window
    entry.count++;
    this.store.set(identifier, entry);
    return true;
  }

  // Clean up old entries (optional, to prevent memory leaks)
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;

    this.store.forEach((entry, key) => {
      if (entry.windowStart < cutoff) {
        this.store.delete(key);
      }
    });
  }
}

// Admin auth rate limiter: 5 attempts per 15 minutes
export const adminAuthRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
});

// Helper function to get client IP from request
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for different deployment scenarios)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (remoteAddr) {
    return remoteAddr;
  }

  // Fallback for development or when headers are not available
  return 'unknown-ip';
}