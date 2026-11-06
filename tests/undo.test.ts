import { describe, it, expect } from 'vitest';
import { applyMove, newGame, undo, useWateringCan } from '../src/game/state';
import type { GameState } from '../src/game/types';

describe('undo', () => {
  it('does nothing on a fresh game', () => {
    const g = newGame(5);
    expect(undo(g)).toBe(g);
  });
  it('restores board, score, moves and rng after a move', () => {
    const g = newGame(5);
    const m = applyMove(g, 'left') !== g ? applyMove(g, 'left') : applyMove(g, 'down');
    const u = undo(m);
    expect(u).toEqual({ ...g, prev: null });
  });
  it('only goes back one step', () => {
    let g = newGame(8);
    const dirs = ['left', 'down', 'right', 'up'] as const;
    for (const d of dirs) g = applyMove(g, d);
    const once = undo(g);
    expect(undo(once)).toBe(once);
  });
  it('replays identically after undo (rng restored)', () => {
    const g = newGame(3);
    const a = applyMove(g, 'down');
    const b = applyMove(undo(a), 'down');
    expect(b.board).toEqual(a.board);
  });
  it('undoes a watering can use', () => {
    const base: GameState = { ...newGame(1), board: [3, ...new Array(15).fill(0)], cans: 1 };
    const w = useWateringCan(base, 0);
    const u = undo(w);
    expect(u.board[0]).toBe(3);
    expect(u.cans).toBe(1);
  });
});
