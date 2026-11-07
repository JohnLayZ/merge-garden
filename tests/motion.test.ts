import { describe, it, expect } from 'vitest';
import { MOTION } from '../src/ui/motion';

describe('motion constants', () => {
  it('merge pop is calm but visible', () => {
    expect(MOTION.popScale).toBeGreaterThanOrEqual(1.12);
    expect(MOTION.popScale).toBeLessThanOrEqual(1.15);
    expect(MOTION.popMs).toBeGreaterThanOrEqual(180);
    expect(MOTION.popMs).toBeLessThanOrEqual(220);
  });
  it('spawn fade is short and grows slightly', () => {
    expect(MOTION.spawnMs).toBeGreaterThanOrEqual(150);
    expect(MOTION.spawnMs).toBeLessThanOrEqual(200);
    expect(MOTION.spawnFromScale).toBeLessThan(1);
    expect(MOTION.spawnFromScale).toBeGreaterThan(0.5);
  });
  it('overlay fades in within about 250 ms', () => {
    expect(MOTION.overlayFadeMs).toBe(250);
  });
});
