ALL DONE

# Status

## Fertig
- T1–T19 komplett (siehe TASKS.md): Spiellogik (rein, seeded), Rendering, Steuerung (Tasten/WASD/Swipe), Animationen, Gießkanne, Undo, Persistenz, Overlays, responsives Layout, Playwright-Tests, README, GitHub-Pages-Workflow.
- Geprüft: `npm run lint`, `npm test` (53 Tests), `npm run build` und `npm run test:e2e` (2 Tests) sind grün.

## Offen
- Nichts im Backlog.

## Bekannte Hinweise
- GitHub Pages muss einmalig in den Repo-Einstellungen auf "GitHub Actions" als Quelle gestellt werden; der Workflow läuft bei Push auf `main`.
- Nach Reload mit gewonnenem Spiel erscheint das Sieg-Overlay erneut (Weiterspielen über "Keep playing").
- Wässern kostet weder Punkte noch zählt es als Verschmelzung (siehe DECISIONS.md / README).
