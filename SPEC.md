# Merge-Garten – Spezifikation

Kleines Browser-Puzzle im Stil eines Schiebe-und-Verschmelz-Spiels, aber mit Pflanzen statt Zahlen und eigenen Regeln.

## Tech-Stack
- TypeScript, Vite, keine UI-Frameworks (Vanilla DOM oder Canvas)
- Spiellogik als reine Funktionen in `src/game/` (kein DOM-Zugriff)
- Tests: vitest (Logik), Playwright (2 UI-Tests)
- Keine externen Dienste, alles läuft offline

## Spielregeln
1. Spielfeld 4x4. Jedes Feld ist leer oder enthält eine Pflanze der Stufe 1–9.
2. Stufen: 1 Samen (Seed), 2 Spross (Sprout), 3 Setzling (Seedling), 4 Busch (Bush), 5 Blume (Flower), 6 Junger Baum (Young Tree), 7 Baum (Tree), 8 Alter Baum (Old Tree), 9 Uralter Baum (Ancient Tree). Stufen, Namen, SVGs, Feldfarben und Größen stehen an einer einzigen Stelle als Liste (`LEVELS` in `src/levels.ts`); die Stufenzahl (`MAX_LEVEL`) und damit die Siegstufe ergeben sich aus der Länge dieser Liste, nirgends sonst ist eine Stufenzahl hartkodiert.
3. Ein Zug = Wischen/Pfeiltaste in eine Richtung. Alle Pflanzen gleiten bis zum Rand. Zwei gleiche Pflanzen, die aufeinandertreffen, verschmelzen zur nächsten Stufe (pro Zug höchstens eine Verschmelzung pro Pflanze).
4. Hat sich nach einem Zug etwas verändert, erscheinen 1–2 neue Samen (Stufe 1) auf zufälligen leeren Feldern. Bewegt sich nichts, ist der Zug ungültig und zählt nicht.
5. Punkte: Verschmelzung zur Stufe n gibt 2^n Punkte.
6. Gewonnen: Sobald die letzte Stufe der Liste (Stufe 9, Uralter Baum) entsteht, ist das Spiel gewonnen und beendet. Danach sind keine Züge oder Undo mehr möglich; es gibt kein Weiterspielen. Der Highscore wird dennoch aktualisiert, und nach Reload bleibt der Gewonnen-Zustand samt Overlay erhalten.
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
- F13: Sounds per Web Audio API (`src/audio/sound.ts`, keine Audiodateien, keine externen Quellen): weicher Ton aus einer pentatonischen Tonleiter beim Verschmelzen (höhere Pflanzenstufe = höherer, vollerer Ton), kleiner Jingle beim Sieg, sanfter Ton bei Game Over, kein Geräusch beim bloßen Bewegen. Zentrale Konstante `MASTER_VOLUME`, Limiter (DynamicsCompressor) am Ausgang; angenehme, nicht aufdringliche Lautstärke (bei ca. 40–50 % Handylautstärke gut hörbar), kurze Töne mit weichem Ein- und Ausklingen, nur Sinus/Dreieck. Der Audiokontext startet erst nach der ersten Nutzeraktion. Stumm-Schalter im Kopfbereich, Zustand in localStorage (`merge-garden:muted`).
- F14: Eigenes App-Icon (`public/icon.svg`, PNG 192/512), Favicon, Web-App-Manifest (standalone) und `theme-color`; alle Pfade funktionieren mit der Vite-Basis. Kein Service Worker.

## Akzeptanzkriterien (Beispiele)
- Zeile `[8,8,0,0]` nach links ergibt `[9,0,0,0]` und gewinnt das Spiel; `[7,7,0,0]` ergibt `[8,0,0,0]` und das Spiel läuft weiter
- Zeile `[1,1,0,0]` nach links ergibt `[2,0,0,0]`
- Zeile `[1,1,1,1]` nach links ergibt `[2,2,0,0]`
- Zeile `[2,1,1,0]` nach links ergibt `[2,2,0,0]`, die neue 2 verschmilzt im selben Zug nicht erneut
- Ungültiger Zug verändert Zustand, Punkte und Zugzähler nicht
- Gleicher Seed und gleiche Zugfolge ergeben identischen Spielverlauf
- Ein alter Spielstand (andere Version) wird beim Laden verworfen, der Highscore bleibt
- Ist das Feld voll und keine Verschmelzung mehr möglich, ist das Spiel verloren
- Nach Reload ist Spielstand inkl. Highscore identisch
- Die Spielzeit zählt nur bei sichtbarer Seite, startet mit dem ersten gültigen Zug, ist nach Sieg/Niederlage eingefroren und läuft nach Reload vom gespeicherten Wert weiter

## Design-Vorgaben
- Grafik: eigene, einfache SVG-Grafiken je Pflanzenstufe (1 Samen, 2 Spross, 3 Setzling, 4 Busch, 5 Blume, 6 Junger Baum, 7 Baum, 8 Alter Baum, 9 Uralter Baum) statt Emojis, damit das Spiel auf allen Geräten gleich aussieht. Dateien liegen in `src/assets/plants/` (eigene Dateien im Projekt, keine externen Quellen). Stil: flach, abgerundet, Pastellfüllungen, einheitliche Linienstärke (4) und dunkelgrüne Kontur, kleiner Erdschatten als gemeinsame Grundlinie. Junger Baum: schlanker Stamm mit kleiner, hellerer Krone. Alter Baum: größer und breiter als der Baum, dicker Stamm, dunklere Krone, aber ohne goldene Früchte und Wurzeln (die bleiben dem Uralten Baum vorbehalten).
- Größenverhältnisse: Pflanzen sind im Feld unterschiedlich groß und wachsen mit der Stufe streng monoton: Faktoren (Anteil der Feldgröße) 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.80, 0.88, 0.95 (`scale` in `LEVELS`, als `PLANT_SCALE` in `src/ui/plants.ts` bereitgestellt; per Test auf strikte Monotonie und auf Anzahl = Stufenzahl geprüft). Alle Pflanzen sind horizontal zentriert und stehen auf einer gemeinsamen Grundlinie am Feldboden.
- Farben: helle Pastelltöne (Frühlingsstimmung), Hintergrund cremeweiß, Spielfeld in sanftem Hellgrün, Felder in leicht abgesetzten Pastellflächen; pro Pflanzenstufe ein eigener dezenter Pastellton (`color` in `LEVELS`); gute Lesbarkeit (ausreichender Kontrast bei Text)
- Animationen laufen IMMER, unabhängig von `prefers-reduced-motion` oder System-/Browsereinstellungen; keine Abfrage dieser Einstellung im CSS/JS (bewusste Entscheidung, nicht wieder einbauen)
- Gefühl: ruhig und entspannt; Tiles gleiten sanft (ca. 120–150 ms), Verschmelzen mit dezentem Pop (leichtes Skalieren), keine Partikel, kein Wackeln; Sounds nur leise und dezent (siehe F13)
- Schrift: eine abgerundete, gut lesbare System- oder Web-Safe-Schrift
- Sprache der Oberfläche: Englisch (Titel "Merge Garden", Buttons "New Game", "Undo", Texte "You win!" / "Game over")
- Layout: Spielfeld zentriert und quadratisch, darüber Punkte und Highscore, darunter Buttons; auf dem Handy bildschirmfüllend nutzbar

## Nicht-Ziele
Kein Backend, keine Accounts, keine Mehrspieler-Funktion. ("Kein Sound" entfällt seit Paket 3, siehe F13.)
