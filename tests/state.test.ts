import { describe, it, expect } from 'vitest';
import { applyMove, computeStatus, isBlocked, newGame, undo } from '../src/game/state';
import { MAX_LEVEL, type Direction, type GameState } from '../src/game/types';

const PRE = MAX_LEVEL - 1; // the level just below the winning one

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
