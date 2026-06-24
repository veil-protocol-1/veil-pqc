import { NextRequest, NextResponse } from 'next/server';
import { verifyBizSignature, isAllowed, signJWT } from '@/lib/auth';

const MAX_AGE_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  let body: { address?: string; signature?: string; timestamp?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { address, signature, timestamp } = body;

  if (!address || !signature || !timestamp) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const age = Date.now() - timestamp;
  if (age < 0 || age > MAX_AGE_MS) {
    return NextResponse.json({ error: 'Timestamp expired' }, { status: 400 });
  }

  const valid = await verifyBizSignature(address, signature as `0x${string}`, timestamp);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!isAllowed(address)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const token = await signJWT(address);
  const response = NextResponse.json({ ok: true });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  });
  return response;
}
