import { describe, it, expect } from 'vitest';
import { moveBoard } from '../src/game/board';

const b = (rows: number[][]) => rows.flat();

describe('moveBoard', () => {
  const start = b([
    [1, 1, 0, 0],
    [0, 0, 2, 0],
    [0, 3, 0, 3],
    [0, 0, 0, 0],
  ]);
  it('left', () =>
    expect(moveBoard(start, 'left').board).toEqual(b([[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]])));
  it('right', () =>
    expect(moveBoard(start, 'right').board).toEqual(b([[0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 4], [0, 0, 0, 0]])));
  it('up', () =>
    expect(moveBoard(start, 'up').board).toEqual(b([[1, 1, 2, 3], [0, 3, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])));
  it('down', () =>
    expect(moveBoard(start, 'down').board).toEqual(b([[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 0, 0], [1, 3, 2, 3]])));
  it('merges vertically', () => {
    const r = moveBoard(b([[1, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), 'down');
    expect(r.board[12]).toBe(2);
    expect(r.merges).toBe(1);
    expect(r.score).toBe(4);
  });
  it('detects invalid moves and leaves the board equal', () => {
    const full = b([[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]]);
    const r = moveBoard(full, 'left');
    expect(r.moved).toBe(false);
    expect(r.board).toEqual(full);
    const packed = b([[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    expect(moveBoard(packed, 'left').moved).toBe(false);
    expect(moveBoard(packed, 'up').moved).toBe(false);
  });
  it('does not mutate input', () => {
    const copy = start.slice();
    moveBoard(start, 'left');
    expect(start).toEqual(copy);
  });
});
