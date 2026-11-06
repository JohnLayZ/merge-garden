import { MAX_CANS, MAX_LEVEL, SIZE, type GameState, type Snapshot } from './game/types';

const KEY = 'merge-garden:v1';

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Saved {
  state: GameState;
  best: number;
}

function validSnapshot(s: unknown): s is Snapshot {
  if (!s || typeof s !== 'object') return false;
  const o = s as Record<string, unknown>;
  return (
    Array.isArray(o.board) &&
    o.board.length === SIZE * SIZE &&
    o.board.every((v) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MAX_LEVEL) &&
    ['score', 'mergeCount', 'moves', 'rng'].every((k) => Number.isFinite(o[k])) &&
    Number.isInteger(o.cans) && (o.cans as number) >= 0 && (o.cans as number) <= MAX_CANS &&
    ['playing', 'won', 'lost'].includes(o.status as string)
  );
}

export function saveGame(kv: KV, state: GameState, best: number): void {
  try {
    kv.setItem(KEY, JSON.stringify({ state, best }));
  } catch {
    /* storage full or unavailable: ignore */
  }
}

/** Returns null if nothing (valid) is stored. */
export function loadGame(kv: KV): Saved | null {
  try {
    const raw = kv.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { state?: unknown; best?: unknown };
    const st = data.state as Record<string, unknown> | undefined;
    if (!validSnapshot(st) || !Number.isFinite((st as unknown as { seed: unknown }).seed)) return null;
    const prev = (st as unknown as { prev: unknown }).prev;
    if (prev !== null && !validSnapshot(prev)) return null;
    const best = typeof data.best === 'number' && Number.isFinite(data.best) ? data.best : 0;
    return { state: st as unknown as GameState, best: Math.max(best, (st as unknown as GameState).score) };
  } catch {
    return null;
  }
}
