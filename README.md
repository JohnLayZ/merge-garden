# Merge Garden 🌱

A calm browser puzzle in the spirit of slide-and-merge games, but with plants instead of numbers.

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
npm run simulate   # dev only: plays 500 games with a simple strategy and prints how long games last
```

For the e2e tests Playwright needs a Chromium; if it is missing run `npx playwright install chromium` once.

## How to play

In the game, the **?** button in the header opens a short guide (all plant stages with their names, controls, goal, game over, undo). It closes with the × button, a click beside the window or Escape. While it is open, swiping and keys are ignored and the play-time timer pauses; it never opens by itself.

- The board is 4×4. Swipe, or use the arrow keys / WASD, to slide all plants in one direction.
- Two equal plants that meet merge into the next stage (each plant merges at most once per move).
  Eleven stages: Seed → Planted Seed → Sprout → Seedling → Sapling → Young Tree → Tree → Blossom Tree → Great Tree → Autumn Tree → Ancient Tree (own SVG artwork in `src/assets/plants/`, growing in size with every stage; from stage 5 on they are all trees, and stages 8–11 follow the seasons: spring, summer, autumn, and the Ancient Tree above them). All level data lives in one list, `LEVELS` in `src/levels.ts`; the last entry is the winning stage.
- If a move changed something, exactly one new plant appears (a Seed 90 % of the time, a Planted Seed 10 %, fading in softly). A move that changes nothing doesn't count.
- Score: merging into stage *n* gives 2ⁿ points.
- You win when the first Ancient Tree (stage 11, the last one) appears and the game ends — no more moves or undo). You lose when the board is full and nothing can merge any more.
- The header shows the play time (m:ss / h:mm:ss). It starts with your first valid move, only counts while the page is visible, stops at win/game over (the overlay shows the final time) and continues after a reload.
- Soft sounds (Web Audio, no files): merging plays a pentatonic note that rises with the plant stage (the top note is always E5), plus short sounds for a win and game over. Use the speaker button in the header to mute; the choice is remembered. Audio starts after your first click/key press.
- *Undo* reverts exactly one step (not after a win or game over). Your game and best score are saved in `localStorage` and survive a reload. A save from an older game version is discarded (a new game starts), the best score is kept.

## Project layout

- `src/game/` – pure game logic (no DOM, randomness only through a seeded RNG), same seed + same moves = same game
- `src/ui/` – rendering, input handling, animations
- `src/assets/` – plant SVGs; `dev/plants.html` – dev-only preview of all levels (open via `npm run dev` at `/dev/plants.html`, not part of the build)
- `src/audio/` – Web Audio sounds (kept out of the game logic)
- `src/storage.ts` – save/load with validation
- `tests/` – vitest unit tests, `e2e/` – Playwright tests
- `SPEC.md`, `TASKS.md`, `DECISIONS.md`, `STATUS.md` – specification and project notes

## Deployment

Pushing to `main` builds and deploys the game to GitHub Pages via `.github/workflows/deploy.yml`
(enable *Settings → Pages → Source: GitHub Actions* once). Once enabled the game is available at
<https://johnlayz.github.io/merge-garden/>
