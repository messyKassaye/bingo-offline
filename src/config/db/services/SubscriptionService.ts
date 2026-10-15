import type Database from '@tauri-apps/plugin-sql';
import {
  decodeBase64Url,
  decodePublicKey,
  getBingoDatabase,
  getLocalDeviceId,
  isValidCreditDate,
} from './CashierShopCache';

const DAY_MS = 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_DAYS_PER_MONTH = 30;
export const SUBSCRIPTION_WARNING_DAYS = 5;
const LAST_SEEN_TIME_KEY = 'subscription-last-seen-time';

type SignedSubscription = {
  type: 'BINGO_SUBSCRIPTION';
  deviceId: string;
  date: string;
  subscriptionId: string;
  days: number;
};

export type SubscriptionStatus = {
  /** True once any subscription has been applied; the shop is then on the subscription plan. */
  hasSubscription: boolean;
  isActive: boolean;
  expiresAt: string | null;
  /** Whole days left, rounded up; 0 once expired. */
  daysLeft: number;
};

/**
 * Current time that never goes backwards, so turning the Windows clock back
 * cannot extend a subscription.
 */
async function getTrustedNow(database: Database): Promise<number> {
  const rows = await database.select<{ payload: string }[]>(
    'SELECT payload FROM app_cache WHERE cache_key = $1 LIMIT 1',
    [LAST_SEEN_TIME_KEY],
  );
  const lastSeen = Number(rows[0]?.payload ?? 0);
  const now = Math.max(Date.now(), Number.isFinite(lastSeen) ? lastSeen : 0);
  await database.execute(
    `INSERT INTO app_cache (cache_key, payload, updated_at)
     VALUES ($1, $2, $3)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload = excluded.payload,
       updated_at = excluded.updated_at`,
    [LAST_SEEN_TIME_KEY, String(now), new Date(now).toISOString()],
  );
  return now;
}

async function getLatestExpiry(database: Database, accountId: number): Promise<string | null> {
  const rows = await database.select<{ expiresAt: string | null }[]>(
    'SELECT MAX(expires_at) AS expiresAt FROM subscriptions WHERE account_id = $1',
    [accountId],
  );
  return rows[0]?.expiresAt ?? null;
}

export async function getSubscriptionStatusFromDatabase(
  database: Database,
  accountId: number,
): Promise<SubscriptionStatus> {
  const [expiresAt, now] = await Promise.all([
    getLatestExpiry(database, accountId),
    getTrustedNow(database),
  ]);
  if (!expiresAt) {
    return { hasSubscription: false, isActive: false, expiresAt: null, daysLeft: 0 };
  }
  const remaining = new Date(expiresAt).getTime() - now;
  return {
    hasSubscription: true,
    isActive: remaining > 0,
    expiresAt,
    daysLeft: remaining > 0 ? Math.ceil(remaining / DAY_MS) : 0,
  };
}

export async function getSubscriptionStatus(accountId: number): Promise<SubscriptionStatus> {
  return getSubscriptionStatusFromDatabase(await getBingoDatabase(), accountId);
}

/** Whether pasted issuer text is a subscription code rather than a balance credit. */
export function isSubscriptionText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.startsWith('BINGO1:')) return false;
  try {
    const envelope = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(trimmed.slice('BINGO1:'.length))),
    ) as { subscription?: unknown };
    return envelope.subscription !== undefined;
  } catch {
    return false;
  }
}

/**
 * Verifies a signed subscription code and extends the account's subscription.
 * Days stack on top of the current expiry, so renewing early loses nothing.
 */
export async function applySignedSubscription(
  text: string,
  accountId: number,
  publicKeySpki: string,
): Promise<SubscriptionStatus> {
  if (!publicKeySpki.trim()) {
    throw new Error('The balance verification public key is not configured.');
  }

  let subscription: SignedSubscription;
  let signatureText: string;
  try {
    const envelope = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(text.trim().slice('BINGO1:'.length))),
    ) as { subscription: SignedSubscription; signature: string };
    subscription = envelope.subscription;
    signatureText = envelope.signature;
  } catch {
    throw new Error('The subscription text is invalid. Check that the full text was copied.');
  }

  if (
    subscription?.type !== 'BINGO_SUBSCRIPTION' ||
    typeof subscription.deviceId !== 'string' ||
    typeof subscription.subscriptionId !== 'string' ||
    !Number.isInteger(subscription.days) ||
    subscription.days <= 0 ||
    typeof signatureText !== 'string' ||
    !isValidCreditDate(subscription.date)
  ) {
    throw new Error('The subscription text is incomplete or expired.');
  }

  if (subscription.deviceId !== (await getLocalDeviceId())) {
    throw new Error('This subscription text belongs to a different desktop.');
  }

  const database = await getBingoDatabase();
  const used = await database.select<{ subscription_id: string }[]>(
    'SELECT subscription_id FROM subscriptions WHERE subscription_id = $1 LIMIT 1',
    [subscription.subscriptionId],
  );
  if (used.length > 0) {
    throw new Error('This subscription text has already been used.');
  }

  const publicKey = await crypto.subtle.importKey(
    'spki',
    decodePublicKey(publicKeySpki),
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signedPayload = new TextEncoder().encode(
    `BINGO_SUBSCRIPTION\n${subscription.deviceId}\n${subscription.date}\n${subscription.subscriptionId}\n${subscription.days}`,
  );
  const signatureIsValid = await crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 32 },
    publicKey,
    decodeBase64Url(signatureText),
    signedPayload,
  );
  if (!signatureIsValid) {
    throw new Error('The subscription text signature is invalid.');
  }

  const [latestExpiry, now] = await Promise.all([
    getLatestExpiry(database, accountId),
    getTrustedNow(database),
  ]);
  const startsAt = Math.max(now, latestExpiry ? new Date(latestExpiry).getTime() : 0);
  const expiresAt = startsAt + subscription.days * DAY_MS;
  await database.execute(
    `INSERT INTO subscriptions
       (subscription_id, account_id, device_id, days, issue_date, starts_at, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      subscription.subscriptionId,
      accountId,
      subscription.deviceId,
      subscription.days,
      subscription.date,
      new Date(startsAt).toISOString(),
      new Date(expiresAt).toISOString(),
      new Date(now).toISOString(),
    ],
  );

  return getSubscriptionStatusFromDatabase(database, accountId);
}

export function formatExpiry(expiresAt: string | null): string {
  return expiresAt
    ? new Date(expiresAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';
}
