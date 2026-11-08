import seed from './assets/plants/01-seed.svg?raw';
import plantedSeed from './assets/plants/02-planted-seed.svg?raw';
import sprout from './assets/plants/03-sprout.svg?raw';
import seedling from './assets/plants/04-seedling.svg?raw';
import sapling from './assets/plants/05-sapling.svg?raw';
import youngTree from './assets/plants/06-young-tree.svg?raw';
import tree from './assets/plants/07-tree.svg?raw';
import blossomTree from './assets/plants/08-blossom-tree.svg?raw';
import greatTree from './assets/plants/09-great-tree.svg?raw';
import autumnTree from './assets/plants/10-autumn-tree.svg?raw';
import ancientTree from './assets/plants/11-ancient-tree.svg?raw';

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
  { name: 'Planted Seed', svg: plantedSeed, color: '#ead3bd', scale: 0.37 },
  { name: 'Sprout', svg: sprout, color: '#e3f3c9', scale: 0.39 },
  { name: 'Seedling', svg: seedling, color: '#cdeccb', scale: 0.51 },
  { name: 'Sapling', svg: sapling, color: '#c8e6e0', scale: 0.58 },
  { name: 'Young Tree', svg: youngTree, color: '#f6efc6', scale: 0.65 },
  { name: 'Tree', svg: tree, color: '#d8eab6', scale: 0.72 },
  { name: 'Blossom Tree', svg: blossomTree, color: '#f9d6e2', scale: 0.79 },
  { name: 'Great Tree', svg: greatTree, color: '#d6dff3', scale: 0.85 },
  { name: 'Autumn Tree', svg: autumnTree, color: '#fbe0b8', scale: 0.9 },
  { name: 'Ancient Tree', svg: ancientTree, color: '#f3dd8e', scale: 0.95 },
];

/** Number of levels = the winning level (the last one in the list). */
export const MAX_LEVEL = LEVELS.length;
