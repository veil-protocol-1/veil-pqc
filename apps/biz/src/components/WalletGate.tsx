'use client';

import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function WalletGate() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!address) return;
    setLoading(true);
    setStatus('Waiting for signature...');
    try {
      const timestamp = Date.now();
      const signature = await signMessageAsync({ message: `veil-biz-auth-${timestamp}` });

      setStatus('Verifying...');
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, timestamp }),
      });

      if (res.ok) {
        setStatus('Authorized');
        router.push('/dashboard');
        return;
      }

      const data = (await res.json()) as { error?: string };
      setStatus(data.error ?? 'Access denied');
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : 'Cancelled');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-6 max-w-sm w-full px-6">
        <div className="text-white/20 text-xs tracking-[0.3em] uppercase mb-8">
          Veil Protocol — Internal
        </div>

        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full px-8 py-3 border border-white/20 text-white/70 text-sm tracking-wider hover:border-white/40 hover:text-white transition-colors disabled:opacity-40"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-white/30 text-xs font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full px-8 py-3 border border-white/20 text-white/70 text-sm tracking-wider hover:border-white/40 hover:text-white transition-colors disabled:opacity-40"
            >
              {loading ? status : 'Sign to Authenticate'}
            </button>

            {status && !loading && (
              <div className="text-red-400/70 text-xs font-mono">{status}</div>
            )}

            <button
              onClick={() => disconnect()}
              className="text-white/20 text-xs hover:text-white/40 transition-colors"
            >
              disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
