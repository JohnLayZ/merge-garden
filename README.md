# Merge Garden 🌱

A calm browser puzzle in the spirit of slide-and-merge games, but with plants instead of numbers and a twist: the **Watering Can**.

Built with TypeScript and Vite (no UI framework). Everything runs offline in the browser.

## Quick start

```bash
npm install
npm run dev        # development server
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## Scripts and tests

```bash
npm run lint       # ESLint (also guards the purity of src/game)
npm test           # vitest unit tests for the game logic and storage
npm run test:e2e   # Playwright UI tests (builds and serves the app itself)
```

For the e2e tests Playwright needs a Chromium; if it is missing run `npx playwright install chromium` once.

## How to play

- The board is 4×4. Swipe, or use the arrow keys / WASD, to slide all plants in one direction.
- Two equal plants that meet merge into the next stage (each plant merges at most once per move).
  Stages: 🌰 Seed → 🌱 Sprout → 🌿 Seedling → 🪴 Bush → 🌷 Flower → 🌳 Tree → 🌲 Ancient Tree.
- If a move changed something, 1–2 new seeds appear. A move that changes nothing doesn't count.
- **Watering Can:** every 10 merges you earn one can (max 3). Press *Watering Can*, then click a plant to grow it one stage — it costs no move. Ancient Trees can't be watered (the can is kept).
- Score: merging into stage *n* gives 2ⁿ points.
- You win when the first Ancient Tree appears and the game ends — no more moves, cans or undo (also when the tree is grown with the Watering Can). You lose when the board is full, nothing can merge and no can can help.
- *Undo* reverts exactly one step (not after a win). Your game and best score are saved in `localStorage` and survive a reload.

## Project layout

- `src/game/` – pure game logic (no DOM, randomness only through a seeded RNG), same seed + same moves = same game
- `src/ui/` – rendering, input handling, animations
- `src/storage.ts` – save/load with validation
- `tests/` – vitest unit tests, `e2e/` – Playwright tests
- `SPEC.md`, `TASKS.md`, `DECISIONS.md`, `STATUS.md` – specification and project notes

## Deployment

Pushing to `main` builds and deploys the game to GitHub Pages via `.github/workflows/deploy.yml`
(enable *Settings → Pages → Source: GitHub Actions* once). Once enabled the game is available at
`https://<owner>.github.io/merge-garden/`.
