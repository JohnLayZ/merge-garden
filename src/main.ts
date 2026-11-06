import './style.css';
import { moveBoard } from './game/board';
import { applyMove, newGame, undo, useWateringCan } from './game/state';
import type { TileMove } from './game/board';
import type { Direction, GameState } from './game/types';
import { loadGame, saveGame } from './storage';
import { elapsedAt, idleTimer, pauseTimer, resumeTimer, shouldRun, type TimerState } from './game/timer';
import { createSound } from './audio/sound';
import { bindInput } from './ui/input';
import { createView } from './ui/view';

const root = document.getElementById('app');
if (!root) throw new Error('#app missing');
const view = createView(root);

const sound = createSound({ kv: localStorage });
view.setMuted(sound.muted);
view.buttons.mute.addEventListener('click', () => {
  sound.setMuted(!sound.muted);
  view.setMuted(sound.muted);
});
// Browsers only allow audio after a user action: create the audio context on the first one.
for (const type of ['pointerdown', 'keydown', 'touchstart'] as const) {
  document.addEventListener(type, () => sound.unlock(), { capture: true, passive: true });
}

/** Sound for the outcome of an action: end of game wins over merge/water. */
function playOutcome(next: GameState, kind: 'move' | 'water', mergedLevel = 0): void {
  if (next.status === 'won') sound.play('win');
  else if (next.status === 'lost') sound.play('lose');
  else if (kind === 'water') sound.play('water');
  else if (mergedLevel > 0) sound.play('merge', mergedLevel);
}

const saved = loadGame(localStorage);
let state: GameState = saved?.state ?? newGame(Date.now() >>> 0);
let best = saved?.best ?? 0;

// Play time: only active time is summed up and saved with the game (never a difference between page loads).
const now = () => performance.now();
let timer: TimerState = idleTimer(state.playMs);
const visible = () => document.visibilityState !== 'hidden';

/** Start/stop the timer to match the game state and visibility; stores the sum in the state. */
function syncTimer(): void {
  const t = now();
  timer = shouldRun(state, visible()) ? resumeTimer(timer, t) : pauseTimer(timer, t);
  state = { ...state, playMs: Math.floor(elapsedAt(timer, t)) };
  view.setTime(state.playMs);
}

function update(next: GameState, moves?: TileMove[], resetTimer = false): void {
  state = next;
  if (resetTimer) timer = idleTimer(0);
  best = Math.max(best, state.score);
  syncTimer();
  view.render(state, best, moves);
  saveGame(localStorage, state, best);
}

setInterval(() => {
  if (timer.runningSince === null) return;
  const t = now();
  state = { ...state, playMs: Math.floor(elapsedAt(timer, t)) };
  view.setTime(state.playMs);
  if (Math.floor(state.playMs / 1000) % 5 === 0) saveGame(localStorage, state, best);
}, 250);
document.addEventListener('visibilitychange', () => {
  syncTimer();
  saveGame(localStorage, state, best);
});
window.addEventListener('pagehide', () => {
  syncTimer();
  saveGame(localStorage, state, best);
});

function move(dir: Direction): void {
  const next = applyMove(state, dir);
  if (next === state) return;
  const tiles = moveBoard(state.board, dir).tiles;
  const mergedLevel = Math.max(0, ...tiles.filter((t) => t.merged).map((t) => state.board[t.from] + 1));
  playOutcome(next, 'move', mergedLevel);
  update(next, tiles);
}

let watering = false;
function setWatering(on: boolean): void {
  watering = on && state.cans > 0 && state.status === 'playing';
  view.setWateringMode(watering);
}

view.buttons.can.addEventListener('click', () => setWatering(!watering));
view.onCellClick((i) => {
  if (!watering) return;
  const next = useWateringCan(state, i);
  if (next === state) return; // empty cell or level 7: nothing happens, can is kept
  playOutcome(next, 'water');
  update(next);
  setWatering(false);
});
view.buttons.undo.addEventListener('click', () => {
  update(undo(state));
  setWatering(false);
});
const restart = () => {
  update(newGame(Date.now() >>> 0), undefined, true);
  setWatering(false);
};
view.buttons.newGame.addEventListener('click', restart);
view.overlay.button.addEventListener('click', restart);

bindInput(view.boardEl, (d) => {
  setWatering(false);
  move(d);
});
update(state);
