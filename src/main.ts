import './style.css';
import { moveBoard } from './game/board';
import { applyMove, newGame } from './game/state';
import type { TileMove } from './game/board';
import type { Direction, GameState } from './game/types';
import { bindInput } from './ui/input';
import { createView } from './ui/view';

const root = document.getElementById('app');
if (!root) throw new Error('#app missing');
const view = createView(root);

let state: GameState = newGame(Date.now() >>> 0);
let best = 0;

function update(next: GameState, moves?: TileMove[]): void {
  state = next;
  best = Math.max(best, state.score);
  view.render(state, best, moves);
}

function move(dir: Direction): void {
  const next = applyMove(state, dir);
  if (next === state) return;
  update(next, moveBoard(state.board, dir).tiles);
}

bindInput(view.boardEl, move);
update(state);
