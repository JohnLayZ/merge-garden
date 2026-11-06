import { describe, it, expect } from 'vitest';
import { applyMove, earnCans, newGame, undo, useWateringCan } from '../src/game/state';
import type { GameState } from '../src/game/types';

const withBoard = (rows: number[][], extra: Partial<GameState> = {}): GameState => ({
  ...newGame(1), board: rows.flat(), ...extra,
});
const Z = [0, 0, 0, 0];

describe('earning cans', () => {
  it('gives a can at every 10th merge', () => {
    expect(earnCans(0, 9, 10)).toBe(1);
    expect(earnCans(0, 8, 9)).toBe(0);
    expect(earnCans(1, 19, 21)).toBe(2);
  });
  it('caps at 3', () => expect(earnCans(3, 9, 10)).toBe(3));
  it('is awarded through applyMove', () => {
    const s = withBoard([[1, 1, 0, 0], Z, Z, Z], { mergeCount: 9 });
    const n = applyMove(s, 'left');
    expect(n.mergeCount).toBe(10);
    expect(n.cans).toBe(1);
  });
});

describe('useWateringCan', () => {
  it('upgrades level 3 to 4 without spending a move', () => {
    const s = withBoard([[3, 0, 0, 0], Z, Z, Z], { cans: 2 });
    const n = useWateringCan(s, 0);
    expect(n.board[0]).toBe(4);
    expect(n.cans).toBe(1);
    expect(n.moves).toBe(s.moves);
    expect(n.score).toBe(s.score);
  });
  it('is a no-op on level 7 and does not consume a can', () => {
    const s = withBoard([[7, 0, 0, 0], Z, Z, Z], { cans: 1 });
    expect(useWateringCan(s, 0)).toBe(s);
  });
  it('is a no-op on empty cells or without cans', () => {
    const s = withBoard([[3, 0, 0, 0], Z, Z, Z], { cans: 1 });
    expect(useWateringCan(s, 5)).toBe(s);
    const t = withBoard([[3, 0, 0, 0], Z, Z, Z], { cans: 0 });
    expect(useWateringCan(t, 0)).toBe(t);
  });
  it('can create the ancient tree and win', () => {
    const s = withBoard([[6, 0, 0, 0], Z, Z, Z], { cans: 1 });
    const n = useWateringCan(s, 0);
    expect(n.status).toBe('won');
    expect(n.board[0]).toBe(7);
    // game is over: no further watering, moves or undo
    const m = withBoard([[6, 3, 0, 0], Z, Z, Z], { cans: 2 });
    const won = useWateringCan(m, 0);
    expect(useWateringCan(won, 1)).toBe(won);
    expect(applyMove(won, 'down')).toBe(won);
    expect(undo(won)).toBe(won);
  });
  it('can rescue a blocked board by creating a merge', () => {
    const rows = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
    const s = withBoard(rows, { cans: 1 });
    const n = useWateringCan(s, 0); // 1 -> 2 now neighbours 2 at idx1
    expect(n.cans).toBe(0);
    expect(n.status).toBe('playing');
  });
});
