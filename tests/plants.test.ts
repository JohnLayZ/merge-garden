import { describe, it, expect } from 'vitest';
import { PLANTS, PLANT_SCALE } from '../src/ui/plants';

describe('plant sizes', () => {
  it('has one factor per level (7)', () => expect(PLANT_SCALE).toHaveLength(7));
  it('grows strictly with every level', () => {
    for (let i = 1; i < PLANT_SCALE.length; i++) expect(PLANT_SCALE[i]).toBeGreaterThan(PLANT_SCALE[i - 1]);
  });
  it('stays within roughly 30%..95% of the cell', () => {
    expect(PLANT_SCALE[0]).toBeGreaterThanOrEqual(0.3);
    expect(PLANT_SCALE[6]).toBeLessThanOrEqual(0.95);
  });
  it('PLANTS uses those factors', () => {
    for (let l = 1; l <= 7; l++) expect(PLANTS[l].scale).toBe(PLANT_SCALE[l - 1]);
  });
});

describe('plant graphics', () => {
  it('has a self-contained SVG for each of the 7 levels, all different', () => {
    const svgs = new Set<string>();
    for (let l = 1; l <= 7; l++) {
      const s = PLANTS[l].svg;
      expect(s).toMatch(/<svg[^>]*viewBox="0 0 100 100"/);
      expect(s).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
      expect(s).not.toMatch(/<image|href=|<script/);
      svgs.add(s);
    }
    expect(svgs.size).toBe(7);
  });
});
