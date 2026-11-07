import type { GameState } from './types';

/**
 * Pure play-time logic. The clock (`now`, in ms) is always passed in; nothing here reads real time.
 * Only active time is summed up: `elapsedMs` is the stored total, `runningSince` the clock value at
 * which the current running stretch began (null while paused). Only `elapsedMs` is persisted.
 */
export interface TimerState {
  elapsedMs: number;
  runningSince: number | null;
}

export function idleTimer(elapsedMs = 0): TimerState {
  return { elapsedMs: Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0, runningSince: null };
}

export function elapsedAt(t: TimerState, now: number): number {
  return t.elapsedMs + (t.runningSince === null ? 0 : Math.max(0, now - t.runningSince));
}

export function resumeTimer(t: TimerState, now: number): TimerState {
  return t.runningSince === null ? { elapsedMs: t.elapsedMs, runningSince: now } : t;
}

export function pauseTimer(t: TimerState, now: number): TimerState {
  return t.runningSince === null ? t : { elapsedMs: elapsedAt(t, now), runningSince: null };
}

/**
 * The timer runs from the first valid move until win/loss, and only while the page is visible
 * and the "How to play" overlay is closed.
 */
export function shouldRun(state: Pick<GameState, 'status' | 'moves'>, visible: boolean, helpOpen = false): boolean {
  return visible && !helpOpen && state.status === 'playing' && state.moves > 0;
}

/** Game input (swipe, keys) is ignored while the "How to play" overlay is open. */
export function inputEnabled(helpOpen: boolean): boolean {
  return !helpOpen;
}

/** m:ss, or h:mm:ss from one hour on. */
export function formatTime(ms: number): string {
  const total = Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
