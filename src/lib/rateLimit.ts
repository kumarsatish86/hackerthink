import { NextRequest } from 'next/server';

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Check rate limit
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    // Create new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }
  
  // Increment count
  current.count += 1;
  rateLimitStore.set(key, current);
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

// Get rate limit settings from database
export async function getRateLimitSettings(): Promise<{ maxRequests: number; windowMs: number }> {
  try {
    const { query } = await import('./db');
    const result = await query(
      "SELECT setting_value FROM contact_settings WHERE setting_key = 'rate_limit_per_hour'"
    );
    
    const rateLimitPerHour = result.rows.length > 0 
      ? parseInt(result.rows[0].setting_value || '5', 10)
      : 5;
    
    return {
      maxRequests: rateLimitPerHour,
      windowMs: 60 * 60 * 1000, // 1 hour
    };
  } catch (error) {
    console.error('Error getting rate limit settings:', error);
    return {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    };
  }
}
