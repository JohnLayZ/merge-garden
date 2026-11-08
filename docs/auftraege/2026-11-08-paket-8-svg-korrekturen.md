Auftrag: Paket 8 – SVG-Korrekturen
Datum: 2026-11-08
Status: ausgeführt (Pull Request nach main, siehe Abschlusstext)
Auftrag (Wortlaut)

Lies SPEC.md, CLAUDE.md, DECISIONS.md, STATUS.md und README.md. Arbeite selbständig ohne Rückfragen, ein Commit pro Punkt, mit Tests wo sinnvoll. Am Ende müssen lint, Tests und Build grün sein. Trage Entscheidungen in DECISIONS.md ein und fasse den Stand in STATUS.md zusammen.

Hintergrund: Das Spiel soll von 9 auf 11 Stufen wachsen. Die Entwürfe aus Paket 7 in src/assets/plants-v2/ sind vom Auftraggeber grundsätzlich gut bewertet worden. In diesem Paket korrigierst du nur die unten genannten Punkte. Alles, was nicht genannt ist, bleibt unverändert (Dateien nicht anfassen, Kachelfarben und Skalierungsfaktoren nicht ändern, außer ausdrücklich genannt). Auch in diesem Paket erstellst du ausschließlich Zeichnungen und die Vorschau, das laufende Spiel bleibt unverändert: Ändere weder src/levels.ts noch Spiellogik, Tests, Sounds, Anleitung, Speicherformat, src/assets/plants/ oder das Produktions-Build.

Die Stufenreihe ändert sich in einem Punkt: Der Old Tree heißt künftig Autumn Tree. Grund: Great Tree, Old Tree und Ancient Tree haben inhaltlich dasselbe erzählt ("alt und groß"). Jetzt folgen die Bäume ab Stufe 8 den Jahreszeiten: Blossom Tree = Frühling, Great Tree = Sommer, Autumn Tree = Herbst, Ancient Tree steht über den Jahreszeiten.
1 Seed, 2 Planted Seed, 3 Sprout, 4 Seedling, 5 Sapling, 6 Young Tree, 7 Tree, 8 Blossom Tree, 9 Great Tree, 10 Autumn Tree, 11 Ancient Tree.

1. Planted Seed: Entferne vom Erdhügel die kleinen dunklen Striche und den Punkt, die wie ein Gesicht aussehen. Es bleiben nur der Erdhügel und der halb herausschauende Samen, sonst alles unverändert.

2. Sprout: Mache den Sprout in der Wirkung ein kleines Stück kleiner (etwa 10 bis 15 %, entweder in der Zeichnung selbst oder über den Skalierungsfaktor in der Vorschau, z. B. von 0,44 auf ca. 0,40), damit er sich besser vom Seedling unterscheidet. Der Seedling bleibt unverändert (0,51 und seine Zeichnung). Die Skalierungsfaktoren müssen streng steigend bleiben.

3. Young Tree: Er soll mehr wie ein junger Baum aussehen und weniger wie ein Lutscher (perfekte Kugel auf dünnem Stiel). Gib ihm einen etwas dickeren Stamm und eine kleine, wolkige, hellgrüne Krone aus mehreren überlappenden Rundungen (also nicht eine einzelne Kreisform) mit ein, zwei Details wie Glanzlicht und kleinen Blattstrichen. Er soll klar kleiner und jünger wirken als der Tree (Stufe 7). Hellgrüne Farbwelt und gemeinsame Grundlinie bleiben.

4. Old Tree wird zum Autumn Tree: Lösche src/assets/plants-v2/10-old-tree.svg und lege 10-autumn-tree.svg an. Der Autumn Tree soll von der Form her wie der Great Tree (Stufe 9) aussehen: breite, volle Wolkenkrone und kräftiger Stamm mit Wurzelansätzen. Der Stamm ist aber noch etwas dicker als beim Great Tree, die Krone ist mindestens so groß wie beim Great Tree (so groß, dass nichts am Rand der Zeichenfläche abgeschnitten wird). Der Unterschied zum Great Tree liegt in den Farben: die Krone in Herbstlaub (Gelb, Orange, Rotorange in Flecken oder Bändern), dazu einige fallende Blätter in der Luft und auf dem Boden, die als Blätter erkennbar sind (Blattform, nicht Kugeln oder Flecken). Kein Astloch, kein knorriger Stamm, keine einzelnen losen Wolken. Gleicher Stil, gleiche Linienstärke und Grundlinie wie die übrigen Entwürfe. Der Skalierungsfaktor in der Vorschau bleibt 0,9.

5. Vorschau anpassen: Passe dev/plants-v2.html bzw. dev/plants-v2.ts an: Name Autumn Tree statt Old Tree, die Änderungen aus Punkt 2. Kachelfarben und die übrigen Faktoren bleiben. Mache Screenshots bei 520 px und bei 360 px Breite (Gerätefaktor 2) und sieh sie dir selbst an. Bessere nach, wenn Planted Seed, Sprout / Seedling, Young Tree / Tree oder Great Tree / Autumn Tree sich zu ähnlich sehen oder etwas abgeschnitten wird. Lege die Screenshots mit neuen Dateinamen in docs/vorschau/ ab, ohne die alten zu überschreiben (plants-v2b-520.png, plants-v2b-360.png, plants-v2b-board-360.png). Halte in DECISIONS.md fest: den Wechsel von Old Tree zu Autumn Tree mit der Jahreszeiten-Logik und was du nachgebessert hast. Die Entwürfe in src/assets/plants-v2/ werden noch nicht im Spiel verwendet.

Führe zuerst die Punkte 1 bis 5 aus. Lege danach die Auftragsdatei in docs/auftraege/ an (Dateiname: 2026-11-08-paket-8-svg-korrekturen.md, Auftragstext im Wortlaut, vollständig ausgefüllter Abschnitt "Ergebnis"). Führe den Release-Ablauf aus CLAUDE.md ganz zuletzt aus. Die erste Zeile deines Abschlusstextes nennt, ob der Merge nach main geklappt hat und ob die neue Version online ist. Nenne im Abschlusstext außerdem die genauen Pfade der Screenshots im Repo und in je einem Satz, wo du noch Zweifel hast.

Ergebnis

Umgesetzt (ein Commit pro Punkt):
1. Planted Seed: Striche und Punkt vom Hügel entfernt, sonst unverändert.
2. Sprout: Vorschau-Faktor 0,44 → 0,39 (ca. −11 %), Seedling unverändert (0,51), Faktoren streng steigend.
3. Young Tree: dickerer Stamm, wolkige hellgrüne Krone aus mehreren Rundungen mit Glanzlicht und Blattstrichen, deutlich kleiner als der Tree.
4. `10-old-tree.svg` gelöscht, `10-autumn-tree.svg` angelegt: Form wie der Great Tree, dickerer Stamm mit Wurzelansätzen, Krone in Gelb/Orange/Rotorange, vier fallende Blätter in Blattform; Faktor 0,9.
5. Vorschau auf „Autumn Tree“ und Faktor 0,39 angepasst; Screenshots `docs/vorschau/plants-v2b-520.png`, `plants-v2b-360.png`, `plants-v2b-board-360.png` (alte bleiben). Nachbesserung: Pfad-Tippfehler im ersten Autumn-Tree-Entwurf behoben, fallendes Blatt vor dem Stamm entfernt. DECISIONS.md enthält die Jahreszeiten-Logik und die Nachbesserungen.

Bewusst anders: keine Tests ergänzt, da sich das Spiel nicht ändert. Die Dokumentation (DECISIONS/STATUS) liegt in einem eigenen Commit, die Auftragsdatei im letzten Commit; alles im selben Pull Request.
Offene Punkte: Freigabe der Entwürfe; danach Einbau der 11 Stufen in einem eigenen Paket.
