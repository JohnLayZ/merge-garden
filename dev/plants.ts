import '../src/style.css';
import { LEVELS } from '../src/levels';
import { PLANTS } from '../src/ui/plants';

// Same markup/CSS as in the game, in real cell size (cells are 23.5% of the board width).
function cell(level: number): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;aspect-ratio:1';
  wrap.innerHTML = `<div class="cell" style="--r:0;--c:0;left:0;top:0;width:100%;height:100%"></div>
  <div class="tile" data-level="${level}" style="--tile-bg:${PLANTS[level].color};--r:0;--c:0;left:0;top:0;width:100%;height:100%;transition:none">
  <span class="plant" style="--s:${PLANTS[level].scale}">${PLANTS[level].svg}</span></div>`;
  return wrap;
}
const grid = document.getElementById('grid')!;
for (let l = 1; l <= LEVELS.length; l++) grid.append(cell(l));
