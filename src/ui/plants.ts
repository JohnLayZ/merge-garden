import { LEVELS, type LevelDef } from '../levels';

/** Plant sizes relative to the cell, derived from the central level list (strictly increasing). */
export const PLANT_SCALE: readonly number[] = LEVELS.map((l) => l.scale);

/** Look up a level (1-based) of the central list. */
export const PLANTS: Record<number, LevelDef> = Object.fromEntries(LEVELS.map((l, i) => [i + 1, l]));
