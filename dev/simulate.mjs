// Runs dev/simulate.ts through Vite's SSR loader (handles the ?raw SVG imports); no extra dependency.
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  await server.ssrLoadModule('/dev/simulate.ts');
} finally {
  await server.close();
}
