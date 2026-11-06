import type { GameState } from '../game/types';
import { SIZE, MAX_CANS } from '../game/types';
import { PLANTS } from './plants';

interface Tile {
  el: HTMLElement;
  level: number;
}

export interface View {
  render(state: GameState, best: number): void;
  onCellClick(handler: (index: number) => void): void;
  setWateringMode(on: boolean): void;
  boardEl: HTMLElement;
  buttons: { newGame: HTMLButtonElement; undo: HTMLButtonElement; can: HTMLButtonElement };
  overlay: { el: HTMLElement; button: HTMLButtonElement; continueBtn: HTMLButtonElement };
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
  const title = el('h1', 'title', 'Merge Garden');
  const scoreVal = el('span', 'box-value', '0');
  const bestVal = el('span', 'box-value', '0');
  const scoreBox = el('div', 'box');
  scoreBox.append(el('span', 'box-label', 'Score'), scoreVal);
  const bestBox = el('div', 'box');
  bestBox.append(el('span', 'box-label', 'Best'), bestVal);
  const header = el('header', 'header');
  header.append(title, scoreBox, bestBox);

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
  const overlayText = el('p', 'overlay-text');
  const overlayBtn = el('button', 'btn primary', 'New Game');
  const continueBtn = el('button', 'btn', 'Keep playing');
  overlayEl.append(overlayText, overlayBtn, continueBtn);
  const boardWrap = el('div', 'board-wrap');
  boardWrap.append(boardEl, overlayEl);

  const canLabel = el('span', 'can-count', '0');
  const canBtn = el('button', 'btn', '');
  canBtn.append(el('span', '', '💧 Watering Can '), canLabel);
  const undoBtn = el('button', 'btn', 'Undo');
  const newBtn = el('button', 'btn', 'New Game');
  const controls = el('div', 'controls');
  controls.append(undoBtn, canBtn, newBtn);
  const hint = el('p', 'hint', 'Swipe or use arrow keys / WASD. Merge equal plants!');
  root.append(header, boardWrap, controls, hint);

  const tiles: (Tile | null)[] = new Array(SIZE * SIZE).fill(null);
  let clickHandler: (i: number) => void = () => {};
  boardEl.addEventListener('click', (e) => {
    const rect = tilesLayer.getBoundingClientRect();
    const col = Math.min(SIZE - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)));
    const row = Math.min(SIZE - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)));
    clickHandler(row * SIZE + col);
  });

  function paint(tile: Tile, level: number): void {
    tile.level = level;
    tile.el.dataset.level = String(level);
    tile.el.textContent = PLANTS[level].emoji;
    tile.el.setAttribute('aria-label', PLANTS[level].name);
  }

  function render(state: GameState, best: number): void {
    scoreVal.textContent = String(state.score);
    bestVal.textContent = String(best);
    canLabel.textContent = `${state.cans}/${MAX_CANS}`;
    canBtn.disabled = state.cans === 0 || state.status === 'lost';
    undoBtn.disabled = state.prev === null;
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
        tiles[i] = tile;
      } else if (t.level !== level) {
        paint(t, level);
      }
    });
    overlayEl.classList.toggle('hidden', state.status === 'playing' || dismissedWin(state));
    overlayText.textContent = state.status === 'lost' ? 'Game over' : 'You win!';
    continueBtn.hidden = state.status !== 'won';
    overlayEl.dataset.status = state.status;
  }

  // The win overlay can be dismissed with "Keep playing" until the next game.
  let winDismissed = false;
  function dismissedWin(state: GameState): boolean {
    return state.status === 'won' && winDismissed;
  }
  continueBtn.addEventListener('click', () => {
    winDismissed = true;
    overlayEl.classList.add('hidden');
  });
  newBtn.addEventListener('click', () => (winDismissed = false));
  overlayBtn.addEventListener('click', () => (winDismissed = false));

  return {
    render,
    onCellClick: (h) => (clickHandler = h),
    setWateringMode: (on) => {
      boardEl.classList.toggle('watering', on);
      canBtn.classList.toggle('active', on);
    },
    boardEl,
    buttons: { newGame: newBtn, undo: undoBtn, can: canBtn },
    overlay: { el: overlayEl, button: overlayBtn, continueBtn },
  };
}
