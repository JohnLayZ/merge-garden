// Minimal typings for the few Node APIs used by tests/icons.test.ts (avoids adding @types/node).
declare module 'node:child_process' {
  export function execSync(cmd: string, opts?: { cwd?: string; env?: Record<string, string | undefined>; stdio?: string }): unknown;
}
declare module 'node:fs' {
  export function existsSync(p: string): boolean;
  export function readFileSync(p: string): { subarray(a: number, b: number): { toString(): string }; readUInt32BE(o: number): number };
  export function readFileSync(p: string, enc: 'utf8'): string;
}
declare module 'node:path' {
  export function resolve(...p: string[]): string;
}
declare module 'node:url' {
  export function fileURLToPath(u: URL | string): string;
}
