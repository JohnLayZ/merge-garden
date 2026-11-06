import { slideRow, type RowTrace } from './row';
import { SIZE, type Board, type Direction } from './types';

export interface TileMove {
  from: number;
  to: number;
  merged: boolean;
}

export interface MoveResult {
  board: Board;
  score: number;
  merges: number;
  moved: boolean;
  tiles: TileMove[];
}

/** Cell indices of each line, ordered from the wall the plants slide towards. */
function lines(dir: Direction): number[][] {
  const result: number[][] = [];
  for (let a = 0; a < SIZE; a++) {
    const line: number[] = [];
    for (let b = 0; b < SIZE; b++) {
      const k = dir === 'left' || dir === 'up' ? b : SIZE - 1 - b;
      line.push(dir === 'left' || dir === 'right' ? a * SIZE + k : k * SIZE + a);
    }
    result.push(line);
  }
  return result;
}

export function moveBoard(board: Board, dir: Direction): MoveResult {
  const next: Board = new Array(SIZE * SIZE).fill(0);
  const tiles: TileMove[] = [];
  let score = 0;
  let merges = 0;
  let moved = false;
  for (const line of lines(dir)) {
    const res = slideRow(line.map((i) => board[i]));
    res.row.forEach((v, k) => (next[line[k]] = v));
    score += res.score;
    merges += res.merges;
    moved ||= res.moved;
    res.trace.forEach((t: RowTrace) => tiles.push({ from: line[t.from], to: line[t.to], merged: t.merged }));
  }
  return { board: moved ? next : board.slice(), score, merges, moved, tiles };
}
