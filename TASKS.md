# Backlog (von oben nach unten abarbeiten)

- [x] T1: Projekt aufsetzen (Vite + TypeScript, vitest, ESLint, Skripte `dev`, `build`, `lint`, `test`, `test:e2e`)
- [x] T2: Typen und Zustandsmodell (`GameState`: Feld, Punkte, Gießkannen, Verschmelzungszähler, Status, Seed)
- [x] T3: Zeilen-Verschmelzung als reine Funktion inkl. Tests (siehe Akzeptanzkriterien)
- [x] T4: Bewegen in 4 Richtungen auf dem 4x4-Feld, ungültige Züge erkennen
- [x] T5: Seeded RNG und Spawn von 1–2 Samen nach gültigem Zug
- [x] T6: Punkte, Sieg- und Niederlagen-Erkennung
- [x] T7: Gießkannen-Logik (Gewinn alle 10 Verschmelzungen, max. 3, Aufwerten)
- [x] T8: Undo (1 Schritt) inkl. Tests
- [x] T9: Rendering des Feldes mit Emojis, Punktestand, Gießkannen-Anzeige
- [x] T10: Steuerung per Pfeiltasten, WASD und Touch-Wischen
- [x] T11: Animationen (Gleiten, Verschmelz-Pop), per CSS
- [x] T12: Gießkanne bedienen per Klick auf Pflanze, Buttons für Undo und Neues Spiel
- [x] T13: Persistenz von Spielstand und Highscore (localStorage), mit Tests
- [x] T14: Sieg- und Game-Over-Overlay
- [x] T15: Responsive Layout (ab 360px)
- [x] T16 (optional): Playwright-Tests (Spiel starten und Zug machen; Reload erhält Spielstand). Falls der Browser-Download in dieser Umgebung nicht klappt: in `DECISIONS.md` vermerken und überspringen.
- [ ] T17: README.md (Start, Tests, Spielregeln)
- [ ] T18: Deployment per GitHub Pages einrichten (GitHub-Actions-Workflow, Vite `base` auf den Repo-Namen setzen, Build läuft in CI), Link-Hinweis in README
- [ ] T19: Abschlussprüfung: lint, Tests und Build grün, `STATUS.md` aktualisieren, `ALL DONE` eintragen

## Ideen (nicht umsetzen, nur sammeln)
