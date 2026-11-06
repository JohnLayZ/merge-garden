import { describe, it, expect } from 'vitest';
import { loadGame, saveGame, type KV } from '../src/storage';
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
    kv.setItem('merge-garden:v1', JSON.stringify({ state: { board: [1, 2] }, best: 1 }));
    expect(loadGame(kv)).toBeNull();
  });
  it('rejects out-of-range plant levels', () => {
    const kv = fake();
    const s = newGame(1);
    saveGame(kv, { ...s, board: s.board.map(() => 9) }, 0);
    expect(loadGame(kv)).toBeNull();
  });
  it('best is never below the stored score and the game continues deterministically', () => {
    const kv = fake();
    const s = applyMove(newGame(4), 'left');
    saveGame(kv, s, 0);
    const loaded = loadGame(kv)!;
    expect(loaded.best).toBe(s.score);
    expect(applyMove(loaded.state, 'up')).toEqual(applyMove(s, 'up'));
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
    const loaded = loadGame(kv)!.state;
    expect(loaded.status).toBe('lost');
    expect(undo(loaded)).toBe(loaded);
  });
});
