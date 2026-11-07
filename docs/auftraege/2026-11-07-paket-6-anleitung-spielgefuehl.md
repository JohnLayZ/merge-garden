Auftrag: Paket 6 – Anleitung und Spielgefühl
Datum: 2026-11-07
Status: ausgeführt (Pull Request nach main, siehe Abschlusstext)
Auftrag (Wortlaut)

Arbeite vom aktuellen Stand von main aus: Hole zuerst den neuesten Stand (git fetch) und lege deinen Arbeitsbranch auf Basis von origin/main an.

Lies CLAUDE.md, SPEC.md, DECISIONS.md, STATUS.md und README.md. Arbeite selbständig ohne Rückfragen, ein Commit pro Punkt, mit Tests wo sinnvoll. Am Ende müssen lint, Tests und Build grün sein. Befolge die Regeln aus CLAUDE.md (Release-Ablauf und Dokumentation der Aufträge). Aktualisiere SPEC.md (Features und Design-Vorgaben), trage Entscheidungen in DECISIONS.md ein und aktualisiere STATUS.md. Die Animationen laufen weiterhin immer, unabhängig von prefers-reduced-motion (siehe DECISIONS.md).

1. Anleitung: Ergänze im Kopfbereich neben dem Stumm-Schalter einen Button "?" (Beschriftung für Screenreader: "How to play"). Er öffnet ein Overlay mit einer kurzen Anleitung auf Englisch, höchstens fünf kurze Punkte: Steuerung (Wischen, Pfeiltasten, WASD), gleiche Pflanzen verschmelzen zur nächsten Stufe, nach jedem gültigen Zug erscheinen neue Samen, Ziel (Ancient Tree entsteht = Sieg), Ende (Game Over, wenn nichts mehr geht; Undo nimmt genau einen Zug zurück und ist nach Sieg und Game Over gesperrt). Zeige oben im Overlay alle Stufen nebeneinander mit ihren Namen, aus der zentralen Stufenliste (src/levels.ts) gelesen (nicht hartkodiert, damit spätere Stufen automatisch erscheinen), mit den vorhandenen SVGs in den Größenverhältnissen aus PLANT_SCALE. Bei 9 Stufen darf die Reihe in zwei Zeilen umbrechen. Das Overlay muss über allem liegen (beachte die z-index-Erfahrung aus Paket 1), sich per Schließen-Button, Klick neben das Fenster und Escape schließen lassen und auf 360 px Breite ohne Scrollen des Spielfelds nutzbar sein. Solange es offen ist, werden Wischen und Tastatureingaben für das Spiel ignoriert, und der Spielzeit-Timer pausiert. Beim Schließen läuft er weiter. Das Overlay erscheint nicht automatisch beim ersten Besuch, nur über den Button. Ergänze Tests: Unit-Test, dass die Anleitung im geöffneten Zustand keine Züge zulässt und den Timer pausiert, und einen Playwright-Test (öffnen, mit Escape schließen, Button klickbar). Passe README ("How to play") und SPEC.md an.

2. Neue Samen sanft einblenden: Neu gespawnte Samen erscheinen mit einem kurzen Einblenden und leichtem Hochskalieren (etwa 150 bis 200 ms), nur die neu gespawnten Pflanzen, nicht die übrigen. Das darf Eingaben nicht verzögern: Der nächste Zug ist sofort möglich. Lege Dauer und Skalierung als Konstanten an.

3. Verschmelz-Pop feinjustieren: Nenne in DECISIONS.md die bisherigen Werte (Dauer und maximale Skalierung). Der Pop soll weiterhin ruhig, aber etwas besser sichtbar werden, Skalierung grob auf 1,12 bis 1,15 und Dauer etwa 180 bis 220 ms. Keine Partikel und kein Wackeln (siehe SPEC.md). Die Werte stehen als Konstanten an einer Stelle, damit man sie später mit einem Wert nachjustieren kann.

4. Sieg- und Game-Over-Overlay sanfter: Beide blenden in etwa 250 ms ein, statt abrupt zu erscheinen. Der Button "New Game" muss sofort klickbar sein, sobald das Overlay sichtbar ist. Die bestehenden Playwright-Tests dürfen nicht wackelig werden (kein force-Klick, keine festen Wartezeiten).

5. Deploy-Wartezeit schlanker machen: Halte in CLAUDE.md fest, dass du nach dem Merge den Deploy-Status ohne Hintergrund-Überwachungen abwartest (also nicht mit Monitor oder ähnlichen Hintergrundjobs). Frage den Status mit höchstens einer kurzen Schleife aus wenigen Abfragen im Abstand von jeweils etwa 30 Sekunden ab, bis der Lauf abgeschlossen ist oder zehn Minuten vergangen sind. Der Abschlusstext wird nur einmal geschrieben.

Reihenfolge am Ende: Führe zuerst die Punkte 1 bis 5 aus, lege dann die Auftragsdatei in docs/auftraege/ an (Dateiname mit heutigem Datum und fortlaufender Nummer, hier Paket 6, z. B. 2026-11-07-paket-6-anleitung-spielgefuehl.md), und führe den Release-Ablauf ganz zuletzt aus, damit die Datei im selben Pull Request landet. Der Abschlusstext soll in der ersten Zeile sagen, ob der Merge geklappt hat und ob die neue Version online ist, und die alten und neuen Animationswerte nennen.

Ergebnis

Umgesetzt:
1. "?"-Button (aria-label "How to play") im Kopfbereich öffnet das Anleitungs-Overlay (fixed, z-index 100): fünf englische Punkte, darüber alle Stufen mit Namen aus `LEVELS` und Größen aus `PLANT_SCALE` (zwei Zeilen bei 9 Stufen). Schließen per ×, Klick daneben, Escape. Solange offen: Eingaben ignoriert, Timer pausiert (`shouldRun(..., helpOpen)`, `inputEnabled`). Unit-Tests und Playwright-Test; auf 360 px per Screenshot geprüft (kein Scrollen, Dialog passt komplett). README und SPEC (F15) angepasst.
2. Spawn-Einblenden: 150 ms ab Skalierung 0,6 → 180 ms ab 0,8, nur für neue Samen, blockiert keine Eingaben.
3. Merge-Pop: 150 ms / max. 1,12 → 200 ms / max. 1,14. Alle Werte in `src/ui/motion.ts`.
4. Sieg-/Game-Over-Overlay blenden in 250 ms ein, Button sofort klickbar; bestehende e2e-Tests unverändert grün (kein force, keine Wartezeiten).
5. CLAUDE.md: Deploy-Wartezeit ohne Hintergrund-Überwachung, kurze Abfrageschleife (~30 s, max. 10 Minuten), Abschlusstext nur einmal.

Bewusst anders gelöst: Die Punkte 2 bis 4 liegen in einem gemeinsamen Commit, weil sie dieselbe Konstantendatei und dasselbe Stylesheet betreffen. Im Kopfbereich wurden Titel und Icon-Buttons auf 360 px etwas verkleinert, damit der neue Button hineinpasst. Ein Spawn-Einblenden gab es schon (mit anderen Werten), es wurde angepasst statt neu gebaut.

Offene Punkte: keine.
