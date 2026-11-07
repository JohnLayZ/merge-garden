import { MAX_LEVEL } from '../levels';

export const SIZE = 4;
/** Winning level = last entry of the central level list (src/levels.ts). */
export { MAX_LEVEL };

export type Direction = 'left' | 'right' | 'up' | 'down';
/** 16 cells, row-major. 0 = empty, 1..MAX_LEVEL = plant level. */
export type Board = number[];
export type Status = 'playing' | 'won' | 'lost';

export interface Snapshot {
  board: Board;
  score: number;
  status: Status;
  moves: number;
  rng: number;
}

export interface GameState extends Snapshot {
  seed: number;
  /** Accumulated active play time in ms (see timer.ts); frozen once the game has ended. */
  playMs: number;
  /** State before the last action (for 1-step undo), or null. */
  prev: Snapshot | null;
}
