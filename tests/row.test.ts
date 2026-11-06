import { describe, it, expect } from 'vitest';
import { slideRow } from '../src/game/row';

describe('slideRow', () => {
  it('merges a pair', () => expect(slideRow([1, 1, 0, 0]).row).toEqual([2, 0, 0, 0]));
  it('merges [1,1,1,1] into [2,2,0,0]', () => expect(slideRow([1, 1, 1, 1]).row).toEqual([2, 2, 0, 0]));
  it('does not re-merge a fresh plant', () => expect(slideRow([2, 1, 1, 0]).row).toEqual([2, 2, 0, 0]));
  it('slides across gaps', () => expect(slideRow([0, 3, 0, 3]).row).toEqual([4, 0, 0, 0]));
  it('merges from the wall side first', () => expect(slideRow([1, 1, 1, 0]).row).toEqual([2, 1, 0, 0]));
  it('does not merge different levels', () => {
    const r = slideRow([1, 2, 1, 2]);
    expect(r.row).toEqual([1, 2, 1, 2]);
    expect(r.moved).toBe(false);
  });
  it('reports score 2^n and merge count', () => {
    const r = slideRow([2, 2, 3, 3]);
    expect(r.row).toEqual([3, 4, 0, 0]);
    expect(r.score).toBe(8 + 16);
    expect(r.merges).toBe(2);
  });
  it('never merges level 7', () => expect(slideRow([7, 7, 0, 0]).row).toEqual([7, 7, 0, 0]));
  it('reports moved', () => {
    expect(slideRow([0, 1, 0, 0]).moved).toBe(true);
    expect(slideRow([1, 0, 0, 0]).moved).toBe(false);
  });
  it('traces movement', () => {
    expect(slideRow([0, 1, 1, 0]).trace).toEqual([
      { from: 1, to: 0, merged: false },
      { from: 2, to: 0, merged: true },
    ]);
  });
});
