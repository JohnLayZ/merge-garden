ALL DONE

# Status

## Fertig
- T1–T19 komplett (siehe TASKS.md): Spiellogik (rein, seeded), Rendering, Steuerung (Tasten/WASD/Swipe), Animationen, Gießkanne, Undo, Persistenz, Overlays, responsives Layout, Playwright-Tests, README, GitHub-Pages-Workflow.
- Geprüft: `npm run lint`, `npm test` (54 Tests), `npm run build` und `npm run test:e2e` (3 Tests) sind grün.

## Änderungsrunde 2 (fertig)
- Animationen laufen immer (keine `prefers-reduced-motion`-Abfrage mehr; in SPEC/DECISIONS festgehalten).
- Sieg beendet das Spiel: keine Züge, Gießkanne oder Undo mehr, kein "Keep playing"; gilt auch bei Sieg per Gießkanne. Highscore wird aktualisiert, Overlay bleibt nach Reload.
- Overlay liegt über dem Feld, zeigt Score/Best und nur "New Game"; neuer Playwright-Test (3 e2e-Tests, 54 Unit-Tests).

## Offen
- Nichts im Backlog.

## Bekannte Hinweise
- GitHub Pages muss einmalig in den Repo-Einstellungen auf "GitHub Actions" als Quelle gestellt werden; der Workflow läuft bei Push auf `main`.
- Wässern kostet weder Punkte noch zählt es als Verschmelzung (siehe DECISIONS.md / README).
