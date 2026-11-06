import seed from '../assets/plants/level1-seed.svg?raw';
import sprout from '../assets/plants/level2-sprout.svg?raw';
import seedling from '../assets/plants/level3-seedling.svg?raw';
import bush from '../assets/plants/level4-bush.svg?raw';
import flower from '../assets/plants/level5-flower.svg?raw';
import tree from '../assets/plants/level6-tree.svg?raw';
import ancient from '../assets/plants/level7-ancient-tree.svg?raw';

/**
 * Size of each plant relative to its cell (width of the drawing as a fraction of the
 * cell's content box). Strictly increasing: seed is small, the Ancient Tree nearly fills the cell.
 */
export const PLANT_SCALE: readonly number[] = [0.3, 0.4, 0.52, 0.64, 0.76, 0.86, 0.95];

export const PLANTS: Record<number, { name: string; svg: string; scale: number }> = {
  1: { name: 'Seed', svg: seed, scale: PLANT_SCALE[0] },
  2: { name: 'Sprout', svg: sprout, scale: PLANT_SCALE[1] },
  3: { name: 'Seedling', svg: seedling, scale: PLANT_SCALE[2] },
  4: { name: 'Bush', svg: bush, scale: PLANT_SCALE[3] },
  5: { name: 'Flower', svg: flower, scale: PLANT_SCALE[4] },
  6: { name: 'Tree', svg: tree, scale: PLANT_SCALE[5] },
  7: { name: 'Ancient Tree', svg: ancient, scale: PLANT_SCALE[6] },
};
