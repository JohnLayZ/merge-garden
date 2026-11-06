# Merge-Garten – Spezifikation

Kleines Browser-Puzzle im Stil eines Schiebe-und-Verschmelz-Spiels, aber mit Pflanzen statt Zahlen und eigenen Regeln.

## Tech-Stack
- TypeScript, Vite, keine UI-Frameworks (Vanilla DOM oder Canvas)
- Spiellogik als reine Funktionen in `src/game/` (kein DOM-Zugriff)
- Tests: vitest (Logik), Playwright (2 UI-Tests)
- Keine externen Dienste, alles läuft offline

## Spielregeln
1. Spielfeld 4x4. Jedes Feld ist leer oder enthält eine Pflanze der Stufe 1–7.
2. Stufen: 1 Samen, 2 Spross, 3 Setzling, 4 Busch, 5 Blume, 6 Baum, 7 Uralter Baum.
3. Ein Zug = Wischen/Pfeiltaste in eine Richtung. Alle Pflanzen gleiten bis zum Rand. Zwei gleiche Pflanzen, die aufeinandertreffen, verschmelzen zur nächsten Stufe (pro Zug höchstens eine Verschmelzung pro Pflanze).
4. Hat sich nach einem Zug etwas verändert, erscheinen 1–2 neue Samen (Stufe 1) auf zufälligen leeren Feldern. Bewegt sich nichts, ist der Zug ungültig und zählt nicht.
5. **Gießkanne (eigene Regel):** Alle 10 Verschmelzungen gibt es 1 Gießkanne (max. 3). Mit einer Gießkanne kann der Spieler eine beliebige Pflanze direkt eine Stufe aufwerten (ohne Zug zu verbrauchen). Stufe 7 kann nicht aufgewertet werden.
6. Punkte: Verschmelzung zur Stufe n gibt 2^n Punkte.
7. Gewonnen: erster Uralter Baum (Stufe 7) entsteht. Danach darf weitergespielt werden.
8. Verloren: Feld voll und keine Verschmelzung oder Gießkanne möglich.

## Features
- F1: Spiellogik (Bewegen, Verschmelzen, Spawnen, Sieg/Niederlage), deterministisch testbar per Seed
- F2: Steuerung per Pfeiltasten, WASD und Touch-Wischen
- F3: Rendering mit Emojis je Stufe, einfache Animationen (Gleiten, Verschmelz-Pop)
- F4: Punktestand und Highscore (localStorage)
- F5: Undo (genau 1 Schritt zurück)
- F6: Gießkanne inkl. Anzeige und Auswahl einer Pflanze per Klick
- F7: Neues Spiel, Spielstand bleibt nach Seiten-Reload erhalten
- F8: Sieg- und Game-Over-Overlay
- F9: Responsive (Handy-Breite ab 360px nutzbar)
- F10: README mit Start- und Testanleitung

## Akzeptanzkriterien (Beispiele)
- Zeile `[1,1,0,0]` nach links ergibt `[2,0,0,0]`
- Zeile `[1,1,1,1]` nach links ergibt `[2,2,0,0]`
- Zeile `[2,1,1,0]` nach links ergibt `[2,2,0,0]`, die neue 2 verschmilzt im selben Zug nicht erneut
- Ungültiger Zug verändert Zustand, Punkte und Zugzähler nicht
- Gleicher Seed und gleiche Zugfolge ergeben identischen Spielverlauf
- Gießkanne wertet Stufe 3 auf 4 auf, bei Stufe 7 ist sie wirkungslos und wird nicht verbraucht
- Nach Reload ist Spielstand inkl. Highscore identisch

## Design-Vorgaben
- Grafik: Emojis je Pflanzenstufe (1 🌰, 2 🌱, 3 🌿, 4 🪴, 5 🌷, 6 🌳, 7 🌲), keine externen Bilddateien
- Farben: helle Pastelltöne (Frühlingsstimmung), Hintergrund cremeweiß, Spielfeld in sanftem Hellgrün, Felder in leicht abgesetzten Pastellflächen; pro Pflanzenstufe ein eigener dezenter Pastellton; gute Lesbarkeit (ausreichender Kontrast bei Text)
- Gefühl: ruhig und entspannt; Tiles gleiten sanft (ca. 120–150 ms), Verschmelzen mit dezentem Pop (leichtes Skalieren), keine Partikel, kein Wackeln, kein Sound
- Schrift: eine abgerundete, gut lesbare System- oder Web-Safe-Schrift
- Sprache der Oberfläche: Englisch (Titel "Merge Garden", Buttons "New Game", "Undo", "Watering Can", Texte "You win!" / "Game over")
- Layout: Spielfeld zentriert und quadratisch, darüber Punkte und Highscore, darunter Buttons; auf dem Handy bildschirmfüllend nutzbar

## Nicht-Ziele
Kein Backend, keine Accounts, kein Sound, keine Mehrspieler-Funktion.
