/**
 * All animation timings and scales in ONE place. They are handed to the stylesheet as CSS custom
 * properties by `applyMotion` (see view.ts), so one value here re-tunes the feel.
 * Animations always run, regardless of prefers-reduced-motion (see DECISIONS.md).
 */
export const MOTION = {
  /** Tiles gliding to their new cell. */
  slideMs: 130,
  /** Merge pop: duration and maximum scale (calm, no particles, no wobble). */
  popMs: 200,
  popScale: 1.14,
  /** Pop and spawn start after the slide has (almost) finished. */
  delayMs: 100,
  /** Newly spawned seeds: fade in while growing from `spawnFromScale` to 1. Never blocks input. */
  spawnMs: 180,
  spawnFromScale: 0.8,
  /** Win / game-over overlay fade-in. The button is clickable from the first frame. */
  overlayFadeMs: 250,
} as const;

/** Sets the motion constants as CSS custom properties on `target`. */
export function applyMotion(target: HTMLElement): void {
  const s = target.style;
  s.setProperty('--slide-ms', `${MOTION.slideMs}ms`);
  s.setProperty('--pop-ms', `${MOTION.popMs}ms`);
  s.setProperty('--pop-scale', String(MOTION.popScale));
  s.setProperty('--anim-delay', `${MOTION.delayMs}ms`);
  s.setProperty('--spawn-ms', `${MOTION.spawnMs}ms`);
  s.setProperty('--spawn-from', String(MOTION.spawnFromScale));
  s.setProperty('--overlay-fade-ms', `${MOTION.overlayFadeMs}ms`);
}
