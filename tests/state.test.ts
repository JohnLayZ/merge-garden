import { describe, it, expect } from 'vitest';
import { applyMove, computeStatus, isBlocked, newGame, undo } from '../src/game/state';
import { moveBoard } from '../src/game/board';
import { MAX_LEVEL, type Direction, type GameState } from '../src/game/types';

const PRE = MAX_LEVEL - 1; // the level just below the winning one

const withBoard = (rows: number[][], extra: Partial<GameState> = {}): GameState => ({
  ...newGame(1), board: rows.flat(), ...extra,
});
const Z = [0, 0, 0, 0];

describe('newGame', () => {
  it('starts with 2 plants (Seed or Planted Seed), score 0, playing', () => {
    const g = newGame(123);
    expect(g.board.filter((v) => v > 0)).toHaveLength(2);
    expect(g.board.every((v) => v === 0 || v === 1 || v === 2)).toBe(true);
    expect(g.score).toBe(0);
    expect(g.status).toBe('playing');
  });
});

describe('applyMove', () => {
  it('invalid move changes nothing', () => {
    const s = withBoard([[1, 2, 0, 0], Z, Z, Z]);
    expect(applyMove(s, 'left')).toBe(s);
  });
  it('valid move scores, counts and spawns', () => {
    const s = withBoard([[1, 1, 0, 0], Z, Z, Z]);
    const n = applyMove(s, 'left');
    expect(n.score).toBe(4);
    expect(n.moves).toBe(1);
    expect(n.board[0]).toBe(2);
    expect(n.board.filter((v) => v > 0).length).toBeGreaterThanOrEqual(2);
  });
  it('same seed + same moves = same game', () => {
    const dirs: Direction[] = ['left', 'up', 'right', 'down', 'left', 'left', 'up', 'down'];
    const run = () => dirs.reduce(applyMove, newGame(99));
    expect(run()).toEqual(run());
  });
});

describe('status', () => {
  it('wins when the last level (Ancient Tree) is created and the game is then over', () => {
    expect(MAX_LEVEL).toBeGreaterThanOrEqual(2);
    const s = withBoard([[PRE, PRE, 0, 0], Z, Z, Z]);
    const n = applyMove(s, 'left');
    expect(n.status).toBe('won');
    expect(n.score).toBe(2 ** MAX_LEVEL);
    for (const d of ['left', 'right', 'up', 'down'] as Direction[]) expect(applyMove(n, d)).toBe(n);
  });
  it('rejects undo after a win', () => {
    const n = applyMove(withBoard([[PRE, PRE, 3, 0], Z, Z, Z]), 'left');
    expect(n.status).toBe('won');
    expect(n.prev).not.toBeNull();
    expect(undo(n)).toBe(n);
  });
  it('does not win below the last level: only creating the last level of the list ends the game', () => {
    const below = applyMove(withBoard([[PRE - 1, PRE - 1, 0, 0], Z, Z, Z]), 'left');
    expect(below.board[0]).toBe(PRE);
    expect(below.status).toBe('playing');
    expect(applyMove(withBoard([[PRE, PRE, 0, 0], Z, Z, Z]), 'left').status).toBe('won');
  });
  it('is lost on a full board without merges', () => {
    const rows = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
    expect(isBlocked(rows.flat())).toBe(true);
    expect(computeStatus({ board: rows.flat(), status: 'playing' })).toBe('lost');
  });
  it('is lost after a move fills the board with no merges left', () => {
    const s = withBoard([[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [0, 2, 1, 2]]);
    const n = applyMove(s, 'left');
    expect(n.board.every((v) => v > 0)).toBe(true);
    expect(n.status).toBe('lost');
  });
  it('rejects undo after game over', () => {
    const s = withBoard([[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [0, 2, 1, 2]]);
    const n = applyMove(s, 'left');
    expect(n.status).toBe('lost');
    expect(n.prev).not.toBeNull();
    expect(undo(n)).toBe(n);
  });
  it('does not accept moves once lost', () => {
    const rows = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
    const s = withBoard(rows, { status: 'lost' });
    expect(applyMove(s, 'left')).toBe(s);
  });
});

describe('one new plant per valid move', () => {
  const count = (b: number[]) => b.filter((v) => v > 0).length;
  const DIRS: Direction[] = ['left', 'down', 'right', 'up'];

  it('after every valid move there is exactly one more tile than after merging (so one less per merge)', () => {
    let s = newGame(2024);
    for (let i = 0; i < 300 && s.status === 'playing'; i++) {
      const d = DIRS[i % 4];
      const moved = moveBoard(s.board, d);
      const n = applyMove(s, d);
      if (n === s) continue;
      expect(count(n.board)).toBe(count(moved.board) + 1);
      expect(count(moved.board)).toBeLessThanOrEqual(count(s.board));
      s = n;
    }
  });
  it('an invalid move creates no tile and returns the same state', () => {
    const s = withBoard([[1, 2, 0, 0], Z, Z, Z]);
    const n = applyMove(s, 'left');
    expect(n).toBe(s);
    expect(count(n.board)).toBe(2);
  });
  it('a spawn gives no points', () => {
    const s = withBoard([[1, 2, 0, 0], Z, Z, Z]);
    expect(applyMove(s, 'right').score).toBe(0);
  });
  it('undo after a move that spawned a Planted Seed restores the exact previous state and replays identically', () => {
    let found = 0;
    for (let seed = 1; seed < 400 && found < 3; seed++) {
      const before = withBoard([[3, 0, 0, 0], [0, 4, 0, 0], Z, Z], { rng: seed });
      const after = applyMove(before, 'right');
      const moved = moveBoard(before.board, 'right').board;
      const spawnedCell = after.board.findIndex((v, i) => v !== moved[i]);
      if (after.board[spawnedCell] !== 2) continue;
      found++;
      const back = undo(after);
      expect(back).toEqual({ ...before, prev: null });
      expect(applyMove(back, 'right')).toEqual(after);
    }
    expect(found).toBe(3);
  });
});
