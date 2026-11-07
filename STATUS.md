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

## Änderungsrunde 5 / Paket 4 (fertig)
- Sounds lauter: `MASTER_VOLUME` 0,12 → 0,30 (2,5×), Limiter (DynamicsCompressor) am Ausgang, Merge-Gain nach Stufe angeglichen (1,0 → 0,74), Verhältnisse der Sounds unverändert. Tests für Gains ≤ 1, Master/Limiter-Routing und Stumm-Schalter. Werte in DECISIONS.md.
- CLAUDE.md: Branch-Löschung per GitHub-Werkzeug. README: echte Spiel-Adresse.
- Icon (SVG + PNG 192/512, Erzeugung in `dev/make-icons.mjs`), Favicon, Manifest, theme-color; Test prüft `dist/`.
- Stand: lint, Unit-Tests, Build grün.

## Änderungsrunde 6 / Paket 5 (fertig)
- Gießkanne vollständig entfernt (Logik, Zustand, UI, Sound, `drop.svg`, Tests, Doku). Verloren = Feld voll und keine Verschmelzung mehr möglich. Undo bleibt (ein Schritt, nach Sieg/Game Over gesperrt).
- Spielstand trägt eine Version (`SAVE_VERSION = 2`): alter Stand wird verworfen (neues Spiel), Highscore bleibt; Test dafür.
- 9 Stufen (Seed, Sprout, Seedling, Bush, Flower, Young Tree, Tree, Old Tree, Ancient Tree) in einer zentralen Liste `src/levels.ts` (Namen, SVGs, Feldfarben, Größen); Sieg bei der letzten Stufe der Liste. Neue SVGs Young Tree und Old Tree.
- Optik geprüft (520/360 px, laufendes Spiel) und nachgebessert (siehe DECISIONS.md).
- `npm run simulate` (nur Dev): 500 Partien mit einfacher Strategie. Sieg in 12 von 500, Ende im Mittel nach 220 Zügen (Median 204); Stufe 7 nach 99/98, Stufe 8 nach 176/176 (Mittel/Median).
- Sounds für 9 Stufen aus der Stufenliste abgeleitet (Gain 1,0 → 0,6, keine Obertöne über C6), Test.
- CLAUDE.md: Branch nach dem Merge nicht selbst löschen.
- Stand: lint, 90 Unit-Tests, Build und 6 e2e-Tests grün.

## Änderungsrunde 7 / Paket 6 (fertig)
- "?"-Button im Kopfbereich öffnet die Anleitung (Overlay, Stufenreihe aus `LEVELS`/`PLANT_SCALE`, fünf Punkte); Schließen per Button/Klick daneben/Escape; Eingaben ignoriert und Timer pausiert, solange offen. Unit- und Playwright-Test.
- Spawn blendet sanft ein (180 ms, ab Skalierung 0,8); Merge-Pop 150 → 200 ms, 1,12 → 1,14; Sieg-/Game-Over-Overlay blenden in 250 ms ein. Alle Werte in `src/ui/motion.ts`.
- CLAUDE.md: Deploy-Wartezeit ohne Hintergrund-Überwachung.
- Stand: lint, 95 Unit-Tests, Build und 7 e2e-Tests grün.

## Offen
- Nichts im Backlog.

## Bekannte Hinweise
- GitHub Pages muss einmalig in den Repo-Einstellungen auf "GitHub Actions" als Quelle gestellt werden; der Workflow läuft bei Push auf `main`.
- Die Gießkanne gibt es seit Paket 5 nicht mehr; Spielstände von vor Paket 5 werden beim Laden verworfen.
