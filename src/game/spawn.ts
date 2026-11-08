import { nextRandom } from './rng';
import type { Board } from './types';

/** Level of a freshly spawned Seed: the first entry of the level list (src/levels.ts). */
export const SPAWN_SEED_LEVEL = 1;
/** Level of a rarely spawned Planted Seed: the second entry of the level list (src/levels.ts). */
export const SPAWN_PLANTED_SEED_LEVEL = 2;
/** Probability that the new plant is a Planted Seed instead of a Seed (as in 2048, where 10 % of the new tiles are a 4). */
export const SPAWN_PLANTED_SEED_CHANCE = 0.1;

/**
 * Puts exactly ONE new plant on a random empty cell (nothing if the board is full):
 * a Seed with 90 %, a Planted Seed with 10 %. All randomness comes from the passed, seedable rng state.
 */
export function spawnPlant(board: Board, rng: number): { board: Board; rng: number } {
  const out = board.slice();
  let state = rng;
  const draw = () => {
    const r = nextRandom(state);
    state = r.state;
    return r.value;
  };
  const empty: number[] = [];
  out.forEach((v, i) => v === 0 && empty.push(i));
  if (empty.length === 0) return { board: out, rng: state };
  const cell = empty[Math.floor(draw() * empty.length)];
  out[cell] = draw() < SPAWN_PLANTED_SEED_CHANCE ? SPAWN_PLANTED_SEED_LEVEL : SPAWN_SEED_LEVEL;
  return { board: out, rng: state };
}
