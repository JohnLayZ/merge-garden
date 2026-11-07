import { describe, it, expect } from 'vitest';
import { elapsedAt, formatTime, idleTimer, inputEnabled, pauseTimer, resumeTimer, shouldRun } from '../src/game/timer';

describe('formatTime', () => {
  it('formats m:ss below one hour', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(999)).toBe('0:00');
    expect(formatTime(1000)).toBe('0:01');
    expect(formatTime(65_000)).toBe('1:05');
    expect(formatTime(59 * 60_000 + 59_999)).toBe('59:59');
  });
  it('formats h:mm:ss from one hour', () => {
    expect(formatTime(3_600_000)).toBe('1:00:00');
    expect(formatTime(3_600_000 + 61_000)).toBe('1:01:01');
    expect(formatTime(10 * 3_600_000 + 5_000)).toBe('10:00:05');
  });
  it('treats negative or invalid values as zero', () => {
    expect(formatTime(-5)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
  });
});

describe('timer', () => {
  it('does not run until resumed', () => {
    expect(elapsedAt(idleTimer(0), 50_000)).toBe(0);
  });
  it('counts time while running', () => {
    const t = resumeTimer(idleTimer(0), 1000);
    expect(elapsedAt(t, 4500)).toBe(3500);
  });
  it('resume while running does not reset the start', () => {
    const t = resumeTimer(resumeTimer(idleTimer(0), 1000), 3000);
    expect(elapsedAt(t, 4000)).toBe(3000);
  });
  it('pause stops counting and keeps the sum (hidden tab / closed page)', () => {
    let t = resumeTimer(idleTimer(0), 0);
    t = pauseTimer(t, 5000);
    expect(elapsedAt(t, 999_999)).toBe(5000);
    t = resumeTimer(t, 100_000);
    expect(elapsedAt(t, 102_000)).toBe(7000);
  });
  it('pause when not running changes nothing', () => {
    const t = idleTimer(1234);
    expect(pauseTimer(t, 99)).toEqual(t);
  });
  it('reload: continues from the saved value, ignoring the gap between page loads', () => {
    let t = resumeTimer(idleTimer(0), 10_000);
    t = pauseTimer(t, 70_000); // page hidden/closed after 60 s, saved
    const saved = elapsedAt(t, 70_000);
    const reloaded = resumeTimer(idleTimer(saved), 5_000_000); // much later, new clock
    expect(elapsedAt(reloaded, 5_030_000)).toBe(90_000);
  });
  it('is frozen after the game ended', () => {
    let t = resumeTimer(idleTimer(0), 0);
    t = pauseTimer(t, 12_000); // win
    expect(shouldRun({ status: 'won', moves: 5 }, true)).toBe(false);
    expect(elapsedAt(resumeTimer(t, 50_000), 50_000)).toBe(12_000 + 0);
  });
  it('a backwards clock never reduces the time', () => {
    const t = resumeTimer(idleTimer(1000), 5000);
    expect(elapsedAt(t, 4000)).toBe(1000);
    expect(pauseTimer(t, 3000).elapsedMs).toBe(1000);
  });
});

describe('shouldRun', () => {
  it('starts only with the first valid move', () => {
    expect(shouldRun({ status: 'playing', moves: 0 }, true)).toBe(false);
    expect(shouldRun({ status: 'playing', moves: 1 }, true)).toBe(true);
  });
  it('stops when the tab is hidden or the game ended', () => {
    expect(shouldRun({ status: 'playing', moves: 3 }, false)).toBe(false);
    expect(shouldRun({ status: 'won', moves: 3 }, true)).toBe(false);
    expect(shouldRun({ status: 'lost', moves: 3 }, true)).toBe(false);
  });
});

describe('How to play overlay', () => {
  const playing = { status: 'playing', moves: 3 } as const;
  it('pauses the timer while open and lets it run again after closing', () => {
    expect(shouldRun(playing, true, false)).toBe(true);
    expect(shouldRun(playing, true, true)).toBe(false);
    let t = resumeTimer(idleTimer(0), 0);
    t = pauseTimer(t, 1000); // help opens after 1 s
    t = shouldRun(playing, true, false) ? resumeTimer(t, 6000) : t; // closed 5 s later
    expect(elapsedAt(t, 7000)).toBe(2000); // the 5 s while open do not count
  });
  it('ignores game input while open', () => {
    expect(inputEnabled(true)).toBe(false);
    expect(inputEnabled(false)).toBe(true);
  });
});
