import './style.css';
import { applyMove, newGame } from './game/state';
import type { Direction, GameState } from './game/types';
import { bindInput } from './ui/input';
import { createView } from './ui/view';

const root = document.getElementById('app');
if (!root) throw new Error('#app missing');
const view = createView(root);

let state: GameState = newGame(Date.now() >>> 0);
let best = 0;

function update(next: GameState): void {
  state = next;
  best = Math.max(best, state.score);
  view.render(state, best);
}

function move(dir: Direction): void {
  update(applyMove(state, dir));
}

bindInput(view.boardEl, move);
update(state);
