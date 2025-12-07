import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (for development)
// For production, use Redis or Upstash
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  return ip;
}

function isRateLimited(key: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { limited: true, remaining: 0 };
  }

  record.count++;
  return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    const { limited, remaining } = isRateLimited(key);

    if (limited) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
