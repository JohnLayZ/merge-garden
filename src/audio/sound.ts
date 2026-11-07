import { MAX_LEVEL } from '../levels';
import type { KV } from '../storage';

/**
 * Soft sounds generated with the Web Audio API (no audio files, no external sources).
 * Lives outside src/game so the game logic stays pure. The AudioContext is only created
 * by `unlock()`, which is called on the first user action (browser autoplay rules).
 */
export type SoundEvent = 'merge' | 'win' | 'lose';

export const MUTE_KEY = 'merge-garden:muted';

/** Merges create levels 2..MAX_LEVEL (a seed, level 1, only ever spawns and makes no sound). */
const MERGE_LEVELS = Array.from({ length: MAX_LEVEL - 1 }, (_, i) => i + 2);

/**
 * C major pentatonic (C D E G A, repeating each octave) starting at C4, one note per resulting level
 * of a merge, derived from the central level list: level 2 = C4 ... level 7 = C5 (as before),
 * level 8 = D5, level 9 = E5. Higher level = higher note.
 */
const PENTATONIC = [0, 2, 4, 7, 9];
export const MERGE_NOTES: Record<number, number> = Object.fromEntries(
  MERGE_LEVELS.map((lv, i) => {
    const semitones = PENTATONIC[i % 5] + 12 * Math.floor(i / 5);
    return [lv, 261.63 * 2 ** (semitones / 12)];
  }),
);

/** Overtones above this frequency (the highest merge overtone before Paket 5, C6) are left out so higher levels never get shriller. */
export const MAX_PARTIAL_HZ = 1046.5;

/** Gain of a merge note: falls linearly from 1 (level 2) to MERGE_GAIN_MIN (top level); a bit lower than the old curve at 3..7, never louder. */
export const MERGE_GAIN_MIN = 0.6;

/**
 * Single knob for the overall volume (0..1). Every tone's peak is `gain * MASTER_VOLUME`, all
 * relative gains below are <= 1. Paket 4: raised from 0.12 to 0.30 (2.5x) because the sounds
 * were too quiet on phones; a limiter (DynamicsCompressor) at the output keeps peaks clean.
 */
export const MASTER_VOLUME = 0.3;
const ATTACK = 0.025;

/** Relative gains per sound (each 0 < g <= 1); ratios between sounds are unchanged since Paket 3. */
export const GAINS = {
  /** Fundamental gain of a merge note per resulting level: higher notes sound louder to the ear, so they are trimmed. */
  mergeByLevel: Object.fromEntries(
    MERGE_LEVELS.map((lv) => [lv, 1 - (1 - MERGE_GAIN_MIN) * ((lv - 2) / (MAX_LEVEL - 2))]),
  ) as Record<number, number>,
  mergeOctave: 0.35,
  mergeFifth: 0.3,
  winNote: 0.9,
  winChord: 0.5,
  lose: 0.7,
};

/** Output limiter settings (keeps the louder master from clipping or clicking). */
export const LIMITER = { threshold: -12, knee: 6, ratio: 12, attack: 0.003, release: 0.25 };

/** The small part of AudioContext we use (lets tests pass a fake). */
export interface AudioCtxLike {
  currentTime: number;
  state: string;
  destination: unknown;
  resume(): Promise<void>;
  createGain(): { gain: AudioParamLike; connect(n: unknown): unknown };
  createDynamicsCompressor(): {
    threshold: AudioParamLike & { value: number };
    knee: AudioParamLike & { value: number };
    ratio: AudioParamLike & { value: number };
    attack: AudioParamLike & { value: number };
    release: AudioParamLike & { value: number };
    connect(n: unknown): unknown;
  };
  createOscillator(): {
    type: string;
    frequency: AudioParamLike;
    connect(n: unknown): unknown;
    start(t: number): void;
    stop(t: number): void;
  };
}
interface AudioParamLike {
  setValueAtTime(v: number, t: number): unknown;
  linearRampToValueAtTime(v: number, t: number): unknown;
  exponentialRampToValueAtTime(v: number, t: number): unknown;
}

export interface Sound {
  readonly muted: boolean;
  setMuted(m: boolean): void;
  /** Call from a user gesture; creates/resumes the audio context. */
  unlock(): void;
  play(event: SoundEvent, level?: number): void;
}

export interface SoundOptions {
  kv: KV;
  create?: () => AudioCtxLike;
}

function defaultCreate(): AudioCtxLike {
  const Ctor = (window as unknown as { AudioContext?: new () => AudioCtxLike; webkitAudioContext?: new () => AudioCtxLike });
  const C = Ctor.AudioContext ?? Ctor.webkitAudioContext;
  if (!C) throw new Error('Web Audio not supported');
  return new C();
}

export function createSound({ kv, create = defaultCreate }: SoundOptions): Sound {
  let muted = false;
  try {
    muted = kv.getItem(MUTE_KEY) === '1';
  } catch {
    /* storage unavailable */
  }
  let ctx: AudioCtxLike | null = null;
  let out: unknown = null; // limiter node every tone is routed through
  let failed = false;

  function unlock(): void {
    if (failed) return;
    try {
      if (!ctx) {
        const c = create();
        const lim = c.createDynamicsCompressor();
        lim.threshold.value = LIMITER.threshold;
        lim.knee.value = LIMITER.knee;
        lim.ratio.value = LIMITER.ratio;
        lim.attack.value = LIMITER.attack;
        lim.release.value = LIMITER.release;
        lim.connect(c.destination);
        out = lim;
        ctx = c;
      }
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    } catch {
      failed = true;
    }
  }

  /** One soft note: short attack, exponential decay, sine/triangle only. */
  function tone(c: AudioCtxLike, freq: number, start: number, dur: number, gain: number, type: 'sine' | 'triangle' = 'sine'): void {
    const g = c.createGain();
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gain * MASTER_VOLUME, start + ATTACK);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(out);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  function play(event: SoundEvent, level = 2): void {
    if (muted || failed || !ctx) return;
    const c = ctx;
    const t = c.currentTime + 0.005;
    try {
      switch (event) {
        case 'merge': {
          const lv = Math.min(MAX_LEVEL, Math.max(2, Math.round(level)));
          const f = MERGE_NOTES[lv];
          const lg = GAINS.mergeByLevel[lv];
          tone(c, f, t, 0.45, lg);
          // higher level = fuller tone: add soft overtones (not above MAX_PARTIAL_HZ: never shriller than before)
          if (lv >= 4 && f * 2 <= MAX_PARTIAL_HZ) tone(c, f * 2, t, 0.4, GAINS.mergeOctave * lg);
          if (lv >= 6 && f * 1.5 <= MAX_PARTIAL_HZ) tone(c, f * 1.5, t, 0.5, GAINS.mergeFifth * lg);
          break;
        }
        case 'win':
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t + i * 0.14, 0.6, GAINS.winNote));
          tone(c, 523.25, t + 0.56, 1.2, GAINS.winChord);
          tone(c, 783.99, t + 0.56, 1.2, GAINS.winChord);
          break;
        case 'lose':
          tone(c, 349.23, t, 0.7, GAINS.lose, 'triangle');
          tone(c, 293.66, t + 0.25, 1.0, GAINS.lose, 'triangle');
          break;
      }
    } catch {
      /* never let audio break the game */
    }
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(m) {
      muted = m;
      try {
        kv.setItem(MUTE_KEY, m ? '1' : '0');
      } catch {
        /* ignore */
      }
    },
    unlock,
    play,
  };
}
