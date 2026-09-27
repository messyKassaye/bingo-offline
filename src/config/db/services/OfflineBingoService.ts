import type Database from '@tauri-apps/plugin-sql';
import type { ICashierBingoShop } from '../../../module/games/bingo/model/ICashierBingoShop';
import type { IBingoGame } from '../../../module/games/bingo/model/IBingoGame';
import type { IBingoCard } from '../../../module/games/bingo/model/IBingoCard';
import type { IGamePattern } from '../../../module/games/bingo/model/IGamePattern';
import type { IAddCartella } from '../../../module/games/bingo/model/IAddCartella';
import { getBingoDatabase } from './CashierShopCache';
import { isTauri } from '@tauri-apps/api/core';
import { LOCAL_SESSION } from '../../../constants/constants';

export function getOfflineAccountId(): number | null {
  if (!isTauri()) return null;
  try {
    const session = localStorage.getItem(LOCAL_SESSION);
    if (!session) return null;
    const id = (JSON.parse(session) as { id?: unknown }).id;
    return Number.isInteger(id) && Number(id) > 0 ? Number(id) : null;
  } catch {
    return null;
  }
}

export const OFFLINE_PATTERNS: IGamePattern[] = [
  { id: 1, name: 'Default Patterns', value: 'default', status: 1 },
  { id: 2, name: 'Any Horizontal', value: 'any_horizontal', status: 1 },
  { id: 3, name: 'Any Vertical', value: 'any_vertical', status: 1 },
  { id: 4, name: 'Any Diagonal', value: 'any_diagonal', status: 1 },
  { id: 5, name: 'Any Two Lines', value: 'any_two_lines', status: 1 },
  { id: 6, name: 'Any Two Vertical', value: 'any_two_vertical', status: 1 },
  { id: 7, name: 'Any Two Horizontal', value: 'any_two_horizontal', status: 1 },
  { id: 8, name: 'Corners', value: 'corners', status: 1 },
  { id: 9, name: 'Horizontal Line', value: 'horizontal_line', status: 1 },
  { id: 10, name: 'Vertical Line', value: 'vertical_line', status: 1 },
];

const OFFLINE_GAME_BALANCE_FEE_RATE = 0.2;

type OfflineShopState = {
  shop: ICashierBingoShop;
  activeGame: IBingoGame | null;
  gameHistory: Array<IBingoGame & { endedAt: string; result?: string; balanceFee?: number }>;
};

const stateKey = (accountId: number) => `offline-shop-${accountId}`;
const stateQueues = new Map<number, Promise<void>>();

function randomColumn(start: number, end: number): number[] {
  const values = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values.slice(0, 5).sort((a, b) => a - b);
}

function createCard(): IBingoCard {
  const n = randomColumn(31, 45).slice(0, 4);
  return {
    B: randomColumn(1, 15),
    I: randomColumn(16, 30),
    N: [n[0], n[1], 'FREE', n[2], n[3]],
    G: randomColumn(46, 60),
    O: randomColumn(61, 75),
  };
}

async function createInitialState(
  database: Database,
  accountId: number,
): Promise<OfflineShopState> {
  const accounts = await database.select<Array<{ shop_name: string }>>(
    'SELECT shop_name FROM local_accounts WHERE id = $1 LIMIT 1',
    [accountId],
  );
  if (!accounts[0]) throw new Error('Offline shop account was not found.');
  const cards = Array.from({ length: 100 }, createCard);
  const shop: ICashierBingoShop = {
    id: accountId,
    agentShopOwnerId: accountId,
    bingoShopId: accountId,
    cashierId: accountId,
    agentShop: {
      id: accountId,
      name: accounts[0].shop_name,
      address: '',
      cartella: cards.length,
      share: 100,
      status: 1,
      userId: accountId,
      uniqueId: `offline-${accountId}`,
      cards,
      games: [],
      deposit: 0,
      cut: 0,
      activeCut: [{ cut: OFFLINE_GAME_BALANCE_FEE_RATE * 100, bingoAgentId: accountId }],
      company: {
        id: accountId,
        name: accounts[0].shop_name,
        cut: OFFLINE_GAME_BALANCE_FEE_RATE * 100,
        cards,
        logo: '',
        status: 1,
      },
    },
  };
  return { shop, activeGame: null, gameHistory: [] };
}

async function readState(
  database: Database,
  accountId: number,
): Promise<OfflineShopState> {
  const rows = await database.select<Array<{ payload: string }>>(
    'SELECT payload FROM app_cache WHERE cache_key = $1 LIMIT 1',
    [stateKey(accountId)],
  );
  if (rows[0]) {
    const state = JSON.parse(rows[0].payload) as OfflineShopState;
    // Keep existing local accounts on the current 20% offline game cut.
    state.shop.agentShop.activeCut = [{ cut: OFFLINE_GAME_BALANCE_FEE_RATE * 100, bingoAgentId: accountId }];
    if (state.shop.agentShop.company) {
      state.shop.agentShop.company.cut = OFFLINE_GAME_BALANCE_FEE_RATE * 100;
    }
    return state;
  }
  const initial = await createInitialState(database, accountId);
  await writeState(database, accountId, initial);
  return initial;
}

async function writeState(
  database: Database,
  accountId: number,
  state: OfflineShopState,
): Promise<void> {
  state.shop.agentShop.games = state.activeGame ? [state.activeGame] : [];
  const timestamp = new Date().toISOString();
  await database.execute(
    `INSERT INTO app_cache (cache_key, payload, updated_at)
     VALUES ($1, $2, $3)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload = excluded.payload, updated_at = excluded.updated_at`,
    [stateKey(accountId), JSON.stringify(state), new Date().toISOString()],
  );
  if (state.activeGame) {
    await database.execute(
      `INSERT INTO offline_games (account_id, game_id, game_data, status, created_at)
       VALUES ($1, $2, $3, 'active', $4)
       ON CONFLICT(account_id, game_id) DO UPDATE SET
         game_data = excluded.game_data, status = 'active', ended_at = NULL, result = NULL`,
      [accountId, state.activeGame.id, JSON.stringify(state.activeGame), timestamp],
    );
  }
  for (const game of state.gameHistory) {
    await database.execute(
      `INSERT INTO offline_games
         (account_id, game_id, game_data, status, created_at, ended_at, result)
       VALUES ($1, $2, $3, 'completed', $4, $5, $6)
       ON CONFLICT(account_id, game_id) DO UPDATE SET
         game_data = excluded.game_data, status = 'completed',
         ended_at = excluded.ended_at, result = excluded.result`,
      [accountId, game.id, JSON.stringify(game), timestamp, game.endedAt, game.result ?? 'ended'],
    );
  }
}

export async function getOfflinePatterns(accountId: number): Promise<IGamePattern[]> {
  const database = await getBingoDatabase();
  for (const pattern of OFFLINE_PATTERNS) {
    await database.execute(
      `INSERT OR IGNORE INTO offline_game_patterns (account_id, id, name, value, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [accountId, pattern.id, pattern.name, pattern.value, pattern.status],
    );
  }
  return database.select<IGamePattern[]>(
    `SELECT id, name, value, status FROM offline_game_patterns
     WHERE account_id = $1 ORDER BY id`,
    [accountId],
  );
}

async function withState<T>(
  accountId: number,
  update: (state: OfflineShopState) => T | Promise<T>,
): Promise<T> {
  const previous = stateQueues.get(accountId) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queued = previous.then(() => current);
  stateQueues.set(accountId, queued);
  await previous;
  try {
    const database = await getBingoDatabase();
    const state = await readState(database, accountId);
    const result = await update(state);
    await writeState(database, accountId, state);
    return result;
  } finally {
    release();
    if (stateQueues.get(accountId) === queued) stateQueues.delete(accountId);
  }
}

async function getOfflineBalanceFromDatabase(database: Database, accountId: number): Promise<number> {
  const [credits, debits] = await Promise.all([
    database.select<Array<{ balance: number }>>(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM balance_credits WHERE account_id = $1',
      [accountId],
    ),
    database.select<Array<{ balance: number }>>(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM balance_debits WHERE account_id = $1',
      [accountId],
    ),
  ]);
  return (credits[0]?.balance ?? 0) - (debits[0]?.balance ?? 0);
}

function getGameCommission(game: IBingoGame | null): number {
  if (!game) return 0;
  return Math.round(
    game.selectedCartella.length * game.betAmount * OFFLINE_GAME_BALANCE_FEE_RATE * 100,
  ) / 100;
}

export type OfflineDashboardSummary = {
  totalCollectedMoney: number;
  totalPayIn: number;
  totalGame: number;
  totalBalance: number;
};

function localDateKey(value: string | number): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Daily game totals and remaining credited balance for the offline dashboard. */
export async function getOfflineDashboardSummary(accountId: number): Promise<OfflineDashboardSummary> {
  return withState(accountId, async (state) => {
    const database = await getBingoDatabase();
    const today = localDateKey(Date.now());
    const completedToday = state.gameHistory.filter(
      (game) => game.result === 'ended' && localDateKey(game.endedAt) === today,
    );
    const activeToday = state.activeGame && localDateKey(state.activeGame.id) === today
      ? [state.activeGame]
      : [];
    const games = [...completedToday, ...activeToday];
    const totalCollectedMoney = games.reduce(
      (total, game) => total + game.selectedCartella.length * game.betAmount,
      0,
    );
    const totalPayIn = Math.round(
      totalCollectedMoney * OFFLINE_GAME_BALANCE_FEE_RATE * 100,
    ) / 100;
    const balanceBeforeCurrentGame = await getOfflineBalanceFromDatabase(database, accountId);

    return {
      totalCollectedMoney,
      totalPayIn,
      totalGame: games.length,
      totalBalance: Math.max(0, balanceBeforeCurrentGame - getGameCommission(state.activeGame)),
    };
  });
}

export async function getOfflineShop(
  accountId: number,
): Promise<ICashierBingoShop> {
  return withState(accountId, async (state) => {
    const database = await getBingoDatabase();
    state.shop.agentShop.deposit = await getOfflineBalanceFromDatabase(database, accountId);
    return state.shop;
  });
}

/** Replaces the saved offline cartella deck with cards extracted from a PDF. */
export async function replaceOfflineCartellas(
  accountId: number,
  cards: IBingoCard[],
): Promise<void> {
  if (cards.length === 0) throw new Error('The PDF does not contain any cartellas.');
  await withState(accountId, (state) => {
    if (state.activeGame) {
      throw new Error('End the current game before replacing the cartellas.');
    }
    state.shop.agentShop.cards = cards;
    state.shop.agentShop.cartella = cards.length;
    if (state.shop.agentShop.company) {
      state.shop.agentShop.company.cards = cards;
    }
  });
}

export async function startOfflineGame(
  accountId: number,
  gamePattern: string,
  betAmount: number,
): Promise<IBingoGame> {
  return withState(accountId, async (state) => {
    const database = await getBingoDatabase();
    const balance = await getOfflineBalanceFromDatabase(database, accountId);
    if (balance <= 0) {
      throw new Error('Your balance is zero. Add balance from Dashboard > Balance before starting a game.');
    }
    if (state.activeGame) {
      // Closing the selection dialog must not discard the in-progress game.
      // Reopening it resumes the same persisted game and selected cartellas.
      return state.activeGame;
    }
    const pattern = OFFLINE_PATTERNS.find((item) => item.value === gamePattern) ?? OFFLINE_PATTERNS[0];
    state.activeGame = {
      id: Date.now(),
      bingoShopId: state.shop.bingoShopId,
      betAmount,
      selectedCartella: [],
      lockedCartella: [],
      calledNumbers: [],
      gamePattern: pattern,
      isCalling: false,
    };
    return state.activeGame;
  });
}

export async function updateOfflineGame(
  accountId: number,
  update: (game: IBingoGame) => void,
): Promise<IBingoGame> {
  return withState(accountId, (state) => {
    if (!state.activeGame) throw new Error('There is no active game. Start a new game first.');
    update(state.activeGame);
    return state.activeGame;
  });
}

export async function setOfflineGamePattern(
  accountId: number,
  pattern: IGamePattern,
): Promise<void> {
  await withState(accountId, (state) => {
    if (state.activeGame) state.activeGame.gamePattern = pattern;
  });
}

export async function updateOfflineBetAmount(
  accountId: number,
  betAmount: number,
): Promise<IBingoGame> {
  return withState(accountId, async (state) => {
    if (!state.activeGame) throw new Error('There is no active game. Start a new game first.');
    const requiredFee = Math.round(
      state.activeGame.selectedCartella.length * betAmount * OFFLINE_GAME_BALANCE_FEE_RATE * 100,
    ) / 100;
    const database = await getBingoDatabase();
    const balance = await getOfflineBalanceFromDatabase(database, accountId);
    if (requiredFee > balance) {
      throw new Error('Balance must cover the 20% game fee for the selected cartellas. Add balance from Dashboard > Balance.');
    }
    state.activeGame.betAmount = betAmount;
    return state.activeGame;
  });
}

export async function addOfflineCartella(
  accountId: number,
  selection: IAddCartella,
): Promise<IAddCartella> {
  await withState(accountId, async (state) => {
    if (!state.activeGame) throw new Error('There is no active game. Start a new game first.');
    const game = state.activeGame;
    const selected = new Set(game.selectedCartella);
    if (selected.has(selection.selectedCartella)) selected.delete(selection.selectedCartella);
    else selected.add(selection.selectedCartella);
    const nextSelection = [...selected].sort((a, b) => a - b);
    const requiredFee = Math.round(nextSelection.length * game.betAmount * OFFLINE_GAME_BALANCE_FEE_RATE * 100) / 100;
    const database = await getBingoDatabase();
    const balance = await getOfflineBalanceFromDatabase(database, accountId);
    if (requiredFee > balance) {
      throw new Error('Balance must cover the 20% game fee before selecting these cartellas. Add balance from Dashboard > Balance.');
    }
    game.selectedCartella = nextSelection;
  });
  return { ...selection, isSelect: !selection.isSelect };
}

export async function getOfflineDeposit(accountId: number) {
  const shop = await getOfflineShop(accountId);
  return shop.agentShop;
}

export async function endOfflineGame(
  accountId: number,
  result: 'ended' | 'refunded',
): Promise<{ status: boolean; message: string }> {
  return withState(accountId, async (state) => {
    if (!state.activeGame) return { status: true, message: 'No active game.' };
    const game = state.activeGame;
    const requestedBalanceFee = result === 'ended'
      ? Math.round(game.selectedCartella.length * game.betAmount * OFFLINE_GAME_BALANCE_FEE_RATE * 100) / 100
      : 0;
    const balanceFee = requestedBalanceFee;
    if (balanceFee > 0) {
      const database = await getBingoDatabase();
      // The fee was reserved as cartellas were selected, so settle the full
      // 20% once here instead of capping it to a lower remaining balance.
      await database.execute(
        `INSERT OR IGNORE INTO balance_debits (debit_id, account_id, amount, reason, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [`${accountId}-game-cut-${game.id}`, accountId, balanceFee, `20% game fee for game ${game.id}`, new Date().toISOString()],
      );
    }
    state.gameHistory.push({
      ...game,
      endedAt: new Date().toISOString(),
      result,
      balanceFee,
    });
    state.activeGame = null;
    return { status: true, message: balanceFee > 0
      ? `Game ${result}. Balance fee deducted: ${balanceFee.toFixed(2)}.`
      : `Game ${result}.` };
  });
}

const COLUMNS = ['B', 'I', 'N', 'G', 'O'] as const;

function normalizePatternValue(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['all', 'default_pattern', 'default_patterns'].includes(normalized)) return 'default';
  if (['corner', 'four_corner', 'four_corners'].includes(normalized)) return 'corners';
  if (['horizontal', 'any_horizontal'].includes(normalized)) return 'horizontal_line';
  if (['vertical', 'any_vertical'].includes(normalized)) return 'vertical_line';
  if (['diagonal', 'any_diagonal'].includes(normalized)) return 'any_diagonal';
  return normalized;
}

function checkPattern(
  card: IBingoCard,
  called: Set<number>,
  patternValue: string,
): Array<{ pattern: string; index: number }> {
  const lines: Array<{ pattern: string; index: number; cells: Array<[number, number]> }> = [];
  const line = (name: string, coords: Array<[number, number]>, index: number) =>
    lines.push({ pattern: name, index, cells: coords });
  for (let row = 0; row < 5; row += 1) {
    line('Horizontal Line', COLUMNS.map((_, col) => [row, col]), row);
  }
  for (let col = 0; col < 5; col += 1) {
    line('Vertical Line', COLUMNS.map((_, row) => [row, col]), col);
  }
  line('Diagonal (Top-Left to Bottom-Right)', [0, 1, 2, 3, 4].map((i) => [i, i]), 0);
  line('Diagonal (Top-Right to Bottom-Left)', [0, 1, 2, 3, 4].map((i) => [i, 4 - i]), 0);
  line('Corners', [[0, 0], [0, 4], [4, 0], [4, 4]], 0);
  const isMarked = (row: number, col: number) => {
    const value = card[COLUMNS[col]][row];
    return value === 'FREE' || called.has(Number(value));
  };
  const matching = lines.filter((candidate) => {
    if (patternValue === 'horizontal_line' && candidate.pattern !== 'Horizontal Line') return false;
    if (patternValue === 'vertical_line' && candidate.pattern !== 'Vertical Line') return false;
    if (patternValue === 'any_diagonal' && !candidate.pattern.startsWith('Diagonal')) return false;
    if (patternValue === 'any_two_vertical' && candidate.pattern !== 'Vertical Line') return false;
    if (patternValue === 'any_two_horizontal' && candidate.pattern !== 'Horizontal Line') return false;
    if (patternValue === 'corners' && candidate.pattern !== 'Corners') return false;
    return candidate.cells.every(([row, col]) => isMarked(row, col));
  });
  if (patternValue === 'any_two_lines' || patternValue === 'any_two_vertical' || patternValue === 'any_two_horizontal') {
    if (matching.length < 2) return [];
    return matching;
  }
  return matching.map(({ pattern, index }) => ({ pattern, index }));
}

export async function checkOfflineWinner(
  accountId: number,
  cartellaNumber: number,
  calledNumbers: number[],
  selectedPattern?: string,
): Promise<{ hasWon: boolean; winningLines: any[] }> {
  return withState(accountId, (state) => {
    const game = state.activeGame;
    if (!game || !game.selectedCartella.includes(cartellaNumber)) {
      throw new Error('This cartella is not added to the active game.');
    }
    const card = state.shop.agentShop.company?.cards?.[cartellaNumber - 1];
    if (!card) throw new Error('The local card for this cartella was not found.');
    const patternValue = normalizePatternValue(selectedPattern || game.gamePattern.value);
    const matches = checkPattern(card, new Set(calledNumbers), patternValue);
    const resultLines = matches.map((match) => ({
      ...match,
      cartella: card,
      calledNumbers,
    }));
    // Keep the checked card and called numbers available to the result view
    // even when none of the configured patterns matched.
    const winningLines = resultLines.length > 0
      ? resultLines
      : [{ pattern: null, index: -1, cartella: card, calledNumbers }];
    return { hasWon: resultLines.length > 0, winningLines };
  });
}

export async function lockOfflineCartella(
  accountId: number,
  cartellaNumber: number,
): Promise<{ status: boolean; message: string }> {
  return updateOfflineGame(accountId, (game) => {
    if (!game.selectedCartella.includes(cartellaNumber)) {
      throw new Error('This cartella is not in the active game.');
    }
    if (!game.lockedCartella.includes(cartellaNumber)) {
      game.lockedCartella.push(cartellaNumber);
    }
  }).then(() => ({ status: true, message: `Cartella ${cartellaNumber} locked.` }));
}

export async function appendOfflineCalledNumber(
  accountId: number,
  calledNumber: number,
): Promise<void> {
  await updateOfflineGame(accountId, (game) => {
    if (!game.calledNumbers.includes(calledNumber)) game.calledNumbers.push(calledNumber);
  });
}
