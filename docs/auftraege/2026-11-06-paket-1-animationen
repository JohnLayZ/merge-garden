Auftrag: Paket 1 – Animationen und Sieg-Logik
Datum: 2026-11-06
Status: ausgeführt und gemergt (Pull Request #2)
Auftrag (Wortlaut)

Lies SPEC.md, DECISIONS.md, STATUS.md und README.md. Arbeite selbständig ohne Rückfragen, ein Commit pro Punkt, mit Tests wo sinnvoll. Am Ende müssen lint, Tests und Build grün sein. Aktualisiere SPEC.md, trage Entscheidungen in DECISIONS.md ein und fasse den Stand in STATUS.md zusammen.

Animationen immer aktiv: Die Animationen (Gleiten, Verschmelz-Pop) laufen immer, unabhängig von prefers-reduced-motion oder Windows-/Browsereinstellungen. Entferne entsprechende Abfragen im CSS/JS. Halte das in SPEC.md und DECISIONS.md fest, damit es später nicht wieder eingebaut wird.
Sieg beendet das Spiel: Mit dem ersten Uralten Baum (Stufe 7) ist das Spiel gewonnen und beendet. Danach sind keine weiteren Züge, Gießkannen-Nutzung oder Undo mehr möglich, und es gibt keinen "Keep playing"-Button. Das gilt auch, wenn der Uralte Baum durch die Gießkanne entsteht. Passe Spiellogik, bestehende Tests (u. a. aus T14), README und SPEC.md an (Regel 7 "danach darf weitergespielt werden" entfällt). Der Highscore wird beim Sieg wie gewohnt aktualisiert. Nach einem Reload im gewonnenen Zustand erscheint das Overlay weiterhin.
Overlay-Fehler beheben: Das Sieg-Overlay erscheint aktuell hinter dem Spielfeld. Es muss über allem liegen (Stacking/z-index prüfen), das Feld abdunkeln und bedienbar sein. Es zeigt "You win!", Punktestand, Highscore und nur den Button "New Game". Das Game-Over-Overlay verhält sich genauso (Punktestand, Highscore, "New Game"). Ergänze einen Playwright-Test, der prüft, dass der Button klickbar ist (falls Playwright in der Umgebung läuft).
Ergebnis
Alle drei Punkte umgesetzt, je ein Commit. Lint, 54 Unit-Tests, Build und 3 Playwright-Tests grün.
Animationen: Die prefers-reduced-motion-Abfrage wurde aus dem CSS entfernt (im JS gab es keine). Die Vorgabe steht in SPEC.md und DECISIONS.md.
Sieg: Nach dem ersten Uralten Baum sind Züge, Gießkanne und Undo gesperrt, auch bei Sieg per Gießkanne. "Keep playing" entfällt. Der Highscore wird beim Sieg aktualisiert, das Overlay bleibt nach einem Reload erhalten. Tests aus T14 und zur Gießkanne angepasst, neue Tests für gesperrte Aktionen, README und SPEC.md angepasst.
Overlay: liegt per z-index über dem Spielfeld und dunkelt es ab. Es zeigt "You win!" bzw. "Game over", Score, Best und nur den Button "New Game". Der Button war durch eine mobile flex:1-Regel zu hoch gestreckt, das ist behoben. Der neue Playwright-Test klickt den Button ohne force.
Offen bzw. bewusst so gelassen: Undo nach Game Over blieb zunächst möglich (Änderung in Paket 2).
