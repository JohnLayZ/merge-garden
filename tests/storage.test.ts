import { describe, it, expect } from 'vitest';
import { SAVE_VERSION, loadGame, saveGame, type KV } from '../src/storage';
import { applyMove, newGame } from '../src/game/state';

const fake = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

describe('storage', () => {
  it('round-trips state and best identically', () => {
    const kv = fake();
    const s = applyMove(applyMove(newGame(11), 'left'), 'down');
    saveGame(kv, s, 500);
    expect(loadGame(kv)).toEqual({ state: s, best: 500 });
  });
  it('returns null when empty, corrupt or invalid', () => {
    const kv = fake();
    expect(loadGame(kv)).toBeNull();
    kv.setItem('merge-garden:v1', '{nope');
    expect(loadGame(kv)).toBeNull();
    kv.setItem('merge-garden:v1', JSON.stringify({ version: SAVE_VERSION, state: { board: [1, 2] }, best: 1 }));
    expect(loadGame(kv)).toBeNull();
  });
  it('rejects out-of-range plant levels', () => {
    const kv = fake();
    const s = newGame(1);
    saveGame(kv, { ...s, board: s.board.map(() => 99) }, 0);
    expect(loadGame(kv)).toBeNull();
  });
  it('best is never below the stored score and the game continues deterministically', () => {
    const kv = fake();
    const s = applyMove(newGame(4), 'left');
    saveGame(kv, s, 0);
    const loaded = loadGame(kv)!;
    expect(loaded.best).toBe(s.score);
    expect(applyMove(loaded.state!, 'up')).toEqual(applyMove(s, 'up'));
  });
  it('does not throw if storage fails', () => {
    const bad: KV = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    expect(() => saveGame(bad, newGame(1), 0)).not.toThrow();
    expect(loadGame(bad)).toBeNull();
  });
});

describe('storage + game over', () => {
  it('keeps undo locked after reload in the lost state', async () => {
    const { undo } = await import('../src/game/state');
    const kv = fake();
    const s = applyMove(
      { ...newGame(1), board: [1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 0, 2, 1, 2] },
      'left',
    );
    expect(s.status).toBe('lost');
    saveGame(kv, s, 0);
    const loaded = loadGame(kv)!.state!;
    expect(loaded.status).toBe('lost');
    expect(undo(loaded)).toBe(loaded);
  });
});

describe('storage play time', () => {
  it('persists playMs with the game', () => {
    const kv = fake();
    const s = { ...applyMove(newGame(5), 'left'), playMs: 83_000 };
    saveGame(kv, s, 10);
    expect(loadGame(kv)?.state?.playMs).toBe(83_000);
  });
  it('defaults to 0 for old saves without playMs or with invalid values', () => {
    const kv = fake();
    const s = newGame(5) as unknown as Record<string, unknown>;
    delete s.playMs;
    kv.setItem('merge-garden:v1', JSON.stringify({ version: SAVE_VERSION, state: s, best: 0 }));
    expect(loadGame(kv)?.state?.playMs).toBe(0);
    kv.setItem('merge-garden:v1', JSON.stringify({ version: SAVE_VERSION, state: { ...s, playMs: -4 }, best: 0 }));
    expect(loadGame(kv)?.state?.playMs).toBe(0);
  });
});

describe('storage version', () => {
  it('discards an old save (no or old version) but keeps the best score', () => {
    const kv = fake();
    const old = { ...newGame(7), cans: 2, mergeCount: 12, score: 40 };
    kv.setItem('merge-garden:v1', JSON.stringify({ state: old, best: 900 }));
    expect(loadGame(kv)).toEqual({ state: null, best: 900 });
    kv.setItem('merge-garden:v1', JSON.stringify({ version: SAVE_VERSION - 1, state: old, best: 300 }));
    expect(loadGame(kv)).toEqual({ state: null, best: 300 });
  });
  it('discards a save of the 9-level game (version 2) but keeps its best score', () => {
    const kv = fake();
    const nine = { ...newGame(7), board: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0], score: 1200 };
    kv.setItem('merge-garden:v1', JSON.stringify({ version: 2, state: nine, best: 1500 }));
    expect(SAVE_VERSION).toBeGreaterThan(2);
    expect(loadGame(kv)).toEqual({ state: null, best: 1500 });
  });
  it('loads a save written before the spawn rule change (same version, same fields) without errors', () => {
    const kv = fake();
    const s = { ...newGame(9), board: [5, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], score: 77, moves: 12, rng: 123456789, playMs: 4000, prev: null };
    kv.setItem('merge-garden:v1', JSON.stringify({ version: SAVE_VERSION, state: s, best: 200 }));
    const loaded = loadGame(kv);
    expect(loaded?.state).toEqual(s);
    expect(loaded?.best).toBe(200);
    expect(applyMove(loaded!.state!, 'left').moves).toBe(13);
  });
  it('writes the current version and loads such a save', () => {
    const kv = fake();
    saveGame(kv, newGame(2), 5);
    expect(JSON.parse(kv.data.get('merge-garden:v1')!).version).toBe(SAVE_VERSION);
    expect(loadGame(kv)?.state).not.toBeNull();
  });
});
