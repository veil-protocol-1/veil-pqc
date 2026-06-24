import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const SAFE_API =
  'https://safe-transaction-base.safe.global/api/v1/safes/0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b/transactions/?limit=10&ordering=-nonce';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(SAFE_API, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // Safe not deployed yet — return empty list gracefully
      return NextResponse.json({ txs: [], note: `Safe API returned ${res.status}` });
    }

    const data = (await res.json()) as { results?: unknown[] };
    return NextResponse.json({ txs: data.results ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
