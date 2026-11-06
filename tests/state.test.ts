import { describe, it, expect } from 'vitest';
import { applyMove, computeStatus, isBlocked, newGame, undo, useWateringCan } from '../src/game/state';
import type { Direction, GameState } from '../src/game/types';

const withBoard = (rows: number[][], extra: Partial<GameState> = {}): GameState => ({
  ...newGame(1), board: rows.flat(), ...extra,
});
const Z = [0, 0, 0, 0];

describe('newGame', () => {
  it('starts with 2 seeds, score 0, playing', () => {
    const g = newGame(123);
    expect(g.board.filter((v) => v === 1).length).toBeGreaterThanOrEqual(2);
    expect(g.board.filter((v) => v === 1).length).toBeLessThanOrEqual(3);
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
    expect(n.mergeCount).toBe(1);
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
  it('wins when level 7 is created and the game is then over', () => {
    const s = withBoard([[6, 6, 0, 0], Z, Z, Z]);
    const n = applyMove(s, 'left');
    expect(n.status).toBe('won');
    expect(n.score).toBe(128);
    for (const d of ['left', 'right', 'up', 'down'] as Direction[]) expect(applyMove(n, d)).toBe(n);
  });
  it('rejects watering and undo after a win', () => {
    const n = applyMove(withBoard([[6, 6, 3, 0], Z, Z, Z], { cans: 2 }), 'left');
    expect(n.status).toBe('won');
    expect(n.prev).not.toBeNull();
    expect(useWateringCan(n, 1)).toBe(n);
    expect(undo(n)).toBe(n);
  });
  it('is lost on a full board without merges or cans', () => {
    const rows = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
    expect(isBlocked(rows.flat())).toBe(true);
    expect(computeStatus({ board: rows.flat(), cans: 0, status: 'playing' })).toBe('lost');
  });
  it('is not lost while a can can still upgrade something', () => {
    const rows = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
    expect(computeStatus({ board: rows.flat(), cans: 1, status: 'playing' })).toBe('playing');
  });
  it('is lost after a move fills the board with no merges left', () => {
    const s = withBoard([[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [0, 2, 1, 2]]);
    const n = applyMove(s, 'left');
    expect(n.board.every((v) => v > 0)).toBe(true);
    expect(n.status).toBe('lost');
  });
  it('rejects undo (and watering) after game over', () => {
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
