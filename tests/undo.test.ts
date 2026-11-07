import { describe, it, expect } from 'vitest';
import { applyMove, newGame, undo } from '../src/game/state';
import { MAX_LEVEL } from '../src/game/types';

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
  it('is locked after a win and after game over', () => {
    const won = applyMove({ ...newGame(1), board: [MAX_LEVEL - 1, MAX_LEVEL - 1, ...new Array(14).fill(0)] }, 'left');
    expect(won.status).toBe('won');
    expect(undo(won)).toBe(won);
    const lost = applyMove({ ...newGame(1), board: [1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 0, 2, 1, 2] }, 'left');
    expect(lost.status).toBe('lost');
    expect(undo(lost)).toBe(lost);
  });
});
