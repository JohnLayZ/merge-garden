import { moveBoard } from './board';
import { spawnSeeds } from './spawn';
import { MAX_LEVEL, SIZE, type Board, type Direction, type GameState, type Snapshot, type Status } from './types';

export function newGame(seed: number): GameState {
  const empty: Board = new Array(SIZE * SIZE).fill(0);
  const first = spawnSeeds(empty, seed >>> 0);
  const second = spawnSeeds(first.board, first.rng);
  return {
    board: second.board,
    score: 0,
    status: 'playing',
    moves: 0,
    rng: second.rng,
    seed,
    playMs: 0,
    prev: null,
  };
}

/** True if no move can change the board (full or blocked, no equal neighbours). */
export function isBlocked(board: Board): boolean {
  return (['left', 'right', 'up', 'down'] as Direction[]).every((d) => !moveBoard(board, d).moved);
}

export function computeStatus(s: Pick<Snapshot, 'board' | 'status'>): Status {
  // The first plant of the top level ends the game: 'won' is final (no moves or undo afterwards); 'lost' also blocks undo.
  if (s.status === 'won' || s.board.includes(MAX_LEVEL)) return 'won';
  return isBlocked(s.board) ? 'lost' : 'playing';
}

function snapshot(s: GameState): Snapshot {
  const { board, score, status, moves, rng } = s;
  return { board: board.slice(), score, status, moves, rng };
}

/** Apply a move. Invalid moves (nothing changes) return the very same state object. */
export function applyMove(state: GameState, dir: Direction): GameState {
  if (state.status !== 'playing') return state;
  const res = moveBoard(state.board, dir);
  if (!res.moved) return state;
  const spawned = spawnSeeds(res.board, state.rng);
  const next: GameState = {
    ...state,
    board: spawned.board,
    score: state.score + res.score,
    moves: state.moves + 1,
    rng: spawned.rng,
    prev: snapshot(state),
  };
  // a freshly created top-level plant counts as a win even if a spawn follows
  next.status = computeStatus({ ...next, status: res.board.includes(MAX_LEVEL) ? 'won' : state.status });
  return next;
}

/** Revert the last move (not after the game has ended: win or game over). Only one step is kept; no-op (same state) if nothing to undo. */
export function undo(state: GameState): GameState {
  if (!state.prev || state.status !== 'playing') return state;
  return { ...state, ...state.prev, board: state.prev.board.slice(), prev: null };
}
