import { describe, it, expect } from 'vitest';
import { MAX_LEVEL } from '../src/levels';
import { GAINS, LIMITER, MASTER_VOLUME, MAX_PARTIAL_HZ, MERGE_NOTES, createSound, type AudioCtxLike } from '../src/audio/sound';
import type { KV } from '../src/storage';

const fakeKv = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

function fakeCtx() {
  const osc: { type: string; freq: number }[] = [];
  const peaks: number[] = [];
  const gains: { connectedTo: unknown[] }[] = [];
  const limiter: { connectedTo: unknown[]; threshold: { value: number } } = { connectedTo: [], threshold: { value: 0 } };
  const destination = {};
  const param = (onSet?: (v: number) => void) => ({
    value: 0,
    setValueAtTime: (v: number) => onSet?.(v),
    linearRampToValueAtTime: (v: number) => onSet?.(v),
    exponentialRampToValueAtTime: () => {},
  });
  const ctx: AudioCtxLike = {
    currentTime: 0,
    state: 'suspended',
    destination,
    resume: () => Promise.resolve(),
    createGain: () => {
      const g = { connectedTo: [] as unknown[], gain: param((v) => peaks.push(v)), connect: (n: unknown) => (g.connectedTo.push(n), {}) };
      gains.push(g);
      return g;
    },
    createDynamicsCompressor: () => {
      const p = () => ({ ...param(), value: 0 });
      return Object.assign(limiter, {
        threshold: Object.assign(p(), limiter.threshold),
        knee: p(),
        ratio: p(),
        attack: p(),
        release: p(),
        connect: (n: unknown) => (limiter.connectedTo.push(n), {}),
      });
    },
    createOscillator: () => {
      const o = { type: '', frequency: param(), connect: () => ({}), start: () => {}, stop: () => {} };
      osc.push(o as never);
      return o as never;
    },
  };
  return { ctx, osc, peaks, gains, limiter, destination };
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
    s.play('merge', 3);
    s.play('win');
    s.play('lose');
    expect(f.osc.length).toBe(0);
    expect(kv.data.get('merge-garden:muted')).toBe('1');
    expect(createSound({ kv, create: () => f.ctx }).muted).toBe(true);
    s.setMuted(false);
    expect(kv.data.get('merge-garden:muted')).toBe('0');
    expect(createSound({ kv, create: () => f.ctx }).muted).toBe(false);
    s.play('merge', 3);
    expect(f.osc.length).toBeGreaterThan(0);
  });
  it('merge notes rise with the plant level and stay soft', () => {
    const levels = Object.keys(MERGE_NOTES).map(Number).sort((a, b) => a - b);
    expect(levels).toEqual(Array.from({ length: MAX_LEVEL - 1 }, (_, i) => i + 2));
    for (let i = 1; i < levels.length; i++) expect(MERGE_NOTES[levels[i]]).toBeGreaterThan(MERGE_NOTES[levels[i - 1]]);
    const f = fakeCtx();
    const s = createSound({ kv: fakeKv(), create: () => f.ctx });
    s.unlock();
    for (const e of ['merge', 'win', 'lose'] as const) s.play(e, 4);
    expect(f.osc.every((o) => o.type === 'sine' || o.type === 'triangle')).toBe(true);
    expect(Math.max(...f.peaks)).toBeLessThanOrEqual(MASTER_VOLUME);
  });
  it('survives storage and audio failures', () => {
    const bad: KV = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    const s = createSound({ kv: bad, create: () => { throw new Error('no audio'); } });
    expect(() => { s.unlock(); s.play('merge', 2); s.setMuted(true); }).not.toThrow();
  });

  describe('volume', () => {
    const all = ['merge', 'win', 'lose'] as const;
    const playAll = (f: ReturnType<typeof fakeCtx>) => {
      const s = createSound({ kv: fakeKv(), create: () => f.ctx });
      s.unlock();
      for (let lv = 2; lv <= MAX_LEVEL; lv++) s.play('merge', lv);
      s.play('win');
      s.play('lose');
    };
    it('has a note and a gain between 0.6 and 1 for every merge level of the list, falling with the level', () => {
      // levels 2..MAX_LEVEL are created by merges; level 1 (seed) only spawns and has no sound
      for (let lv = 2; lv <= MAX_LEVEL; lv++) {
        expect(MERGE_NOTES[lv]).toBeGreaterThan(0);
        expect(GAINS.mergeByLevel[lv]).toBeGreaterThanOrEqual(0.6);
        expect(GAINS.mergeByLevel[lv]).toBeLessThanOrEqual(1);
        if (lv > 2) {
          expect(MERGE_NOTES[lv]).toBeGreaterThan(MERGE_NOTES[lv - 1]);
          expect(GAINS.mergeByLevel[lv]).toBeLessThan(GAINS.mergeByLevel[lv - 1]);
        }
      }
      expect(GAINS.mergeByLevel[2]).toBe(1);
      expect(GAINS.mergeByLevel[MAX_LEVEL]).toBeCloseTo(0.6, 9);
    });
    it('falls evenly: equal gain steps from 1 down to 0.6 over all merge levels', () => {
      const step = (1 - 0.6) / (MAX_LEVEL - 2);
      for (let lv = 3; lv <= MAX_LEVEL; lv++) {
        expect(GAINS.mergeByLevel[lv - 1] - GAINS.mergeByLevel[lv]).toBeCloseTo(step, 9);
      }
    });
    it('is never shriller than E5 (the old top note) for any level, and never above the limiter ceiling', () => {
      const E5 = 659.26;
      expect(MERGE_NOTES[MAX_LEVEL]).toBeCloseTo(E5, 0);
      for (let lv = 2; lv <= MAX_LEVEL; lv++) expect(MERGE_NOTES[lv]).toBeLessThanOrEqual(E5 + 0.5);
      // pentatonic: every note is one of C D E G A in some octave
      const pent = new Set([0, 2, 4, 7, 9]);
      for (let lv = 2; lv <= MAX_LEVEL; lv++) {
        const semis = Math.round(12 * Math.log2(MERGE_NOTES[lv] / 261.63));
        expect(pent.has(((semis % 12) + 12) % 12)).toBe(true);
      }
      for (let lv = 2; lv <= MAX_LEVEL; lv++) {
        const f = fakeCtx();
        const s = createSound({ kv: fakeKv(), create: () => f.ctx });
        s.unlock();
        s.play('merge', lv);
        const real = f.peaks.filter((v) => v > 0.001);
        expect(real.length).toBeGreaterThan(0);
        for (const v of real) expect(v).toBeLessThanOrEqual(MASTER_VOLUME + 1e-9); // limiter ceiling = MASTER_VOLUME
        for (const g of f.gains) expect(g.connectedTo).toEqual([f.limiter]); // every tone goes through the limiter
      }
    });
    it('adds no overtone above MAX_PARTIAL_HZ', () => {
      for (let lv = 2; lv <= MAX_LEVEL; lv++) {
        const f = fakeCtx();
        const hz: number[] = [];
        const origOsc = f.ctx.createOscillator;
        f.ctx.createOscillator = () => {
          const o = origOsc();
          const setAt = o.frequency.setValueAtTime;
          o.frequency.setValueAtTime = (v: number, t: number) => (hz.push(v), setAt(v, t));
          return o;
        };
        const s = createSound({ kv: fakeKv(), create: () => f.ctx });
        s.unlock();
        s.play('merge', lv);
        expect(hz[0]).toBeCloseTo(MERGE_NOTES[lv], 6);
        for (const v of hz.slice(1)) expect(v).toBeLessThanOrEqual(MAX_PARTIAL_HZ);
        expect(Math.max(...hz)).toBeLessThanOrEqual(Math.max(MAX_PARTIAL_HZ, MERGE_NOTES[lv]));
      }
    });
    it('has a MASTER_VOLUME in a sane range', () => {
      expect(MASTER_VOLUME).toBeGreaterThan(0.12);
      expect(MASTER_VOLUME).toBeLessThanOrEqual(1);
    });
    it('keeps every relative gain in (0, 1]', () => {
      const values = [
        ...Object.values(GAINS.mergeByLevel),
        ...Object.entries(GAINS)
          .filter(([, v]) => typeof v === 'number')
          .map(([, v]) => v as number),
      ];
      expect(values.length).toBeGreaterThan(8);
      for (const v of values) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThanOrEqual(1);
      }
      // higher merge notes are trimmed, never louder than lower ones
      for (let lv = 3; lv <= MAX_LEVEL; lv++) expect(GAINS.mergeByLevel[lv]).toBeLessThanOrEqual(GAINS.mergeByLevel[lv - 1]);
    });
    it('scales every played gain by MASTER_VOLUME and never exceeds 1', () => {
      const f = fakeCtx();
      playAll(f);
      const real = f.peaks.filter((v) => v > 0.001);
      expect(real.length).toBeGreaterThan(10);
      for (const v of real) {
        expect(v).toBeLessThanOrEqual(MASTER_VOLUME + 1e-9);
        expect(v).toBeLessThanOrEqual(1);
        // each peak is relative gain * MASTER_VOLUME
        expect(v / MASTER_VOLUME).toBeLessThanOrEqual(1 + 1e-9);
      }
      expect(Math.max(...real)).toBeCloseTo(MASTER_VOLUME, 9);
    });
    it('routes all tones through the limiter, never straight to the destination', () => {
      const f = fakeCtx();
      playAll(f);
      expect(f.gains.length).toBeGreaterThan(10);
      for (const g of f.gains) expect(g.connectedTo).toEqual([f.limiter]);
      expect(f.limiter.connectedTo).toEqual([f.destination]);
      expect(f.limiter.threshold.value).toBe(LIMITER.threshold);
    });
    it('mute silences every sound event', () => {
      const f = fakeCtx();
      const s = createSound({ kv: fakeKv(), create: () => f.ctx });
      s.unlock();
      s.setMuted(true);
      const before = f.gains.length;
      for (const e of all) s.play(e, 5);
      expect(f.osc.length).toBe(0);
      expect(f.gains.length).toBe(before);
      expect(f.peaks.length).toBe(0);
    });
  });
});
