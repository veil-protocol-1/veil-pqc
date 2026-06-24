import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import { Dashboard } from '@/components/Dashboard';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) redirect('/');
  const payload = await verifyJWT(token);
  if (!payload) redirect('/');
  return <Dashboard address={payload.address} />;
}
