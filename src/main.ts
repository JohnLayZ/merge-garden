import './style.css';
import { moveBoard } from './game/board';
import { applyMove, newGame, undo, useWateringCan } from './game/state';
import type { TileMove } from './game/board';
import type { Direction, GameState } from './game/types';
import { loadGame, saveGame } from './storage';
import { bindInput } from './ui/input';
import { createView } from './ui/view';

const root = document.getElementById('app');
if (!root) throw new Error('#app missing');
const view = createView(root);

const saved = loadGame(localStorage);
let state: GameState = saved?.state ?? newGame(Date.now() >>> 0);
let best = saved?.best ?? 0;

function update(next: GameState, moves?: TileMove[]): void {
  state = next;
  best = Math.max(best, state.score);
  view.render(state, best, moves);
  saveGame(localStorage, state, best);
}

function move(dir: Direction): void {
  const next = applyMove(state, dir);
  if (next === state) return;
  update(next, moveBoard(state.board, dir).tiles);
}

let watering = false;
function setWatering(on: boolean): void {
  watering = on && state.cans > 0 && state.status !== 'lost';
  view.setWateringMode(watering);
}

view.buttons.can.addEventListener('click', () => setWatering(!watering));
view.onCellClick((i) => {
  if (!watering) return;
  const next = useWateringCan(state, i);
  if (next === state) return; // empty cell or level 7: nothing happens, can is kept
  update(next);
  setWatering(false);
});
view.buttons.undo.addEventListener('click', () => {
  update(undo(state));
  setWatering(false);
});
const restart = () => {
  update(newGame(Date.now() >>> 0));
  setWatering(false);
};
view.buttons.newGame.addEventListener('click', restart);
view.overlay.button.addEventListener('click', restart);

bindInput(view.boardEl, (d) => {
  setWatering(false);
  move(d);
});
update(state);
