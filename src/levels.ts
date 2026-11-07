import seed from './assets/plants/level1-seed.svg?raw';
import sprout from './assets/plants/level2-sprout.svg?raw';
import seedling from './assets/plants/level3-seedling.svg?raw';
import bush from './assets/plants/level4-bush.svg?raw';
import flower from './assets/plants/level5-flower.svg?raw';
import youngTree from './assets/plants/level6-young-tree.svg?raw';
import tree from './assets/plants/level7-tree.svg?raw';
import oldTree from './assets/plants/level8-old-tree.svg?raw';
import ancientTree from './assets/plants/level9-ancient-tree.svg?raw';

export interface LevelDef {
  name: string;
  svg: string;
  /** Pastel background colour of the board cell holding this plant. */
  color: string;
  /**
   * Size of the drawing relative to its cell (fraction of the cell's content box).
   * Strictly increasing from level to level.
   */
  scale: number;
}

/**
 * THE single place that defines the plant levels (order = level 1, 2, 3, ...).
 * Number of levels, names, artwork, tile colours and sizes all come from this list; nothing else in
 * the code hard-codes a level count. The last entry is the winning level: to add a level,
 * append an entry here (plus a matching SVG) and adjust the scales.
 */
export const LEVELS: readonly LevelDef[] = [
  { name: 'Seed', svg: seed, color: '#f1e4d3', scale: 0.3 },
  { name: 'Sprout', svg: sprout, color: '#e3f3c9', scale: 0.38 },
  { name: 'Seedling', svg: seedling, color: '#cdeccb', scale: 0.46 },
  { name: 'Bush', svg: bush, color: '#c8e6e0', scale: 0.54 },
  { name: 'Flower', svg: flower, color: '#f9d6e2', scale: 0.62 },
  { name: 'Young Tree', svg: youngTree, color: '#f6efc6', scale: 0.7 },
  { name: 'Tree', svg: tree, color: '#d8eab6', scale: 0.8 },
  { name: 'Old Tree', svg: oldTree, color: '#d6dff3', scale: 0.88 },
  { name: 'Ancient Tree', svg: ancientTree, color: '#b9dfb0', scale: 0.95 },
];

/** Number of levels = the winning level (the last one in the list). */
export const MAX_LEVEL = LEVELS.length;
