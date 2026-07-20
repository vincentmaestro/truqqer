//Applies to all routes via Next middleware.ts file

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// 1. Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 2. Create a rate limiter: Max 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true, // Optional: gives you a dashboard in Upstash
  prefix: '@ratelimit',
})

export async function middleware(request: NextRequest) {
  // Only target API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 3. Identify the user by their IP address (or user ID/token if logged in)
  const ip = request.ip ?? '127.0.0.1'
  
  // 4. Check if the user has exceeded their limit
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  // 5. If blocked, return a 429 Too Many Requests response immediately
  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  // 6. If allowed, pass the request forward and attach rate limit metadata to headers
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}


// (Dynamic) - Applies rate limits based on targeted/selected routes routes via Next middleware.ts file

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 1. General Limiter: 60 requests per minute for standard data fetching
const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: '@ratelimit/general',
})

// 2. Strict Limiter: Max 5 attempts per minute for auth/sensitive actions
const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: '@ratelimit/strict',
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore non-API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const ip = request.ip ?? '127.0.0.1'

  // 3. Define your sensitive paths
  const isSensitiveRoute = 
    pathname.startsWith('/api/login') || 
    pathname.startsWith('/api/register') || 
    pathname.startsWith('/api/password-reset')

  // 4. Select the appropriate rate limiter dynamically
  const limiter = isSensitiveRoute ? strictLimiter : generalLimiter

  // 5. Execute the limit check
  const { success, limit, reset, remaining } = await limiter.limit(ip)

  if (!success) {
    return new NextResponse(
      JSON.stringify({ 
        error: isSensitiveRoute 
          ? 'Too many login attempts. Please try again in a minute.' 
          : 'Too many requests. Slow down.' 
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
