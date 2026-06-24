import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { X402_PAYMENTS_ADDRESS, DEPLOY_BLOCK, PAYMENT_RECORDED_EVENT } from '@/lib/contracts';
import { verifyJWT } from '@/lib/auth';

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const logs = await client.getLogs({
      address: X402_PAYMENTS_ADDRESS,
      event: parseAbiItem(PAYMENT_RECORDED_EVENT),
      fromBlock: DEPLOY_BLOCK,
      toBlock: 'latest',
    });

    const payments = logs.map(log => ({
      blockNumber: log.blockNumber?.toString() ?? null,
      transactionHash: log.transactionHash,
      payer: log.args.payer ?? null,
      recipient: log.args.recipient ?? null,
      amount: log.args.amount?.toString() ?? '0',
      sigHash: log.args.sigHash ?? null,
    }));

    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
