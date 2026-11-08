import { describe, it, expect } from 'vitest';
import { nextRandom } from '../src/game/rng';
import { LEVELS } from '../src/levels';
import { SPAWN_PLANTED_SEED_CHANCE, SPAWN_PLANTED_SEED_LEVEL, SPAWN_SEED_LEVEL, spawnPlant } from '../src/game/spawn';

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

describe('spawnPlant', () => {
  it('adds exactly one plant (Seed or Planted Seed) on an empty cell, never touching others', () => {
    let rng = 7;
    for (let i = 0; i < 300; i++) {
      const board = new Array(16).fill(0);
      board[0] = 3; board[5] = 2;
      const r = spawnPlant(board, rng);
      rng = r.rng;
      const added = r.board.map((v, k) => (v !== board[k] ? k : -1)).filter((k) => k >= 0);
      expect(added).toHaveLength(1);
      expect([SPAWN_SEED_LEVEL, SPAWN_PLANTED_SEED_LEVEL]).toContain(r.board[added[0]]);
      expect(board[added[0]]).toBe(0);
      expect(r.board[0]).toBe(3);
      expect(r.board[5]).toBe(2);
    }
  });
  it('uses the first two entries of the level list and a named chance of 10 %', () => {
    expect(LEVELS[SPAWN_SEED_LEVEL - 1].name).toBe('Seed');
    expect(LEVELS[SPAWN_PLANTED_SEED_LEVEL - 1].name).toBe('Planted Seed');
    expect(SPAWN_PLANTED_SEED_CHANCE).toBe(0.1);
  });
  it('is about 90 % Seed and 10 % Planted Seed over many spawns (fixed rng, deterministic)', () => {
    let rng = 12345;
    let planted = 0;
    const N = 10_000;
    for (let i = 0; i < N; i++) {
      const r = spawnPlant(new Array(16).fill(0), rng);
      rng = r.rng;
      if (r.board.includes(SPAWN_PLANTED_SEED_LEVEL)) planted++;
    }
    expect(planted / N).toBeGreaterThan(0.09);
    expect(planted / N).toBeLessThan(0.11);
  });
  it('is deterministic for the same rng state', () => {
    const board = new Array(16).fill(0);
    expect(spawnPlant(board, 5)).toEqual(spawnPlant(board, 5));
  });
  it('fills the only empty cell and leaves a full board unchanged', () => {
    for (let rng = 1; rng <= 50; rng++) {
      const board = new Array(16).fill(2);
      board[9] = 0;
      const r = spawnPlant(board, rng);
      expect([SPAWN_SEED_LEVEL, SPAWN_PLANTED_SEED_LEVEL]).toContain(r.board[9]);
      expect(r.board.filter((v, k) => v !== board[k])).toHaveLength(1);
    }
    const full = new Array(16).fill(2);
    expect(spawnPlant(full, 1).board).toEqual(full);
  });
});
