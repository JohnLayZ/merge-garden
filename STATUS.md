ALL DONE

# Status

## Fertig
- T1–T19 komplett (siehe TASKS.md): Spiellogik (rein, seeded), Rendering, Steuerung (Tasten/WASD/Swipe), Animationen, Gießkanne, Undo, Persistenz, Overlays, responsives Layout, Playwright-Tests, README, GitHub-Pages-Workflow.
- Geprüft: `npm run lint`, `npm test` (61 Tests), `npm run build` und `npm run test:e2e` (3 Tests) sind grün.

## Änderungsrunde 2 (fertig)
- Animationen laufen immer (keine `prefers-reduced-motion`-Abfrage mehr; in SPEC/DECISIONS festgehalten).
- Sieg beendet das Spiel: keine Züge, Gießkanne oder Undo mehr, kein "Keep playing"; gilt auch bei Sieg per Gießkanne. Highscore wird aktualisiert, Overlay bleibt nach Reload.
- Overlay liegt über dem Feld, zeigt Score/Best und nur "New Game"; neuer Playwright-Test (3 e2e-Tests, 54 Unit-Tests).

## Änderungsrunde 3 (fertig)
- Emojis durch eigene SVGs ersetzt (`src/assets/plants/`), Größe wächst streng monoton (`PLANT_SCALE`, Test), gemeinsame Grundlinie, Gießkannen-Icon ebenfalls SVG.
- Dev-Vorschau `dev/plants.html` (nicht im Produktions-Build), Screenshots geprüft (520/360 px, laufendes Spiel); Nachbesserungen in DECISIONS.md.
- Undo nach Game Over gesperrt (Logik, Button, auch nach Reload), Tests und Doku angepasst.
- Stand: lint, 61 Unit-Tests, Build und 3 e2e-Tests grün.

## Änderungsrunde 4 / Paket 3 (fertig)
- Spielzeit im Kopfbereich (m:ss / h:mm:ss): nur aktive Zeit, Start mit dem ersten gültigen Zug, Stopp bei Sieg/Niederlage, mit dem Spielstand gespeichert (`playMs`), Reload läuft weiter, New Game setzt zurück. Reine Logik in `src/game/timer.ts`, Unit-Tests für Pause, Reload, eingefrorene Zeit.
- Sieg-/Game-Over-Overlay zeigen die eingefrorene Spielzeit (auch nach Reload).
- Sounds per Web Audio (`src/audio/sound.ts`): pentatonischer Ton je Pflanzenstufe, Gießkanne, Sieg-Jingle, sanftes Game Over, kein Bewegungsgeräusch; Mute-Schalter im Header (localStorage). SPEC.md angepasst ("kein Sound" entfällt).
- CLAUDE.md: Regeln für Auftragsdokumentation (`docs/auftraege/`) und Release-Ablauf (PR, Merge, Deploy-Prüfung).
- Stand: lint, 80 Unit-Tests, Build und 6 e2e-Tests grün.

## Offen
- Nichts im Backlog.

## Bekannte Hinweise
- GitHub Pages muss einmalig in den Repo-Einstellungen auf "GitHub Actions" als Quelle gestellt werden; der Workflow läuft bei Push auf `main`.
- Wässern kostet weder Punkte noch zählt es als Verschmelzung (siehe DECISIONS.md / README).
