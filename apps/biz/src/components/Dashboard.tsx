'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { classifyTier, formatAmount, SAFE_ADDRESS } from '@/lib/contracts';

interface Payment {
  blockNumber: string | null;
  transactionHash: string | null;
  payer: string | null;
  recipient: string | null;
  amount: string;
  sigHash: string | null;
}

interface SafeTx {
  nonce: number;
  safeTxHash: string;
  txHash: string | null;
  executionDate: string | null;
  to: string;
  value: string;
  data: string | null;
  isExecuted: boolean;
  isSuccessful: boolean | null;
  dataDecoded?: { method: string } | null;
}

function short(addr: string | null) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Dashboard({ address }: { address: string }) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [safeTxs, setSafeTxs] = useState<SafeTx[]>([]);
  const [safeNote, setSafeNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/data/payments'),
          fetch('/api/data/safe'),
        ]);

        if (pRes.status === 401 || sRes.status === 401) {
          router.push('/');
          return;
        }

        const pData = (await pRes.json()) as { payments?: Payment[]; error?: string };
        const sData = (await sRes.json()) as { txs?: SafeTx[]; note?: string; error?: string };

        if (pData.error) setError(`Payments: ${pData.error}`);
        setPayments(pData.payments ?? []);
        setSafeTxs(sData.txs ?? []);
        setSafeNote(sData.note ?? null);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  }

  const totalRevenue = payments.reduce((sum, p) => sum + BigInt(p.amount), 0n);

  const tierCounts = payments.reduce<Record<string, number>>((acc, p) => {
    const tier = classifyTier(BigInt(p.amount));
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});

  const nodeActivity = payments.reduce<Record<string, number>>((acc, p) => {
    const r = (p.recipient ?? '').toLowerCase();
    if (r) acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  const recentPayments = [...payments].reverse().slice(0, 20);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/20 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="text-white/40 text-xs tracking-[0.3em] uppercase">Veil Protocol — Internal</div>
        <div className="flex items-center gap-6">
          <span className="text-white/30 text-xs font-mono">{short(address)}</span>
          <button
            onClick={handleSignOut}
            className="text-white/20 text-xs hover:text-white/50 transition-colors"
          >
            sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {error && (
          <div className="text-red-400/70 text-xs font-mono border border-red-400/20 px-3 py-2">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Revenue" value={formatAmount(totalRevenue)} />
          <StatCard label="Total Payments" value={String(payments.length)} />
          <StatCard label="Simple $0.002" value={String(tierCounts['simple'] ?? 0)} />
          <StatCard label="Standard $0.01" value={String(tierCounts['standard'] ?? 0)} />
          <StatCard label="Complex $0.05" value={String(tierCounts['complex'] ?? 0)} />
          <StatCard label="Unknown Tier" value={String(tierCounts['unknown'] ?? 0)} />
        </div>

        {/* Recent payments */}
        <section>
          <h2 className="text-white/30 text-xs tracking-widest uppercase mb-4">
            Recent Payments (last 20)
          </h2>
          {recentPayments.length === 0 ? (
            <p className="text-white/20 text-sm">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-white/25 border-b border-white/10">
                    <th className="text-left py-2 pr-6 font-normal">Block</th>
                    <th className="text-left py-2 pr-6 font-normal">Payer</th>
                    <th className="text-left py-2 pr-6 font-normal">Recipient</th>
                    <th className="text-left py-2 pr-6 font-normal">Amount</th>
                    <th className="text-left py-2 font-normal">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p, i) => {
                    const tier = classifyTier(BigInt(p.amount));
                    return (
                      <tr key={p.sigHash ?? i} className="border-b border-white/5 text-white/50">
                        <td className="py-2 pr-6">{p.blockNumber ?? '—'}</td>
                        <td className="py-2 pr-6">{short(p.payer)}</td>
                        <td className="py-2 pr-6">{short(p.recipient)}</td>
                        <td className="py-2 pr-6">{formatAmount(BigInt(p.amount))}</td>
                        <td className="py-2">
                          <span className={tierColor(tier)}>{tier}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Node activity */}
        <section>
          <h2 className="text-white/30 text-xs tracking-widest uppercase mb-4">
            Node Activity by Recipient
          </h2>
          {Object.keys(nodeActivity).length === 0 ? (
            <p className="text-white/20 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(nodeActivity)
                .sort((a, b) => b[1] - a[1])
                .map(([addr, count]) => (
                  <div key={addr} className="flex items-center gap-4">
                    <span className="text-white/40 font-mono text-xs w-28 shrink-0">{short(addr)}</span>
                    <div className="flex-1 h-px bg-white/10">
                      <div
                        className="h-px bg-white/30"
                        style={{ width: `${(count / payments.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/30 text-xs w-6 text-right shrink-0">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Safe transactions */}
        <section>
          <h2 className="text-white/30 text-xs tracking-widest uppercase mb-1">
            Safe Transactions
          </h2>
          <div className="text-white/20 text-xs font-mono mb-4">
            {SAFE_ADDRESS}
          </div>
          {safeNote && (
            <p className="text-white/20 text-xs mb-3">{safeNote}</p>
          )}
          {safeTxs.length === 0 ? (
            <p className="text-white/20 text-sm">No Safe transactions found — Safe may not be deployed yet.</p>
          ) : (
            <div className="space-y-2">
              {safeTxs.slice(0, 10).map((tx, i) => (
                <div key={tx.safeTxHash ?? i} className="border border-white/10 p-3 font-mono text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/40">nonce #{tx.nonce}</span>
                    <span
                      className={
                        tx.isSuccessful
                          ? 'text-green-400/60'
                          : tx.isExecuted
                          ? 'text-red-400/60'
                          : 'text-white/25'
                      }
                    >
                      {tx.isSuccessful ? 'executed' : tx.isExecuted ? 'failed' : 'pending'}
                    </span>
                  </div>
                  <div className="text-white/30">to: {tx.to}</div>
                  {tx.dataDecoded?.method && (
                    <div className="text-white/20 mt-1">method: {tx.dataDecoded.method}</div>
                  )}
                  {tx.executionDate && (
                    <div className="text-white/20 mt-1">
                      {new Date(tx.executionDate).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 p-4">
      <div className="text-white/30 text-xs mb-2">{label}</div>
      <div className="text-white font-mono text-base">{value}</div>
    </div>
  );
}

function tierColor(tier: string): string {
  switch (tier) {
    case 'simple':
      return 'text-sky-400/60';
    case 'standard':
      return 'text-amber-400/60';
    case 'complex':
      return 'text-violet-400/60';
    default:
      return 'text-white/25';
  }
}
