# Merge-Garten – Spezifikation

Kleines Browser-Puzzle im Stil eines Schiebe-und-Verschmelz-Spiels, aber mit Pflanzen statt Zahlen und eigenen Regeln.

## Tech-Stack
- TypeScript, Vite, keine UI-Frameworks (Vanilla DOM oder Canvas)
- Spiellogik als reine Funktionen in `src/game/` (kein DOM-Zugriff)
- Tests: vitest (Logik), Playwright (2 UI-Tests)
- Keine externen Dienste, alles läuft offline

## Spielregeln
1. Spielfeld 4x4. Jedes Feld ist leer oder enthält eine Pflanze der Stufe 1–11.
2. Stufen: 1 Seed, 2 Planted Seed, 3 Sprout, 4 Seedling, 5 Sapling, 6 Young Tree, 7 Tree, 8 Blossom Tree, 9 Great Tree, 10 Autumn Tree, 11 Ancient Tree. Ab Stufe 5 sind alle Stufen Bäume; die Stufen 8 bis 11 folgen den Jahreszeiten (Blossom Tree = Frühling, Great Tree = Sommer, Autumn Tree = Herbst, Ancient Tree steht über den Jahreszeiten). Stufen, Namen, SVGs, Feldfarben und Größen stehen an einer einzigen Stelle als Liste (`LEVELS` in `src/levels.ts`); die Stufenzahl (`MAX_LEVEL`) und damit die Siegstufe ergeben sich aus der Länge dieser Liste, nirgends sonst ist eine Stufenzahl hartkodiert.
3. Ein Zug = Wischen/Pfeiltaste in eine Richtung. Alle Pflanzen gleiten bis zum Rand. Zwei gleiche Pflanzen, die aufeinandertreffen, verschmelzen zur nächsten Stufe (pro Zug höchstens eine Verschmelzung pro Pflanze).
4. Hat sich nach einem Zug etwas verändert, erscheint genau eine neue Pflanze auf einem zufällig gewählten leeren Feld (wie im Original 2048): mit 90 % ein Seed (Stufe 1), mit 10 % ein Planted Seed (Stufe 2; Konstante `SPAWN_PLANTED_SEED_CHANCE` in `src/game/spawn.ts`, Zufall nur über den seedbaren Generator). Es gibt keinen Doppelspawn. Spawns geben keine Punkte. Bewegt sich nichts, ist der Zug ungültig und zählt nicht. Ein neues Spiel startet mit zwei Pflanzen nach derselben Regel.
5. Punkte: Verschmelzung zur Stufe n gibt 2^n Punkte.
6. Gewonnen: Sobald die letzte Stufe der Liste (Stufe 11, Ancient Tree) entsteht, ist das Spiel gewonnen und beendet. Danach sind keine Züge oder Undo mehr möglich; es gibt kein Weiterspielen. Der Highscore wird dennoch aktualisiert, und nach Reload bleibt der Gewonnen-Zustand samt Overlay erhalten.
7. Verloren: Feld voll und keine Verschmelzung mehr möglich.

## Features
- F1: Spiellogik (Bewegen, Verschmelzen, Spawnen, Sieg/Niederlage), deterministisch testbar per Seed
- F2: Steuerung per Pfeiltasten, WASD und Touch-Wischen
- F3: Rendering mit Emojis je Stufe, einfache Animationen (Gleiten, Verschmelz-Pop)
- F4: Punktestand und Highscore (localStorage)
- F5: Undo (genau 1 Schritt zurück); nach Sieg und nach Game Over nicht mehr möglich (Button deaktiviert), auch nicht nach Reload
- F6: (entfallen in Paket 5, die Gießkanne ist keine Spielregel mehr)
- F7: Neues Spiel, Spielstand bleibt nach Seiten-Reload erhalten. Der Spielstand trägt eine Version (`SAVE_VERSION` in `src/storage.ts`); ein Spielstand einer anderen Version wird beim Laden verworfen (neues Spiel), der Highscore bleibt erhalten.
- F8: Sieg- und Game-Over-Overlay: liegt über allem (inkl. Spielfeld), dunkelt das Feld ab, zeigt Text ("You win!" / "Game over"), Punktestand, Highscore, Spielzeit und ausschließlich den Button "New Game"; bedienbar (Playwright-Test prüft das)
- F9: Responsive (Handy-Breite ab 360px nutzbar)
- F10: README mit Start- und Testanleitung
- F11: Spielzeit-Anzeige im Kopfbereich (Format m:ss, ab einer Stunde h:mm:ss). Der Timer startet mit dem ersten gültigen Zug und stoppt bei Sieg und Niederlage. Es zählt nur aktive Spielzeit (Seite sichtbar); die aktive Zeit wird aufsummiert und mit dem Spielstand gespeichert (`playMs`), nach Reload läuft der Timer ab dem gespeicherten Wert weiter, "New Game" setzt ihn zurück. Zeitlogik als reine Funktionen mit übergebener Uhr (`src/game/timer.ts`).
- F12: Sieg- und Game-Over-Overlay zeigen zusätzlich die Spielzeit bis zum Ende ("Time: m:ss"); sie bleibt eingefroren, auch nach Reload.
- F13: Sounds per Web Audio API (`src/audio/sound.ts`, keine Audiodateien, keine externen Quellen): weicher Ton aus einer pentatonischen Tonleiter beim Verschmelzen (höhere Pflanzenstufe = höherer, vollerer Ton; Tonfolge und Gain-Kurve werden aus der Stufenliste abgeleitet und gelten für alle Stufen; die Tonleiter ist oben verankert: die letzte Stufe spielt immer E5, niedrigere Stufen liegen tiefer, bei 11 Stufen beginnt sie bei G3; der Gain sinkt gleichmäßig von 1,0 auf 0,6), kleiner Jingle beim Sieg, sanfter Ton bei Game Over, kein Geräusch beim bloßen Bewegen. Zentrale Konstante `MASTER_VOLUME`, Limiter (DynamicsCompressor) am Ausgang; angenehme, nicht aufdringliche Lautstärke (bei ca. 40–50 % Handylautstärke gut hörbar), kurze Töne mit weichem Ein- und Ausklingen, nur Sinus/Dreieck. Der Audiokontext startet erst nach der ersten Nutzeraktion. Stumm-Schalter im Kopfbereich, Zustand in localStorage (`merge-garden:muted`).
- F15: Anleitung: Button "?" (Screenreader-Label "How to play") im Kopfbereich neben dem Stumm-Schalter öffnet ein Overlay (`position: fixed`, z-index 100, über allem) mit englischer Kurzanleitung (fünf Punkte: Steuerung, Verschmelzen, neue Samen, Ziel, Game over/Undo). Oben zeigt es alle Stufen nebeneinander (umbrechend) mit Namen, aus `LEVELS` gelesen (nicht hartkodiert) und mit den vorhandenen SVGs in den Größen von `PLANT_SCALE`. Schließen per Button, Klick neben das Fenster und Escape; auf 360 px ohne Scrollen nutzbar. Solange offen: Wischen/Tasten werden ignoriert, der Spielzeit-Timer pausiert (läuft beim Schließen weiter). Erscheint nie automatisch.
- F14: Eigenes App-Icon (`public/icon.svg`, PNG 192/512), Favicon, Web-App-Manifest (standalone) und `theme-color`; alle Pfade funktionieren mit der Vite-Basis. Kein Service Worker.

## Akzeptanzkriterien (Beispiele)
- Zeile `[10,10,0,0]` nach links ergibt `[11,0,0,0]` und gewinnt das Spiel; `[9,9,0,0]` ergibt `[10,0,0,0]` und das Spiel läuft weiter
- Zeile `[1,1,0,0]` nach links ergibt `[2,0,0,0]`
- Zeile `[1,1,1,1]` nach links ergibt `[2,2,0,0]`
- Zeile `[2,1,1,0]` nach links ergibt `[2,2,0,0]`, die neue 2 verschmilzt im selben Zug nicht erneut
- Ungültiger Zug verändert Zustand, Punkte und Zugzähler nicht und erzeugt keine Pflanze
- Nach jedem gültigen Zug liegt genau eine Pflanze mehr auf dem Feld als nach dem reinen Schieben und Verschmelzen; über viele Züge sind ca. 90 % der neuen Pflanzen Seeds und ca. 10 % Planted Seeds
- Undo nach einem Zug mit Planted-Seed-Spawn stellt den vorherigen Zustand samt Zufallszustand exakt wieder her; derselbe Zug danach führt zum selben Ergebnis
- Gleicher Seed und gleiche Zugfolge ergeben identischen Spielverlauf
- Ein alter Spielstand (andere Version) wird beim Laden verworfen, der Highscore bleibt
- Ist das Feld voll und keine Verschmelzung mehr möglich, ist das Spiel verloren
- Nach Reload ist Spielstand inkl. Highscore identisch
- Die Spielzeit zählt nur bei sichtbarer Seite, startet mit dem ersten gültigen Zug, ist nach Sieg/Niederlage eingefroren und läuft nach Reload vom gespeicherten Wert weiter

## Design-Vorgaben
- Grafik: eigene, einfache SVG-Grafiken je Pflanzenstufe (11 Stufen, siehe Spielregel 2) statt Emojis, damit das Spiel auf allen Geräten gleich aussieht. Dateien liegen in `src/assets/plants/` (`01-seed.svg` bis `11-ancient-tree.svg`, eigene Dateien im Projekt, keine externen Quellen). Stil: flach, abgerundet, Pastellfüllungen, einheitliche Linienstärke (4) und dunkelgrüne Kontur, kleiner Erdschatten als gemeinsame Grundlinie, gleiche viewBox 0 0 100 100. Seed: kleiner loser Samen; Planted Seed: Samen halb im braunen Erdhügel; Sprout: erster Trieb mit zwei Blättchen; Seedling: kleine Pflanze mit mehreren Blättern; Sapling: dünner Stamm, wenige Blätter, keine Krone; Young Tree: kleine hellgrüne Wolkenkrone; Tree: volle mittelgrüne Krone; Blossom Tree: Tree mit rosa Blüten; Great Tree: breite dunkelgrüne Krone, kräftiger Stamm; Autumn Tree: Form des Great Tree mit dickerem Stamm, Krone in Gelb/Orange/Rotorange (weiche Flecken), fallende Blätter; Ancient Tree: gewaltiger Stamm mit weit ausladenden Wurzeln, riesige tiefgrüne Krone mit goldenen Früchten.
- Größenverhältnisse: Pflanzen sind im Feld unterschiedlich groß und wachsen mit der Stufe streng monoton: Faktoren (Anteil der Feldgröße) 0.30, 0.37, 0.39, 0.51, 0.58, 0.65, 0.72, 0.79, 0.85, 0.90, 0.95 (`scale` in `LEVELS`, als `PLANT_SCALE` in `src/ui/plants.ts` bereitgestellt; per Test auf strikte Monotonie und auf Anzahl = Stufenzahl geprüft). Alle Pflanzen sind horizontal zentriert und stehen auf einer gemeinsamen Grundlinie am Feldboden.
- Farben: helle Pastelltöne (Frühlingsstimmung), Hintergrund cremeweiß, Spielfeld in sanftem Hellgrün, Felder in leicht abgesetzten Pastellflächen; pro Pflanzenstufe eine eigene Kachelfarbe (`color` in `LEVELS`): Seed #f1e4d3, Planted Seed #ead3bd, Sprout #e3f3c9, Seedling #cdeccb, Sapling #c8e6e0, Young Tree #f6efc6, Tree #d8eab6, Blossom Tree #f9d6e2, Great Tree #d6dff3, Autumn Tree #fbe0b8, Ancient Tree #f3dd8e (warmes Goldgelb, hebt die höchste Stufe hervor); gute Lesbarkeit (ausreichender Kontrast bei Text)
- Animationen laufen IMMER, unabhängig von `prefers-reduced-motion` oder System-/Browsereinstellungen; keine Abfrage dieser Einstellung im CSS/JS (bewusste Entscheidung, nicht wieder einbauen)
- Gefühl: ruhig und entspannt; Tiles gleiten sanft (ca. 120–150 ms), Verschmelzen mit dezentem, aber sichtbarem Pop (Skalierung ca. 1,12–1,15, Dauer ca. 180–220 ms), neue Samen blenden in ca. 150–200 ms ein und skalieren leicht hoch (nur die neuen, ohne Eingaben zu verzögern), Sieg-/Game-Over-Overlay blenden in ca. 250 ms ein (Button sofort klickbar); keine Partikel, kein Wackeln; alle Werte als Konstanten in `src/ui/motion.ts`; Sounds nur leise und dezent (siehe F13)
- Schrift: eine abgerundete, gut lesbare System- oder Web-Safe-Schrift
- Sprache der Oberfläche: Englisch (Titel "Merge Garden", Buttons "New Game", "Undo", Texte "You win!" / "Game over")
- Layout: Spielfeld zentriert und quadratisch, darüber Punkte und Highscore, darunter Buttons; auf dem Handy bildschirmfüllend nutzbar

## Nicht-Ziele
Kein Backend, keine Accounts, keine Mehrspieler-Funktion. ("Kein Sound" entfällt seit Paket 3, siehe F13.)
