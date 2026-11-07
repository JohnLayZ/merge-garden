Auftrag: Paket 7 – SVG-Entwürfe für 11 Stufen
Datum: 2026-11-07
Status: ausgeführt (Pull Request nach main, siehe Abschlusstext)
Auftrag (Wortlaut)

Lies SPEC.md, CLAUDE.md, DECISIONS.md, STATUS.md und README.md. Arbeite selbständig ohne Rückfragen, ein Commit pro Punkt, mit Tests wo sinnvoll. Am Ende müssen lint, Tests und Build grün sein. Trage Entscheidungen in DECISIONS.md ein und fasse den Stand in STATUS.md zusammen.

Hintergrund: Das Spiel soll von 9 auf 11 Stufen wachsen, und ab Stufe 5 sind alle Stufen Bäume. In diesem Paket erstellst du ausschließlich die neuen Zeichnungen und eine Vorschau, damit der Auftraggeber sie prüfen kann, bevor sie ins Spiel eingebaut werden. Das laufende Spiel bleibt unverändert: Ändere weder src/levels.ts noch Spiellogik, Tests, Sounds, Anleitung, Speicherformat, bestehende SVG-Dateien oder das Produktions-Build. Es ändert sich für Spielerinnen und Spieler nichts.

Die neue Stufenreihe (Namen auf Englisch):
1 Seed, 2 Planted Seed, 3 Sprout, 4 Seedling, 5 Sapling, 6 Young Tree, 7 Tree, 8 Blossom Tree, 9 Great Tree, 10 Old Tree, 11 Ancient Tree.

1. SVG-Entwürfe: Lege alle 11 Pflanzen als eigene SVG-Dateien im neuen Ordner src/assets/plants-v2/ an (Dateinamen mit Stufennummer, z. B. 01-seed.svg bis 11-ancient-tree.svg). Bestehende Dateien in src/assets/plants/ bleiben unangetastet, sie dürfen als Vorlage dienen. Gemeinsamer Stil: flach, abgerundet, helle Pastellfüllung, einheitliche Linienstärke, gleiche Leinwand (viewBox) und gemeinsame Grundlinie mit kleinem Erdschatten, keine externen Quellen. Jede Stufe muss auf einen Blick von ihren Nachbarn unterscheidbar sein:
- Seed: kleiner, loser Samen
- Planted Seed: der Samen steckt halb in einem kleinen, braunen Erdhügel, noch ohne Trieb, deutlich anders als der lose Seed
- Sprout: erster kleiner Trieb mit zwei Blättchen
- Seedling: kleine Pflanze mit mehreren Blättern
- Sapling: dünner Stamm, nur wenige Blätter, noch keine richtige Krone
- Young Tree: kleine, runde, hellgrüne Krone
- Tree: volle, mittelgrüne Krone
- Blossom Tree: wie Tree, aber mit rosa Pastellblüten (keine Früchte)
- Great Tree: große, breite, dunkelgrüne Krone, kräftiger Stamm
- Old Tree: dicker, knorriger Stamm, herbstliche Krone in Gelb und Orange
- Ancient Tree: der mächtigste Baum des Spiels. Gewaltiger, sehr dicker Stamm mit sichtbaren, weit ausladenden Wurzeln, riesige, breite Krone in tiefem Dunkelgrün, dazu goldene Lichtpunkte oder Früchte. Er muss sich auf den ersten Blick klar vom Old Tree und vom Great Tree abheben und größer und eindrucksvoller wirken als alle anderen.

2. Vorschau-Seite: Lege dev/plants-v2.html an (nur für die Entwicklung, nicht Teil des Produktions-Builds, die alte Vorschau dev/plants.html bleibt unverändert). Sie zeigt:
a) alle 11 Stufen nebeneinander (bei schmaler Breite umgebrochen) in realer Feldgröße auf je einer Pastell-Kachel mit eigener Farbe pro Stufe und mit Beschriftung (Nummer und Name),
b) die Größenverhältnisse mit 11 vorgeschlagenen, streng steigenden Skalierungsfaktoren (ca. 0,30 bis 0,95, Seed klein, Ancient Tree füllt das Feld fast aus), die du nur in der Vorschau definierst,
c) ein nachgebautes 4x4-Spielfeld in der Optik des Spiels mit möglichst vielen verschiedenen Stufen gleichzeitig, damit man die Lesbarkeit im Zusammenspiel beurteilen kann.

3. Selbstkontrolle: Mache Screenshots der Vorschau bei 520 px und bei 360 px Breite (Gerätefaktor 2) und sieh sie dir selbst an. Bessere nach, wenn sich Stufen zu ähnlich sehen, etwas abgeschnitten wird oder der Ancient Tree nicht mächtig genug wirkt. Prüfe besonders die Paare Seed / Planted Seed, Tree / Blossom Tree und die letzten drei Bäume Great Tree / Old Tree / Ancient Tree. Lege die finalen Screenshots als PNG im Ordner docs/vorschau/ ab (z. B. plants-v2-520.png, plants-v2-360.png, plants-v2-board-360.png), damit sie nach dem Merge direkt auf GitHub angesehen werden können. Halte in DECISIONS.md kurz fest, was du nachgebessert hast, und dass die Entwürfe in src/assets/plants-v2/ noch nicht im Spiel verwendet werden.

Führe zuerst die Punkte 1 bis 3 aus. Lege danach die Auftragsdatei in docs/auftraege/ an (Dateiname: 2026-11-07-paket-7-svg-entwuerfe-11-stufen.md, Auftragstext im Wortlaut, vollständig ausgefüllter Abschnitt "Ergebnis"). Führe den Release-Ablauf aus CLAUDE.md ganz zuletzt aus. Die erste Zeile deines Abschlusstextes nennt, ob der Merge nach main geklappt hat und ob die neue Version online ist. Nenne im Abschlusstext außerdem die genauen Pfade der Screenshots im Repo und in je einem Satz, wo du bei den Pärchen und dem Ancient Tree selbst noch Zweifel hast.

Ergebnis

Umgesetzt: 11 Entwürfe in `src/assets/plants-v2/` (01-seed.svg bis 11-ancient-tree.svg, gleiche viewBox 0 0 100 100, Linienstärke 4, Erdschatten als Grundlinie); Vorschau `dev/plants-v2.html` mit (a) Kacheln in realer Größe, (b) Größenverhältnissen (0,30 bis 0,95, nur in der Vorschau definiert), (c) 4×4-Spielfeld mit allen 11 Stufen; Screenshots `docs/vorschau/plants-v2-520.png`, `plants-v2-360.png`, `plants-v2-board-360.png`.
Nachgebessert (Details in DECISIONS.md): kleine Stufen vergrößert, gesichtsähnliche Blattstriche ersetzt, Great Tree breiter und mit gegabeltem Stamm, Größenleiste der Vorschau in realer Größe.
Bewusst anders: keine Tests ergänzt, da sich das Spiel nicht ändert (Entwürfe und Vorschau sind nicht Teil von Spiel oder Build).
Offene Punkte: Freigabe der Entwürfe durch den Auftraggeber; danach Einbau der 11 Stufen (levels.ts, Spielstand-Version, Sounds, Anleitung, Tests) in einem eigenen Paket.
