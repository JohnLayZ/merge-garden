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
- Plant graphics are own SVG files in `src/assets/plants/` (one per level, viewBox 0 0 100 100, stroke 4, pastel fills, soil ellipse as shared baseline), imported with Vite `?raw` and inlined, so no network requests and identical rendering on every device. The watering-can icon is an SVG too (`src/assets/drop.svg`).
- Size factors live in `PLANT_SCALE` (`src/ui/plants.ts`): 0.30, 0.40, 0.52, 0.64, 0.76, 0.86, 0.95 of the cell; a test asserts they are strictly increasing. Tiles align plants bottom-centre (common baseline).
- Dev preview: `dev/plants.html` (+ `dev/plants.ts`) shows all seven levels in real cell size with the game's own CSS. Open it with `npm run dev` at `/dev/plants.html`. It is not part of the production build (Vite only builds `index.html`; checked that `dist/` has no preview page). It is type-checked and linted.
- Visual self-review (screenshots at 520 px and 360 px, plus the running game at 360 px). Fixes made:
  - Seed and Sprout drawings filled too little of their viewBox and looked tiny at 30%/40%; scaled the artwork up inside the viewBox (about the baseline) so they stay readable while keeping the factors.
  - Ancient Tree looked too similar to the Tree: darker teal canopy, layered lower canopy line, golden fruits, thick trunk with roots and a knot hole, wider ground shadow.
  - Checked nothing is clipped (SVG `overflow: visible`, tile padding 4%/3%) and that plants read well on all pastel tile colours; no colour changes needed there.
  - Replaced the 💧 emoji on the Watering Can button with an SVG for consistency across devices.

## Änderungsrunde 4 (Paket 3: Spielzeit, Sounds)
- Play time is part of the saved game as `GameState.playMs` (not part of the undo snapshot, so undo never rewinds time). Old saves without it load as 0. Pure logic in `src/game/timer.ts` (`TimerState`, `resumeTimer`, `pauseTimer`, `elapsedAt`, `shouldRun`, `formatTime`); every function takes the clock as a parameter. `main.ts` feeds it `performance.now()`, so wall-clock changes or the gap between two page loads never count.
- The timer runs only while `shouldRun`: first valid move happened (`moves > 0`), status `playing`, page visible. On `visibilitychange` and `pagehide` the time is summed up and saved; while running it is saved about every 5 s as a crash safety net. After a win/loss the stored value is final, so the overlay time stays frozen across reloads.
- Header got a third box "Time"; the overlay shows an extra line "Time: m:ss". Points 1 and 2 of the order share one commit because both touch the same view/state code.
- E2E adjustments (no test weakened): the page now saves on `pagehide`, which overwrote localStorage seeded via `page.evaluate` before a reload, so win tests seed the position with `addInitScript` before the app loads. The "reload keeps the game state" test ignores the `playMs` digits in the raw storage string, because the time legitimately advances between the two snapshots.
- Sounds: own module `src/audio/sound.ts` (Web Audio, no files, no dependency); game logic is untouched. Context is created lazily by `unlock()` on the first pointerdown/keydown/touchstart. Volume: master gain 0.12, only sine/triangle, 25 ms attack, exponential decay. Merge notes: C major pentatonic C4 D4 E4 G4 A4 C5 for resulting levels 2–7 (the tone of a multi-merge move follows the highest new level); level >= 4 adds an octave overtone, level >= 6 a fifth. Decision: no sound for plain moves ("gar keines"), as it would repeat constantly. Water: two soft rising notes; win: short arpeggio C5–E5–G5–C6 plus a chord; game over: two gently falling triangle notes (F4 → D4, not minor/heavy). End of game replaces the merge/water sound.
- Mute button in the header (inline SVG icons, `aria-pressed`), state in `localStorage` key `merge-garden:muted`. Default is sound on. Audio or storage failures are swallowed so the game never breaks.
- SPEC.md: the non-goal "kein Sound" was dropped and the animation/feel line updated.
- Release flow and order documentation are now rules in CLAUDE.md.

## Änderungsrunde 5 (Paket 4: Lautstärke, Icon, Branch-Löschung)
- **Lautstärke (Sounds waren am Handy zu leise, Tester brauchte ~75 % Gerätelautstärke):** Es gibt jetzt eine zentrale Konstante `MASTER_VOLUME` in `src/audio/sound.ts`. Jede Tonspitze ist `relativer Gain × MASTER_VOLUME`; alle relativen Gains stehen in `GAINS` und sind ≤ 1 (per Test geprüft). `MASTER_VOLUME` wurde von 0,12 auf **0,30** angehoben (Faktor 2,5, Ziel war 2–3×).
- Zusätzlich läuft alles über einen `DynamicsCompressor` als Begrenzer am Ausgang (threshold −12 dB, knee 6, ratio 12, attack 3 ms, release 250 ms), damit überlagerte Töne (Sieg-Akkord, Merge mit Obertönen) nicht übersteuern oder knacken. Statt die Einzelwerte weiter anzuheben, ist der Pegel so über einen Wert nachjustierbar.
- Verhältnis der Sounds zueinander bleibt wie bisher (Merge 1, Gießkanne 0,8/0,7, Sieg 0,9/0,5, Game Over 0,7; Obertöne 0,35/0,3). Wellenformen, Tonhöhen, Dauer und Ein-/Ausklingen unverändert, also nichts schärfer oder schriller.
- Wahrnehmung beim Verschmelzen: höhere Töne wirken bei gleichem Pegel lauter (Gehör, Obertöne). Deshalb wird der Merge-Gain nach Stufe leicht abgesenkt: Stufe 2: 1,00; 3: 0,97; 4: 0,90; 5: 0,85; 6: 0,80; 7: 0,74 (Obertöne skalieren mit). Vorher waren alle Stufen 1,0.
- Spitzenwerte (Gain am Oszillator, vorher → nachher): Merge Stufe 2 0,120 → 0,300; Stufe 4 0,120 → 0,270; Stufe 7 0,120 → 0,222; Gießkanne 0,096/0,084 → 0,240/0,210; Sieg-Arpeggio 0,108 → 0,270, Sieg-Akkord 0,060 → 0,150 je Ton; Game Over 0,084 → 0,210.
- Der bestehende Test "Spitze ≤ 0,2" wurde nicht gelöscht, sondern auf die neue Obergrenze `MASTER_VOLUME` umgestellt (die Obergrenze ist jetzt die zentrale Konstante). Neu: Gains ≤ 1, alle Tonknoten laufen über den Begrenzer, Stumm-Schalter schaltet alle vier Sounds ab.
