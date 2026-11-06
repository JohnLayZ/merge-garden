import { describe, it, expect } from 'vitest';
import { keyToDirection, swipeDirection } from '../src/ui/input';

describe('keyToDirection', () => {
  it('maps arrows and WASD', () => {
    expect(keyToDirection('ArrowLeft')).toBe('left');
    expect(keyToDirection('ArrowUp')).toBe('up');
    expect(keyToDirection('a')).toBe('left');
    expect(keyToDirection('d')).toBe('right');
    expect(keyToDirection('w')).toBe('up');
    expect(keyToDirection('s')).toBe('down');
    expect(keyToDirection('W')).toBe('up');
  });
  it('ignores other keys', () => expect(keyToDirection('x')).toBeNull());
});

describe('swipeDirection', () => {
  it('detects dominant axis', () => {
    expect(swipeDirection(50, 10)).toBe('right');
    expect(swipeDirection(-50, 10)).toBe('left');
    expect(swipeDirection(5, 60)).toBe('down');
    expect(swipeDirection(5, -60)).toBe('up');
  });
  it('ignores tiny movements (taps)', () => expect(swipeDirection(3, 4)).toBeNull());
});
