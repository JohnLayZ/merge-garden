# Decisions

- Vite `base` defaults to `./`; CI sets `BASE_PATH` to the repo name for GitHub Pages.
- ESLint (flat config) forbids DOM globals and `Math.random` in `src/game/` to keep logic pure.
- jsdom is not needed for game logic; localStorage persistence takes an injectable storage interface.
- Playwright runs with the pre-installed Chromium at /opt/pw-browsers/chromium when present (config falls back to Playwright's own download elsewhere). Added @playwright/test as devDependency.
