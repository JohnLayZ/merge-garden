import '../src/style.css';

import { LEVELS } from '../src/levels';

/** The preview reads the game's own level list (names, colours, sizes, drawings): what you see is what the game uses. */
const DRAFT = LEVELS;
const svgs = LEVELS.map((l) => l.svg);

const style = document.createElement('style');
style.textContent = `
  /* real cell size: board width (page width up to 520 minus padding) * 95% layer * 23.5% tile */
  :root { --cell: calc((min(100vw, 520px) - 32px) * 0.95 * 0.235); }
  h2 { font-size: 1rem; margin: 6px 0 0; }
  .title small { font-size: 0.7em; font-weight: 600; opacity: 0.7; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  .item { display: flex; flex-direction: column; align-items: center; gap: 3px; width: var(--cell); font-size: 0.62rem; font-weight: 700; text-align: center; line-height: 1.15; }
  .item .tile { position: relative; left: 0; top: 0; width: var(--cell); height: var(--cell); transition: none; }
  .bars { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 6px 4px; padding: 8px 6px 6px; background: var(--board); border-radius: 12px; }
  .bar { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; font-size: 0.55rem; font-weight: 700; width: var(--cell); }
  .bar .plant { --s: 1; }
  .bar span.f { opacity: 0.8; }
`;
document.head.append(style);

const root = document.getElementById('root')!;
const label = (i: number) => `${i + 1} ${DRAFT[i].name}`;
function tile(i: number): string {
  return `<div class="tile" style="--tile-bg:${DRAFT[i].color}"><span class="plant" style="--s:${DRAFT[i].scale}">${svgs[i]}</span></div>`;
}

// a) all levels in real cell size
let html = '<h2>a) All levels, real cell size</h2><div class="row">';
DRAFT.forEach((_, i) => (html += `<div class="item">${tile(i)}<span>${label(i)}</span></div>`));
html += '</div>';

// b) size ratios on a common baseline (bar width = one 11th of the strip; plant height = factor)
html += '<h2>b) Size ratios on a common baseline (factor × cell)</h2><div class="bars">';
DRAFT.forEach((d, i) => {
  html += `<div class="bar"><span class="plant" style="width:${d.scale * 100}%">${svgs[i]}</span><span class="f">${d.scale}</span></div>`;
});
html += '</div>';

// c) 4x4 board in the game's look, as many different levels as possible (every level once, then repeats)
const layout = Array.from({ length: 16 }, (_, i) => ((i * 5) % LEVELS.length) + 1);
html += '<h2>c) Board mock-up (4×4)</h2><div class="board"><div class="layer">';
layout.forEach((lvl, idx) => {
  const i = lvl - 1;
  html += `<div class="cell" style="--r:${Math.floor(idx / 4)};--c:${idx % 4}"></div>
  <div class="tile" style="--tile-bg:${DRAFT[i].color};--r:${Math.floor(idx / 4)};--c:${idx % 4};transition:none"><span class="plant" style="--s:${DRAFT[i].scale}">${svgs[i]}</span></div>`;
});
html += '</div></div>';
root.innerHTML = html;
