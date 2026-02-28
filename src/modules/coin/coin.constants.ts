// Revenue split: 70% writer, 30% platform
export const WRITER_REVENUE_PERCENT = 70;
export const PLATFORM_FEE_PERCENT = 30;

// Withdrawal
export const MIN_WITHDRAWAL_THB = 100;

// Rate limiting
export const CHECKOUT_RATE_LIMIT = 5; // per minute
export const UNLOCK_RATE_LIMIT = 20; // per minute

// Webhook
export const WEBHOOK_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

// Default coin packs (for seeding)
export const DEFAULT_COIN_PACKS = [
  { name: "Starter", price: 2900, coins: 30, bonusCoins: 0, sortOrder: 1 },
  { name: "Popular", price: 5900, coins: 65, bonusCoins: 5, sortOrder: 2, isFeatured: true },
  { name: "Value", price: 11900, coins: 140, bonusCoins: 20, sortOrder: 3 },
  { name: "Premium", price: 29900, coins: 380, bonusCoins: 80, sortOrder: 4 },
];
