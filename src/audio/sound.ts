import type { KV } from '../storage';

/**
 * Soft sounds generated with the Web Audio API (no audio files, no external sources).
 * Lives outside src/game so the game logic stays pure. The AudioContext is only created
 * by `unlock()`, which is called on the first user action (browser autoplay rules).
 */
export type SoundEvent = 'merge' | 'water' | 'win' | 'lose';

export const MUTE_KEY = 'merge-garden:muted';

/** C major pentatonic (C4 D4 E4 G4 A4 C5), indexed by the level of the plant created by a merge. */
export const MERGE_NOTES: Record<number, number> = { 2: 261.63, 3: 293.66, 4: 329.63, 5: 392.0, 6: 440.0, 7: 523.25 };

const MASTER = 0.12; // low overall volume
const ATTACK = 0.025;

/** The small part of AudioContext we use (lets tests pass a fake). */
export interface AudioCtxLike {
  currentTime: number;
  state: string;
  destination: unknown;
  resume(): Promise<void>;
  createGain(): { gain: AudioParamLike; connect(n: unknown): unknown };
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
  let failed = false;

  function unlock(): void {
    if (failed) return;
    try {
      ctx ??= create();
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
    g.gain.linearRampToValueAtTime(gain * MASTER, start + ATTACK);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(c.destination);
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
          const lv = Math.min(7, Math.max(2, Math.round(level)));
          const f = MERGE_NOTES[lv];
          tone(c, f, t, 0.45, 1);
          // higher level = fuller tone: add soft overtones
          if (lv >= 4) tone(c, f * 2, t, 0.4, 0.35);
          if (lv >= 6) tone(c, f * 1.5, t, 0.5, 0.3);
          break;
        }
        case 'water':
          tone(c, 392.0, t, 0.3, 0.8, 'triangle');
          tone(c, 587.33, t + 0.09, 0.4, 0.7);
          break;
        case 'win':
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t + i * 0.14, 0.6, 0.9));
          tone(c, 523.25, t + 0.56, 1.2, 0.5);
          tone(c, 783.99, t + 0.56, 1.2, 0.5);
          break;
        case 'lose':
          tone(c, 349.23, t, 0.7, 0.7, 'triangle');
          tone(c, 293.66, t + 0.25, 1.0, 0.7, 'triangle');
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
