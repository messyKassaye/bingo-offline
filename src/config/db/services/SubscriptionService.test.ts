// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const DEVICE_ID = 'device-1';
const DAY_MS = 24 * 60 * 60 * 1000;

type SubscriptionRow = { subscription_id: string; account_id: number; expires_at: string };
const cache = new Map<string, string>();
const subscriptionRows: SubscriptionRow[] = [];

/** Answers only the queries SubscriptionService sends. */
const fakeDatabase = {
  async select(sql: string, params: unknown[]) {
    if (sql.includes('FROM app_cache')) {
      const payload = cache.get(params[0] as string);
      return payload === undefined ? [] : [{ payload }];
    }
    if (sql.includes('MAX(expires_at)')) {
      const expiries = subscriptionRows
        .filter((row) => row.account_id === params[0])
        .map((row) => row.expires_at)
        .sort();
      return [{ expiresAt: expiries.at(-1) ?? null }];
    }
    if (sql.includes('WHERE subscription_id')) {
      return subscriptionRows.filter((row) => row.subscription_id === params[0]);
    }
    throw new Error(`Unexpected select: ${sql}`);
  },
  async execute(sql: string, params: unknown[]) {
    if (sql.includes('INSERT INTO app_cache')) {
      cache.set(params[0] as string, params[1] as string);
    } else if (sql.includes('INSERT INTO subscriptions')) {
      subscriptionRows.push({
        subscription_id: params[0] as string,
        account_id: params[1] as number,
        expires_at: params[6] as string,
      });
    } else {
      throw new Error(`Unexpected execute: ${sql}`);
    }
  },
};

vi.mock('./CashierShopCache', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./CashierShopCache')>()),
  getBingoDatabase: async () => fakeDatabase,
  getLocalDeviceId: async () => DEVICE_ID,
}));

const { applySignedSubscription, getSubscriptionStatus, isSubscriptionText } = await import(
  './SubscriptionService'
);

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

let keyPair: CryptoKeyPair;
let publicKeyPem: string;

/** Builds a code the same way the Balance Issuer does. */
async function issueSubscription(days: number, deviceId = DEVICE_ID, date = new Date()) {
  const issueDate = date.toISOString().slice(0, 10);
  const subscriptionId = crypto.randomUUID();
  const signature = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    keyPair.privateKey,
    new TextEncoder().encode(`BINGO_SUBSCRIPTION\n${deviceId}\n${issueDate}\n${subscriptionId}\n${days}`),
  );
  const subscription = { type: 'BINGO_SUBSCRIPTION', deviceId, date: issueDate, subscriptionId, days };
  const envelope = JSON.stringify({ subscription, signature: toBase64Url(new Uint8Array(signature)) });
  return `BINGO1:${toBase64Url(new TextEncoder().encode(envelope))}`;
}

beforeAll(async () => {
  keyPair = await crypto.subtle.generateKey(
    { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', keyPair.publicKey));
  publicKeyPem = btoa(String.fromCharCode(...spki));
});

beforeEach(() => {
  cache.clear();
  subscriptionRows.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SubscriptionService', () => {
  it('reports no subscription before any code is applied', async () => {
    expect(await getSubscriptionStatus(1)).toEqual({
      hasSubscription: false,
      isActive: false,
      expiresAt: null,
      daysLeft: 0,
    });
  });

  it('activates a 30-day subscription from a signed code', async () => {
    const code = await issueSubscription(30);
    expect(isSubscriptionText(code)).toBe(true);
    const status = await applySignedSubscription(code, 1, publicKeyPem);
    expect(status.isActive).toBe(true);
    expect(status.daysLeft).toBe(30);
  });

  it('stacks renewals on top of the remaining time', async () => {
    await applySignedSubscription(await issueSubscription(30), 1, publicKeyPem);
    const status = await applySignedSubscription(await issueSubscription(60), 1, publicKeyPem);
    expect(status.daysLeft).toBe(90);
  });

  it('rejects reused, tampered and other-device codes', async () => {
    const code = await issueSubscription(30);
    await applySignedSubscription(code, 1, publicKeyPem);
    await expect(applySignedSubscription(code, 1, publicKeyPem)).rejects.toThrow('already been used');

    await expect(
      applySignedSubscription(await issueSubscription(30, 'other-device'), 1, publicKeyPem),
    ).rejects.toThrow('different desktop');

    const envelope = JSON.parse(atob(code.slice(7).replace(/-/g, '+').replace(/_/g, '/')));
    envelope.subscription.days = 3650;
    envelope.subscription.subscriptionId = crypto.randomUUID();
    const tampered = `BINGO1:${toBase64Url(new TextEncoder().encode(JSON.stringify(envelope)))}`;
    await expect(applySignedSubscription(tampered, 1, publicKeyPem)).rejects.toThrow('signature is invalid');
  });

  it('does not treat balance credit text as a subscription', () => {
    const credit = `BINGO1:${toBase64Url(new TextEncoder().encode(JSON.stringify({ credit: {}, signature: '' })))}`;
    expect(isSubscriptionText(credit)).toBe(false);
  });

  it('expires after the paid days and ignores the clock being set back', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = new Date('2026-10-12T08:00:00.000Z');
    vi.setSystemTime(start);
    await applySignedSubscription(await issueSubscription(30, DEVICE_ID, start), 1, publicKeyPem);

    vi.setSystemTime(start.getTime() + 26 * DAY_MS);
    expect((await getSubscriptionStatus(1)).daysLeft).toBe(4);

    vi.setSystemTime(start.getTime() + 31 * DAY_MS);
    expect((await getSubscriptionStatus(1)).isActive).toBe(false);

    vi.setSystemTime(start);
    expect((await getSubscriptionStatus(1)).isActive).toBe(false);
  });
});
