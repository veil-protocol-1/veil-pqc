import { NextRequest, NextResponse } from 'next/server'

const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  if (!KV_URL || !KV_TOKEN) {
    return NextResponse.json(
      { error: 'Waitlist temporarily unavailable' },
      { status: 503 }
    )
  }

  try {
    // Lazy import so the module doesn't crash at load time when env vars are absent
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({ url: KV_URL, token: KV_TOKEN })

    const { email } = await req.json() as { email?: string }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const ip = getIP(req)
    const rateLimitKey = `ratelimit:waitlist:${ip}`

    const existing = await redis.get(rateLimitKey)
    if (existing) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    await Promise.all([
      redis.lpush('waitlist', email.toLowerCase().trim()),
      redis.set(rateLimitKey, '1', { ex: 3600 }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
