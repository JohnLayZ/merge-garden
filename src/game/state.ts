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
    moves: state.moves + 1,
    rng: spawned.rng,
    prev: snapshot(state),
  };
  // a freshly created level-7 plant counts as a win even if a spawn follows
  next.status = computeStatus({ ...next, status: res.board.includes(MAX_LEVEL) ? 'won' : state.status });
  return next;
}
