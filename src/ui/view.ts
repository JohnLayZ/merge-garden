import type { TileMove } from '../game/board';
import type { GameState } from '../game/types';
import { SIZE } from '../game/types';
import soundOnSvg from '../assets/sound-on.svg?raw';
import soundOffSvg from '../assets/sound-off.svg?raw';
import { formatTime } from '../game/timer';
import { LEVELS } from '../levels';
import { PLANTS, PLANT_SCALE } from './plants';
import { MOTION, applyMotion } from './motion';

interface Tile {
  el: HTMLElement;
  level: number;
}

export interface View {
  render(state: GameState, best: number, moves?: TileMove[]): void;
  /** Show the play time (header and overlay), in ms. */
  setTime(ms: number): void;
  setMuted(muted: boolean): void;
  /** Show or hide the "How to play" overlay. */
  setHelpOpen(open: boolean): void;
  boardEl: HTMLElement;
  buttons: { newGame: HTMLButtonElement; undo: HTMLButtonElement; mute: HTMLButtonElement; help: HTMLButtonElement };
  help: { el: HTMLElement; closeButton: HTMLButtonElement };
  overlay: { el: HTMLElement; button: HTMLButtonElement };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function place(node: HTMLElement, index: number): void {
  node.style.setProperty('--r', String(Math.floor(index / SIZE)));
  node.style.setProperty('--c', String(index % SIZE));
}

export function createView(root: HTMLElement): View {
  root.innerHTML = '';
  applyMotion(document.documentElement);
  const title = el('h1', 'title', 'Merge Garden');
  const scoreVal = el('span', 'box-value', '0');
  const bestVal = el('span', 'box-value', '0');
  const scoreBox = el('div', 'box');
  scoreBox.append(el('span', 'box-label', 'Score'), scoreVal);
  const bestBox = el('div', 'box');
  bestBox.append(el('span', 'box-label', 'Best'), bestVal);
  const header = el('header', 'header');
  const timeVal = el('span', 'box-value', '0:00');
  timeVal.setAttribute('data-testid', 'time');
  const timeBox = el('div', 'box');
  timeBox.append(el('span', 'box-label', 'Time'), timeVal);
  const muteBtn = el('button', 'btn icon-btn');
  muteBtn.type = 'button';
  const helpBtn = el('button', 'btn icon-btn help-btn', '?');
  helpBtn.type = 'button';
  helpBtn.setAttribute('aria-label', 'How to play');
  helpBtn.title = 'How to play';
  header.append(title, scoreBox, bestBox, timeBox, helpBtn, muteBtn);

  const boardEl = el('div', 'board');
  boardEl.setAttribute('role', 'grid');
  boardEl.setAttribute('aria-label', 'Garden');
  const bg = el('div', 'layer');
  for (let i = 0; i < SIZE * SIZE; i++) {
    const c = el('div', 'cell');
    place(c, i);
    bg.append(c);
  }
  const tilesLayer = el('div', 'layer tiles');
  boardEl.append(bg, tilesLayer);

  const overlayEl = el('div', 'overlay hidden');
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-live', 'polite');
  const overlayText = el('p', 'overlay-text');
  const overlayBtn = el('button', 'btn primary', 'New Game');
  const overlayScore = el('p', 'overlay-stats');
  const overlayTime = el('p', 'overlay-stats overlay-time', 'Time: 0:00');
  overlayEl.append(overlayText, overlayScore, overlayTime, overlayBtn);
  const boardWrap = el('div', 'board-wrap');
  boardWrap.append(boardEl, overlayEl);

  const undoBtn = el('button', 'btn', 'Undo');
  const newBtn = el('button', 'btn', 'New Game');
  const controls = el('div', 'controls');
  controls.append(undoBtn, newBtn);
  const hint = el('p', 'hint', 'Swipe or use arrow keys / WASD. Merge equal plants!');
  root.append(header, boardWrap, controls, hint);

  // "How to play": fixed full-screen layer above everything; the level row is read from LEVELS.
  const helpEl = el('div', 'help');
  helpEl.hidden = true;
  const helpDialog = el('div', 'help-dialog');
  helpDialog.setAttribute('role', 'dialog');
  helpDialog.setAttribute('aria-modal', 'true');
  helpDialog.setAttribute('aria-labelledby', 'help-title');
  const helpTitle = el('h2', 'help-title', 'How to play');
  helpTitle.id = 'help-title';
  const helpClose = el('button', 'btn help-close', '×');
  helpClose.type = 'button';
  helpClose.setAttribute('aria-label', 'Close');
  const helpTop = el('div', 'help-top');
  helpTop.append(helpTitle, helpClose);
  const helpLevels = el('ul', 'help-levels');
  helpLevels.setAttribute('aria-label', 'Plant stages');
  LEVELS.forEach((lvl, i) => {
    const item = el('li', 'help-level');
    item.setAttribute('data-testid', 'help-level');
    const plant = el('span', 'help-plant');
    plant.style.setProperty('--tile-bg', lvl.color);
    plant.innerHTML = `<span class="plant" style="--s:${PLANT_SCALE[i]}">${lvl.svg}</span>`;
    item.append(plant, el('span', 'help-level-name', lvl.name));
    helpLevels.append(item);
  });
  const winName = LEVELS[LEVELS.length - 1].name;
  const helpList = el('ul', 'help-list');
  for (const line of [
    'Swipe, or use the arrow keys / WASD, to slide all plants.',
    'Two equal plants merge into the next stage.',
    'After every valid move, new seeds appear.',
    `Goal: grow an ${winName} to win.`,
    'Game over when nothing can move or merge. Undo takes back exactly one move, but not after a win or game over.',
  ]) helpList.append(el('li', '', line));
  helpDialog.append(helpTop, helpLevels, helpList);
  helpEl.append(helpDialog);
  root.append(helpEl);

  const tiles: (Tile | null)[] = new Array(SIZE * SIZE).fill(null);

  function paint(tile: Tile, level: number): void {
    tile.level = level;
    tile.el.dataset.level = String(level);
    tile.el.style.setProperty('--tile-bg', PLANTS[level].color);
    tile.el.innerHTML = `<span class="plant" style="--s:${PLANTS[level].scale}">${PLANTS[level].svg}</span>`;
    tile.el.setAttribute('aria-label', PLANTS[level].name);
  }

  function pop(tile: Tile): void {
    tile.el.classList.remove('pop');
    void tile.el.offsetWidth; // restart animation
    tile.el.classList.add('pop');
  }

  /** Move existing tile elements so they glide to their new cells; merged tiles vanish after sliding. */
  function applyMoves(moves: TileMove[]): void {
    const before = tiles.slice();
    const next: (Tile | null)[] = new Array(SIZE * SIZE).fill(null);
    for (const m of moves) {
      const tile = before[m.from];
      if (!tile) continue;
      place(tile.el, m.to);
      if (m.merged) {
        const survivor = next[m.to];
        const gone = tile;
        gone.el.style.zIndex = '0';
        setTimeout(() => gone.el.remove(), MOTION.slideMs);
        if (survivor) {
          paint(survivor, survivor.level + 1);
          pop(survivor);
        }
      } else {
        next[m.to] = tile;
      }
    }
    for (let i = 0; i < tiles.length; i++) tiles[i] = next[i];
  }

  function render(state: GameState, best: number, moves?: TileMove[]): void {
    if (moves) applyMoves(moves);
    scoreVal.textContent = String(state.score);
    bestVal.textContent = String(best);
    undoBtn.disabled = state.prev === null || state.status !== 'playing';
    state.board.forEach((level, i) => {
      const t = tiles[i];
      if (level === 0) {
        t?.el.remove();
        tiles[i] = null;
      } else if (!t) {
        const node = el('div', 'tile');
        place(node, i);
        tilesLayer.append(node);
        const tile = { el: node, level };
        paint(tile, level);
        if (moves) node.classList.add('spawn');
        tiles[i] = tile;
      } else if (t.level !== level) {
        paint(t, level);
        pop(t);
      }
    });
    overlayEl.classList.toggle('hidden', state.status === 'playing');
    overlayText.textContent = state.status === 'lost' ? 'Game over' : 'You win!';
    overlayScore.textContent = `Score: ${state.score} · Best: ${best}`;
    overlayEl.dataset.status = state.status;
  }

  function setTime(ms: number): void {
    const text = formatTime(ms);
    if (timeVal.textContent !== text) timeVal.textContent = text;
    overlayTime.textContent = `Time: ${text}`;
  }

  function setMuted(muted: boolean): void {
    muteBtn.innerHTML = muted ? soundOffSvg : soundOnSvg;
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    muteBtn.title = muted ? 'Unmute' : 'Mute';
  }

  function setHelpOpen(open: boolean): void {
    helpEl.hidden = !open;
    if (open) helpClose.focus();
  }
  return {
    render,
    setHelpOpen,
    setTime,
    setMuted,
    boardEl,
    buttons: { newGame: newBtn, undo: undoBtn, mute: muteBtn, help: helpBtn },
    help: { el: helpEl, closeButton: helpClose },
    overlay: { el: overlayEl, button: overlayBtn },
  };
}
