import { isTauri } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import type { ICashierBingoShop } from '../../../module/games/bingo/model/ICashierBingoShop';

const DATABASE_URL = 'sqlite:bingo.db';
const SHOP_CACHE_KEY = 'cashier-shop';

let databasePromise: Promise<Database> | undefined;

export async function getBingoDatabase(): Promise<Database> {
  if (!isTauri()) {
    throw new Error('The local shop database is available in the desktop app.');
  }

  databasePromise ??= Database.load(DATABASE_URL).then(async (database) => {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS app_cache (
        cache_key TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    await database.execute(`
      CREATE TABLE IF NOT EXISTS local_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_name TEXT NOT NULL,
        username TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    await database.execute(`
      CREATE TABLE IF NOT EXISTS balance_credits (
        credit_id TEXT PRIMARY KEY NOT NULL,
        account_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        device_id TEXT NOT NULL,
        credit_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(account_id) REFERENCES local_accounts(id)
      )
    `);
    await database.execute(`
      CREATE TABLE IF NOT EXISTS balance_debits (
        debit_id TEXT PRIMARY KEY NOT NULL,
        account_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(account_id) REFERENCES local_accounts(id)
      )
    `);
    await database.execute(`
      CREATE TABLE IF NOT EXISTS offline_game_patterns (
        id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        status INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (account_id, id),
        UNIQUE (account_id, value)
      )
    `);
    await database.execute(`
      CREATE TABLE IF NOT EXISTS offline_games (
        account_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        game_data TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        ended_at TEXT,
        result TEXT,
        PRIMARY KEY (account_id, game_id)
      )
    `);
    return database;
  });

  return databasePromise;
}

export async function saveCashierShop(shop: ICashierBingoShop): Promise<void> {
  const database = await getBingoDatabase();
  await database.execute(
    `INSERT INTO app_cache (cache_key, payload, updated_at)
     VALUES ($1, $2, $3)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload = excluded.payload,
       updated_at = excluded.updated_at`,
    [SHOP_CACHE_KEY, JSON.stringify(shop), new Date().toISOString()],
  );
}

export async function loadCashierShop(): Promise<ICashierBingoShop | null> {
  const database = await getBingoDatabase();
  const rows = await database.select<{ payload: string }[]>(
    'SELECT payload FROM app_cache WHERE cache_key = $1 LIMIT 1',
    [SHOP_CACHE_KEY],
  );

  return rows[0] ? (JSON.parse(rows[0].payload) as ICashierBingoShop) : null;
}

export type LocalAccount = {
  id: number;
  shopName: string;
  username: string;
};

type StoredLocalAccount = LocalAccount & {
  password_salt: string;
  password_hash: string;
};

const PASSWORD_HASH_ITERATIONS = 310_000;
const textEncoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

async function hashPassword(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PASSWORD_HASH_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

function constantTimeEquals(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

export async function registerLocalAccount(input: {
  shopName: string;
  username: string;
  password: string;
}): Promise<void> {
  const database = await getBingoDatabase();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(input.password, salt);
  await database.execute(
    `INSERT INTO local_accounts (shop_name, username, password_salt, password_hash, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      input.shopName.trim(),
      input.username.trim(),
      toBase64(salt),
      passwordHash,
      new Date().toISOString(),
    ],
  );
}

export async function authenticateLocalAccount(
  username: string,
  password: string,
): Promise<LocalAccount | null> {
  const database = await getBingoDatabase();
  const rows = await database.select<StoredLocalAccount[]>(
    `SELECT id, shop_name AS shopName, username, password_salt, password_hash
     FROM local_accounts WHERE username = $1 LIMIT 1`,
    [username.trim()],
  );
  const account = rows[0];
  if (!account) return null;

  const suppliedHash = await hashPassword(
    password,
    fromBase64(account.password_salt),
  );
  if (
    !constantTimeEquals(
      fromBase64(suppliedHash),
      fromBase64(account.password_hash),
    )
  ) {
    return null;
  }

  return {
    id: account.id,
    shopName: account.shopName,
    username: account.username,
  };
}

export async function getLocalDeviceId(): Promise<string> {
  const database = await getBingoDatabase();
  const cacheKey = 'device-id';
  const rows = await database.select<{ payload: string }[]>(
    'SELECT payload FROM app_cache WHERE cache_key = $1 LIMIT 1',
    [cacheKey],
  );
  if (rows[0]) return rows[0].payload;

  const deviceId = crypto.randomUUID();
  await database.execute(
    'INSERT INTO app_cache (cache_key, payload, updated_at) VALUES ($1, $2, $3)',
    [cacheKey, deviceId, new Date().toISOString()],
  );
  return deviceId;
}

export async function createBalanceRequestText(): Promise<string> {
  return getLocalDeviceId();
}

type SignedBalanceCredit = {
  type: 'BINGO_BALANCE_CREDIT';
  deviceId: string;
  date: string;
  creditId: string;
  amount: number;
  signature: string;
};

function decodeSignature(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
}

function decodePublicKey(value: string): Uint8Array<ArrayBuffer> {
  const encoded = value
    .replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  return fromBase64(encoded);
}

function isValidCreditDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return false;
  }
  const ageInDays =
    (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000);
  return ageInDays >= 0 && ageInDays <= 30;
}

export async function applySignedBalanceCredit(
  balanceText: string,
  accountId: number,
  publicKeySpki: string,
): Promise<number> {
  if (!publicKeySpki.trim()) {
    throw new Error('The balance verification public key is not configured.');
  }

  let credit: SignedBalanceCredit;
  let signatureText: string;
  try {
    const trimmedText = balanceText.trim();
    if (trimmedText.startsWith('BINGO1:')) {
      const envelope = JSON.parse(
        new TextDecoder().decode(decodeBase64Url(trimmedText.slice('BINGO1:'.length))),
      ) as { credit: SignedBalanceCredit; signature: string };
      credit = envelope.credit;
      signatureText = envelope.signature;
    } else {
      // Continue to accept previously generated signed JSON balance text.
      credit = JSON.parse(trimmedText) as SignedBalanceCredit;
      signatureText = credit.signature;
    }
  } catch {
    throw new Error('The balance text is invalid. Check that the full text was copied.');
  }

  if (
    credit.type !== 'BINGO_BALANCE_CREDIT' ||
    typeof credit.deviceId !== 'string' ||
    typeof credit.creditId !== 'string' ||
    !Number.isFinite(credit.amount) ||
    credit.amount <= 0 ||
    typeof signatureText !== 'string' ||
    !isValidCreditDate(credit.date)
  ) {
    throw new Error('The balance text is incomplete or expired.');
  }

  const localDeviceId = await getLocalDeviceId();
  if (credit.deviceId !== localDeviceId) {
    throw new Error('This balance text belongs to a different desktop.');
  }

  const database = await getBingoDatabase();
  const usedCredits = await database.select<{ credit_id: string }[]>(
    'SELECT credit_id FROM balance_credits WHERE credit_id = $1 LIMIT 1',
    [credit.creditId],
  );
  if (usedCredits.length > 0) {
    throw new Error('This balance text has already been used.');
  }

  const publicKey = await crypto.subtle.importKey(
    'spki',
    decodePublicKey(publicKeySpki),
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signedPayload = textEncoder.encode(
    `${credit.deviceId}\n${credit.date}\n${credit.creditId}\n${credit.amount}`,
  );
  const signatureIsValid = await crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 32 },
    publicKey,
    decodeSignature(signatureText),
    signedPayload,
  );
  if (!signatureIsValid) {
    throw new Error('The balance text signature is invalid.');
  }

  await database.execute(
    `INSERT INTO balance_credits
       (credit_id, account_id, amount, device_id, credit_date, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      credit.creditId,
      accountId,
      credit.amount,
      credit.deviceId,
      credit.date,
      new Date().toISOString(),
    ],
  );

  const [credits, debits] = await Promise.all([
    database.select<{ balance: number }[]>(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM balance_credits WHERE account_id = $1',
      [accountId],
    ),
    database.select<{ balance: number }[]>(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM balance_debits WHERE account_id = $1',
      [accountId],
    ),
  ]);
  return (credits[0]?.balance ?? 0) - (debits[0]?.balance ?? 0);
}

export async function getLocalBalance(accountId: number): Promise<number> {
  const database = await getBingoDatabase();
  const [credits, debits] = await Promise.all([
    database.select<{ balance: number }[]>(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM balance_credits WHERE account_id = $1',
      [accountId],
    ),
    database.select<{ balance: number }[]>(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM balance_debits WHERE account_id = $1',
      [accountId],
    ),
  ]);
  return (credits[0]?.balance ?? 0) - (debits[0]?.balance ?? 0);
}
