/**
 * Dev-only estimate of game length: plays many games with a simple strategy and prints statistics.
 * Not part of the production build. Run with:  npm run simulate  [-- games]
 * It only uses the pure game logic; it never changes any rules.
 */
import { applyMove, newGame } from '../src/game/state';
import { MAX_LEVEL, type Direction, type GameState } from '../src/game/types';

// no @types/node in this project: read the optional game count from argv via globalThis
const argv = (globalThis as unknown as { process?: { argv: string[] } }).process?.argv ?? [];
const GAMES = Number(argv[2]) || 500;
/** Preference order: down and left first, right when blocked, up as a last resort. */
const ORDER: Direction[] = ['down', 'left', 'right', 'up'];

interface Result {
  won: boolean;
  moves: number;
  /** Move number at which a level was first reached (undefined = never). */
  reached: Record<number, number | undefined>;
}

function play(seed: number): Result {
  let s: GameState = newGame(seed);
  const reached: Record<number, number | undefined> = {};
  while (s.status === 'playing') {
    let next = s;
    for (const d of ORDER) {
      next = applyMove(s, d);
      if (next !== s) break;
    }
    if (next === s) break; // cannot happen: status would be 'lost'
    s = next;
    const top = Math.max(...s.board);
    for (let l = 1; l <= top; l++) reached[l] ??= s.moves;
  }
  return { won: s.status === 'won', moves: s.moves, reached };
}

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const median = (a: number[]) => {
  if (!a.length) return NaN;
  const b = [...a].sort((x, y) => x - y);
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const fmt = (n: number) => (Number.isNaN(n) ? '-' : n.toFixed(1));

const results = Array.from({ length: GAMES }, (_, i) => play(1000 + i));
console.log(`Simulation: ${GAMES} games, strategy down > left > right > up, winning level ${MAX_LEVEL}`);
console.log(`Reached level ${MAX_LEVEL} (win): ${results.filter((r) => r.won).length} of ${GAMES}`);
console.log(`Highest level reached: ${Math.max(...results.map((r) => Math.max(0, ...Object.keys(r.reached).map(Number))))}`);
console.log(`Moves until the end (win or loss): mean ${fmt(mean(results.map((r) => r.moves)))}, median ${fmt(median(results.map((r) => r.moves)))}`);
for (const level of [7, 8, 9, MAX_LEVEL - 1, MAX_LEVEL].filter((l, i, a) => l <= MAX_LEVEL && a.indexOf(l) === i)) {
  const m = results.map((r) => r.reached[level]).filter((v): v is number => v !== undefined);
  console.log(`Moves until level ${level}: reached in ${m.length} games, mean ${fmt(mean(m))}, median ${fmt(median(m))}`);
}
