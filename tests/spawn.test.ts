import { describe, it, expect } from 'vitest';
import { nextRandom } from '../src/game/rng';
import { spawnSeeds } from '../src/game/spawn';

describe('rng', () => {
  it('is deterministic and in [0,1)', () => {
    let a = 42, b = 42;
    for (let i = 0; i < 100; i++) {
      const x = nextRandom(a), y = nextRandom(b);
      a = x.state; b = y.state;
      expect(x.value).toBe(y.value);
      expect(x.value).toBeGreaterThanOrEqual(0);
      expect(x.value).toBeLessThan(1);
    }
  });
  it('differs between seeds', () => expect(nextRandom(1).value).not.toBe(nextRandom(2).value));
});

describe('spawnSeeds', () => {
  it('adds 1 or 2 seeds on empty cells only, never touching others', () => {
    let rng = 7;
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const board = new Array(16).fill(0);
      board[0] = 3; board[5] = 2;
      const r = spawnSeeds(board, rng);
      rng = r.rng;
      const added = r.board.filter((v) => v === 1).length;
      seen.add(added);
      expect(added).toBeGreaterThanOrEqual(1);
      expect(added).toBeLessThanOrEqual(2);
      expect(r.board[0]).toBe(3);
      expect(r.board[5]).toBe(2);
    }
    expect(seen).toEqual(new Set([1, 2]));
  });
  it('is deterministic for the same rng state', () => {
    const board = new Array(16).fill(0);
    expect(spawnSeeds(board, 5)).toEqual(spawnSeeds(board, 5));
  });
  it('handles a single empty cell and a full board', () => {
    const board = new Array(16).fill(2);
    board[9] = 0;
    expect(spawnSeeds(board, 1).board[9]).toBe(1);
    const full = new Array(16).fill(2);
    expect(spawnSeeds(full, 1).board).toEqual(full);
  });
});
