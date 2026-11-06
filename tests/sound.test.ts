import { describe, it, expect } from 'vitest';
import { MERGE_NOTES, createSound, type AudioCtxLike } from '../src/audio/sound';
import type { KV } from '../src/storage';

const fakeKv = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

function fakeCtx() {
  const osc: { type: string; freq: number }[] = [];
  const peaks: number[] = [];
  const param = (onSet?: (v: number) => void) => ({
    value: 0,
    setValueAtTime: (v: number) => onSet?.(v),
    linearRampToValueAtTime: (v: number) => onSet?.(v),
    exponentialRampToValueAtTime: () => {},
  });
  const ctx: AudioCtxLike = {
    currentTime: 0,
    state: 'suspended',
    destination: {},
    resume: () => Promise.resolve(),
    createGain: () => ({ gain: param((v) => peaks.push(v)), connect: () => ({}) }),
    createOscillator: () => {
      const o = { type: '', frequency: param(), connect: () => ({}), start: () => {}, stop: () => {} };
      osc.push(o as never);
      return o as never;
    },
  };
  return { ctx, osc, peaks };
}

describe('sound', () => {
  it('creates no audio context before the first user action', () => {
    let created = 0;
    const s = createSound({ kv: fakeKv(), create: () => { created++; return fakeCtx().ctx; } });
    s.play('merge', 3);
    expect(created).toBe(0);
    s.unlock();
    expect(created).toBe(1);
    s.unlock();
    expect(created).toBe(1);
  });
  it('plays nothing while muted and persists the mute state', () => {
    const kv = fakeKv();
    const f = fakeCtx();
    const s = createSound({ kv, create: () => f.ctx });
    s.unlock();
    s.setMuted(true);
    s.play('water');
    expect(f.osc.length).toBe(0);
    expect(kv.data.get('merge-garden:muted')).toBe('1');
    expect(createSound({ kv, create: () => f.ctx }).muted).toBe(true);
    s.setMuted(false);
    expect(kv.data.get('merge-garden:muted')).toBe('0');
    expect(createSound({ kv, create: () => f.ctx }).muted).toBe(false);
    s.play('water');
    expect(f.osc.length).toBeGreaterThan(0);
  });
  it('merge notes rise with the plant level and stay soft', () => {
    const levels = Object.keys(MERGE_NOTES).map(Number).sort((a, b) => a - b);
    expect(levels).toEqual([2, 3, 4, 5, 6, 7]);
    for (let i = 1; i < levels.length; i++) expect(MERGE_NOTES[levels[i]]).toBeGreaterThan(MERGE_NOTES[levels[i - 1]]);
    const f = fakeCtx();
    const s = createSound({ kv: fakeKv(), create: () => f.ctx });
    s.unlock();
    for (const e of ['merge', 'water', 'win', 'lose'] as const) s.play(e, 4);
    expect(f.osc.every((o) => o.type === 'sine' || o.type === 'triangle')).toBe(true);
    expect(Math.max(...f.peaks)).toBeLessThanOrEqual(0.2);
  });
  it('survives storage and audio failures', () => {
    const bad: KV = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    const s = createSound({ kv: bad, create: () => { throw new Error('no audio'); } });
    expect(() => { s.unlock(); s.play('merge', 2); s.setMuted(true); }).not.toThrow();
  });
});
