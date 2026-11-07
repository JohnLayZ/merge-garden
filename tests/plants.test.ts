import { describe, it, expect } from 'vitest';
import { LEVELS, MAX_LEVEL } from '../src/levels';
import { PLANTS, PLANT_SCALE } from '../src/ui/plants';

describe('central level list', () => {
  it('has the 9 planned levels in order, the winning level is the last one', () => {
    expect(LEVELS.map((l) => l.name)).toEqual([
      'Seed', 'Sprout', 'Seedling', 'Bush', 'Flower', 'Young Tree', 'Tree', 'Old Tree', 'Ancient Tree',
    ]);
    expect(MAX_LEVEL).toBe(LEVELS.length);
    expect(PLANTS[MAX_LEVEL].name).toBe('Ancient Tree');
  });
  it('gives every level its own pastel colour', () => {
    const colors = LEVELS.map((l) => l.color);
    for (const c of colors) expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    expect(new Set(colors).size).toBe(LEVELS.length);
  });
});

describe('plant sizes', () => {
  it('has exactly one factor per level', () => expect(PLANT_SCALE).toHaveLength(LEVELS.length));
  it('grows strictly with every level', () => {
    for (let i = 1; i < PLANT_SCALE.length; i++) expect(PLANT_SCALE[i]).toBeGreaterThan(PLANT_SCALE[i - 1]);
  });
  it('stays within roughly 30%..95% of the cell', () => {
    expect(PLANT_SCALE[0]).toBeGreaterThanOrEqual(0.3);
    expect(PLANT_SCALE[PLANT_SCALE.length - 1]).toBeLessThanOrEqual(0.95);
  });
  it('PLANTS uses those factors', () => {
    for (let l = 1; l <= MAX_LEVEL; l++) expect(PLANTS[l].scale).toBe(PLANT_SCALE[l - 1]);
  });
});

describe('plant graphics', () => {
  it('has a self-contained SVG for each level, all different', () => {
    const svgs = new Set<string>();
    for (let l = 1; l <= MAX_LEVEL; l++) {
      const s = PLANTS[l].svg;
      expect(s).toMatch(/<svg[^>]*viewBox="0 0 100 100"/);
      expect(s).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
      expect(s).not.toMatch(/<image|href=|<script/);
      svgs.add(s);
    }
    expect(svgs.size).toBe(MAX_LEVEL);
  });
});
