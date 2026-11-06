import { nextRandom } from './rng';
import type { Board } from './types';

/** Probability that two seeds appear instead of one. */
export const DOUBLE_SPAWN_CHANCE = 0.1;

export function spawnSeeds(board: Board, rng: number): { board: Board; rng: number } {
  const out = board.slice();
  let state = rng;
  const draw = () => {
    const r = nextRandom(state);
    state = r.state;
    return r.value;
  };
  const count = draw() < DOUBLE_SPAWN_CHANCE ? 2 : 1;
  for (let n = 0; n < count; n++) {
    const empty: number[] = [];
    out.forEach((v, i) => v === 0 && empty.push(i));
    if (empty.length === 0) break;
    out[empty[Math.floor(draw() * empty.length)]] = 1;
  }
  return { board: out, rng: state };
}
