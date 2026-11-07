import { MAX_LEVEL, SIZE, type GameState, type Snapshot } from './game/types';

const KEY = 'merge-garden:v1';
/**
 * Version of the saved game format. Saves with another (or no) version are discarded on load,
 * only the best score is kept. 2 = Paket 5 (no watering can, 9 plant levels).
 */
export const SAVE_VERSION = 2;

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Saved {
  /** null if the stored game is from an incompatible version (a new game starts, `best` is kept). */
  state: GameState | null;
  best: number;
}

function validSnapshot(s: unknown): s is Snapshot {
  if (!s || typeof s !== 'object') return false;
  const o = s as Record<string, unknown>;
  return (
    Array.isArray(o.board) &&
    o.board.length === SIZE * SIZE &&
    o.board.every((v) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MAX_LEVEL) &&
    ['score', 'moves', 'rng'].every((k) => Number.isFinite(o[k])) &&
    ['playing', 'won', 'lost'].includes(o.status as string)
  );
}

export function saveGame(kv: KV, state: GameState, best: number): void {
  try {
    kv.setItem(KEY, JSON.stringify({ version: SAVE_VERSION, state, best }));
  } catch {
    /* storage full or unavailable: ignore */
  }
}

/** Returns null if nothing (valid) is stored; `state: null` if the save is from an older version (best score kept). */
export function loadGame(kv: KV): Saved | null {
  try {
    const raw = kv.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { version?: unknown; state?: unknown; best?: unknown };
    if (data.version !== SAVE_VERSION) {
      const oldBest = typeof data.best === 'number' && Number.isFinite(data.best) && data.best > 0 ? data.best : 0;
      return { state: null, best: oldBest };
    }
    const st = data.state as Record<string, unknown> | undefined;
    if (!validSnapshot(st) || !Number.isFinite((st as unknown as { seed: unknown }).seed)) return null;
    const prev = (st as unknown as { prev: unknown }).prev;
    if (prev !== null && !validSnapshot(prev)) return null;
    const best = typeof data.best === 'number' && Number.isFinite(data.best) ? data.best : 0;
    const ms = (st as unknown as { playMs?: unknown }).playMs;
    const playMs = typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms : 0;
    return { state: { ...(st as unknown as GameState), playMs }, best: Math.max(best, (st as unknown as GameState).score) };
  } catch {
    return null;
  }
}
