import { MAX_LEVEL } from './types';

export interface RowTrace {
  /** index in the source row */
  from: number;
  /** index in the result row */
  to: number;
  /** true if this plant merged into another one */
  merged: boolean;
}

export interface SlideResult {
  row: number[];
  score: number;
  merges: number;
  moved: boolean;
  trace: RowTrace[];
}

/** Slide a row towards index 0 and merge equal neighbours (once per plant). */
export function slideRow(input: readonly number[]): SlideResult {
  const row: number[] = new Array(input.length).fill(0);
  const trace: RowTrace[] = [];
  let score = 0;
  let merges = 0;
  let out = -1;
  let lastMergeable = false;
  for (let i = 0; i < input.length; i++) {
    const v = input[i];
    if (v === 0) continue;
    if (out >= 0 && lastMergeable && row[out] === v && v < MAX_LEVEL) {
      row[out] = v + 1;
      score += 2 ** (v + 1);
      merges++;
      lastMergeable = false;
      trace.push({ from: i, to: out, merged: true });
    } else {
      out++;
      row[out] = v;
      lastMergeable = true;
      trace.push({ from: i, to: out, merged: false });
    }
  }
  const moved = row.some((v, i) => v !== input[i]);
  return { row, score, merges, moved, trace };
}
