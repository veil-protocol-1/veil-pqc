export const X402_PAYMENTS_ADDRESS = '0x8F446afA9877C79F3CCb5eaA5b6503752817223f' as const;
export const SAFE_ADDRESS = '0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b' as const;
export const BASE_RPC = 'https://mainnet.base.org';
export const DEPLOY_BLOCK = 47635981n;

export const PAYMENT_RECORDED_EVENT =
  'event PaymentRecorded(address indexed payer, address indexed recipient, uint256 amount, bytes32 indexed sigHash)' as const;

// Tier amounts in USDC micro-units (6 decimals)
const TIER_AMOUNTS = {
  simple: 2000n,    // $0.002
  standard: 10000n, // $0.01
  complex: 50000n,  // $0.05
} as const;

export function classifyTier(amount: bigint): 'simple' | 'standard' | 'complex' | 'unknown' {
  if (amount === TIER_AMOUNTS.simple) return 'simple';
  if (amount === TIER_AMOUNTS.standard) return 'standard';
  if (amount === TIER_AMOUNTS.complex) return 'complex';
  return 'unknown';
}

export function formatAmount(amount: bigint): string {
  return `$${(Number(amount) / 1e6).toFixed(4)}`;
}
