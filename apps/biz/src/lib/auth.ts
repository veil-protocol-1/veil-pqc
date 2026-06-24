import { verifyMessage } from 'viem';
import { jwtVerify, SignJWT } from 'jose';

const SAFE_ADDRESS = '0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b';
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env['JWT_SECRET'] ?? 'dev-secret-change-me-in-production',
);

export function getAllowlist(): string[] {
  const envAddresses = (process.env['ALLOWLIST'] ?? '')
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(Boolean);
  return [...envAddresses, SAFE_ADDRESS.toLowerCase()];
}

export function isAllowed(address: string): boolean {
  return getAllowlist().includes(address.toLowerCase());
}

export async function verifyBizSignature(
  address: string,
  signature: `0x${string}`,
  timestamp: number,
): Promise<boolean> {
  const message = `veil-biz-auth-${timestamp}`;
  try {
    return await verifyMessage({ address: address as `0x${string}`, message, signature });
  } catch {
    return false;
  }
}

export async function signJWT(address: string): Promise<string> {
  return new SignJWT({ address })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<{ address: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return { address: payload['address'] as string };
  } catch {
    return null;
  }
}
