export const SIZE = 4;
export const MAX_LEVEL = 7;
export const MERGES_PER_CAN = 10;
export const MAX_CANS = 3;

export type Direction = 'left' | 'right' | 'up' | 'down';
/** 16 cells, row-major. 0 = empty, 1..7 = plant level. */
export type Board = number[];
export type Status = 'playing' | 'won' | 'lost';

export interface Snapshot {
  board: Board;
  score: number;
  cans: number;
  mergeCount: number;
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
