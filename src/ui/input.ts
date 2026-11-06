import type { Direction } from '../game/types';

const KEYS: Record<string, Direction> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
  A: 'left', D: 'right', W: 'up', S: 'down',
};

export function keyToDirection(key: string): Direction | null {
  return KEYS[key] ?? null;
}

/** Direction of a swipe, or null if it is shorter than `threshold` px. */
export function swipeDirection(dx: number, dy: number, threshold = 24): Direction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function bindInput(target: HTMLElement, onMove: (d: Direction) => void): void {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const d = keyToDirection(e.key);
    if (d) {
      e.preventDefault();
      onMove(d);
    }
  });
  let start: { x: number; y: number } | null = null;
  target.addEventListener('pointerdown', (e) => {
    start = { x: e.clientX, y: e.clientY };
  });
  const end = (e: PointerEvent) => {
    if (!start) return;
    const d = swipeDirection(e.clientX - start.x, e.clientY - start.y);
    start = null;
    if (d) onMove(d);
  };
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', () => (start = null));
}
