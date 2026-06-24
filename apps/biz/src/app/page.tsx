import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import { WalletGate } from '@/components/WalletGate';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) redirect('/dashboard');
  }
  return <WalletGate />;
}
