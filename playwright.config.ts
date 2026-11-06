import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// In sandboxed environments a pre-installed Chromium may live here; otherwise Playwright's own download is used.
const preinstalled = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: existsSync(preinstalled) ? { executablePath: preinstalled } : {},
  },
  webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true },
});
