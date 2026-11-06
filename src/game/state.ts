import { moveBoard } from './board';
import { spawnSeeds } from './spawn';
import { MAX_CANS, MAX_LEVEL, MERGES_PER_CAN, SIZE, type Board, type Direction, type GameState, type Snapshot, type Status } from './types';

export function newGame(seed: number): GameState {
  const empty: Board = new Array(SIZE * SIZE).fill(0);
  const first = spawnSeeds(empty, seed >>> 0);
  const second = spawnSeeds(first.board, first.rng);
  return {
    board: second.board,
    score: 0,
    cans: 0,
    mergeCount: 0,
    status: 'playing',
    moves: 0,
    rng: second.rng,
    seed,
    prev: null,
  };
}

/** True if no move can change the board (full or blocked, no equal neighbours). */
export function isBlocked(board: Board): boolean {
  return (['left', 'right', 'up', 'down'] as Direction[]).every((d) => !moveBoard(board, d).moved);
}

export function computeStatus(s: Pick<Snapshot, 'board' | 'cans' | 'status'>): Status {
  if (s.status === 'won') return 'won';
  if (s.board.includes(MAX_LEVEL)) return 'won';
  const canWater = s.cans > 0 && s.board.some((v) => v > 0 && v < MAX_LEVEL);
  return isBlocked(s.board) && !canWater ? 'lost' : 'playing';
}

function snapshot(s: GameState): Snapshot {
  const { board, score, cans, mergeCount, status, moves, rng } = s;
  return { board: board.slice(), score, cans, mergeCount, status, moves, rng };
}

/** One can per MERGES_PER_CAN merges, capped at MAX_CANS (extra cans are lost). */
export function earnCans(cans: number, before: number, after: number): number {
  const gained = Math.floor(after / MERGES_PER_CAN) - Math.floor(before / MERGES_PER_CAN);
  return Math.min(MAX_CANS, cans + gained);
}

/** Apply a move. Invalid moves (nothing changes) return the very same state object. */
export function applyMove(state: GameState, dir: Direction): GameState {
  if (state.status === 'lost') return state;
  const res = moveBoard(state.board, dir);
  if (!res.moved) return state;
  const spawned = spawnSeeds(res.board, state.rng);
  const next: GameState = {
    ...state,
    board: spawned.board,
    score: state.score + res.score,
    mergeCount: state.mergeCount + res.merges,
    cans: earnCans(state.cans, state.mergeCount, state.mergeCount + res.merges),
    moves: state.moves + 1,
    rng: spawned.rng,
    prev: snapshot(state),
  };
  // a freshly created level-7 plant counts as a win even if a spawn follows
  next.status = computeStatus({ ...next, status: res.board.includes(MAX_LEVEL) ? 'won' : state.status });
  return next;
}

/** Upgrade the plant at `index` by one level using a can. Costs no move. No-op (same state) if impossible. */
export function useWateringCan(state: GameState, index: number): GameState {
  if (state.status === 'lost' || state.cans <= 0) return state;
  const level = state.board[index];
  if (!level || level >= MAX_LEVEL) return state;
  const board = state.board.slice();
  board[index] = level + 1;
  const next: GameState = { ...state, board, cans: state.cans - 1, prev: snapshot(state) };
  next.status = computeStatus(next);
  return next;
}

/** Revert the last move or watering. Only one step is kept; no-op (same state) if nothing to undo. */
export function undo(state: GameState): GameState {
  if (!state.prev) return state;
  return { ...state, ...state.prev, board: state.prev.board.slice(), prev: null };
}
