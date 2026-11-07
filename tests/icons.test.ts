import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The project has no @types/node (no extra dependency for one test), so declare what is used here.
declare const process: { env: Record<string, string | undefined> };
const here = fileURLToPath(new URL('.', import.meta.url));

const dist = resolve(here, '../dist');
const file = (f: string) => resolve(dist, f);

function pngSize(path: string): [number, number] {
  const b = readFileSync(path);
  expect(b.subarray(1, 4).toString()).toBe('PNG');
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

describe.each([
  ['/merge-garden/', '/merge-garden/'],
  ['./', ''],
])('built dist with base %s', (base, prefix) => {
  let html = '';
  beforeAll(() => {
    execSync('npx vite build', { cwd: resolve(here, '..'), env: { ...process.env, BASE_PATH: base }, stdio: 'pipe' });
    html = readFileSync(file('index.html'), 'utf8');
  }, 60000);

  it('contains manifest, favicon and both PNG icons', () => {
    for (const f of ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png']) expect(existsSync(file(f)), f).toBe(true);
    expect(pngSize(file('icon-192.png'))).toEqual([192, 192]);
    expect(pngSize(file('icon-512.png'))).toEqual([512, 512]);
  });

  it('has a valid manifest with relative icon paths', () => {
    const m = JSON.parse(readFileSync(file('manifest.webmanifest'), 'utf8'));
    expect(m.name).toBe('Merge Garden');
    expect(m.short_name).toBe('Merge Garden');
    expect(m.display).toBe('standalone');
    expect(m.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    const sizes = m.icons.map((i: { sizes: string }) => i.sizes).sort();
    expect(sizes).toEqual(['192x192', '512x512']);
    for (const i of m.icons) {
      expect(i.src.startsWith('/')).toBe(false);
      expect(existsSync(file(i.src))).toBe(true);
    }
  });

  it('index.html links favicon, icons, manifest and theme-color with the base', () => {
    expect(html).toContain(`href="${prefix || './'}manifest.webmanifest"`);
    expect(html).toContain(`href="${prefix || './'}icon.svg"`);
    expect(html).toContain(`href="${prefix || './'}icon-192.png"`);
    expect(html).toMatch(/<meta name="theme-color" content="#[0-9a-f]{6}"/i);
  });
});
