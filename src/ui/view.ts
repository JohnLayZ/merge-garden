import type { TileMove } from '../game/board';
import type { GameState } from '../game/types';
import { SIZE, MAX_CANS } from '../game/types';
import { PLANTS } from './plants';

interface Tile {
  el: HTMLElement;
  level: number;
}

export interface View {
  render(state: GameState, best: number, moves?: TileMove[]): void;
  onCellClick(handler: (index: number) => void): void;
  setWateringMode(on: boolean): void;
  boardEl: HTMLElement;
  buttons: { newGame: HTMLButtonElement; undo: HTMLButtonElement; can: HTMLButtonElement };
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
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-live', 'polite');
  const overlayText = el('p', 'overlay-text');
  const overlayBtn = el('button', 'btn primary', 'New Game');
  overlayEl.append(overlayText, overlayBtn);
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

  const SLIDE_MS = 130;
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
        setTimeout(() => gone.el.remove(), SLIDE_MS);
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
    canLabel.textContent = `${state.cans}/${MAX_CANS}`;
    canBtn.disabled = state.cans === 0 || state.status !== 'playing';
    undoBtn.disabled = state.prev === null || state.status === 'won';
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
    overlayEl.dataset.status = state.status;
  }

  return {
    render,
    onCellClick: (h) => (clickHandler = h),
    setWateringMode: (on) => {
      boardEl.classList.toggle('watering', on);
      canBtn.classList.toggle('active', on);
    },
    boardEl,
    buttons: { newGame: newBtn, undo: undoBtn, can: canBtn },
    overlay: { el: overlayEl, button: overlayBtn },
  };
}
