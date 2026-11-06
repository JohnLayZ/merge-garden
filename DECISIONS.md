# Decisions

- Vite `base` defaults to `./`; CI sets `BASE_PATH` to the repo name for GitHub Pages.
- ESLint (flat config) forbids DOM globals and `Math.random` in `src/game/` to keep logic pure.
- jsdom is not needed for game logic; localStorage persistence takes an injectable storage interface.
- Playwright runs with the pre-installed Chromium at /opt/pw-browsers/chromium when present (config falls back to Playwright's own download elsewhere). Added @playwright/test as devDependency.
- GitHub Pages: workflow builds with BASE_PATH=/<repo-name>/ (vite.config.ts reads it, default './'). Triggered on push to main; Pages source must be set to GitHub Actions once in repo settings (cannot be done from here).
- Watering a plant gives no score and does not count as a merge; it can be undone like a move. Cans beyond the cap of 3 are lost.
- A "double spawn" (2 seeds) happens with 10% probability, otherwise 1 seed.
- Level 7 plants never merge with each other.
- Game is "lost" only if the board is blocked AND no can can upgrade any plant.

## Änderungsrunde 2
- Animationen (Gleiten, Verschmelz-Pop, Spawn) laufen immer. Die `prefers-reduced-motion`-Abfrage wurde entfernt und darf nicht wieder eingebaut werden (Vorgabe des Auftraggebers, steht auch in SPEC.md).
- Sieg beendet das Spiel endgültig (Status `won` ist final): `applyMove`, `useWateringCan` und `undo` geben nach einem Sieg denselben Zustand zurück. Der "Keep playing"-Button entfällt. ~~Undo bleibt nach Game Over möglich~~ — überholt, siehe Änderungsrunde 3.
- Overlay-Fehler: Das Overlay lag optisch/klickbar nicht zuverlässig über dem Feld. Jetzt `z-index: 10` am Overlay, Board mit eigenem Stacking-Kontext (`z-index: 0`), abdunkelnder Hintergrund. Das Overlay zeigt Score und Best; `.overlay .btn` ist von der mobilen `flex: 1`-Regel ausgenommen. Playwright prüft per `elementFromPoint` und echtem Klick (ohne `force`).

## Änderungsrunde 3
- Undo ist nach Game Over gesperrt (wie nach dem Sieg): `undo` gibt bei Status `won` oder `lost` denselben Zustand zurück, der Undo-Button ist deaktiviert. Da der Status persistiert wird, gilt das auch nach Reload.
