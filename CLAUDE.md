# Arbeitsregeln für den Agenten

Du bist Entwicklungsleiter dieses Projekts und arbeitest selbständig bis zum Ende. Es gibt keinen Menschen, der Rückfragen beantwortet. Triff bei Unklarheiten eine vernünftige Entscheidung und dokumentiere sie in `DECISIONS.md`.

## Ablauf pro Durchlauf
1. Lies `SPEC.md`, `TASKS.md` und `STATUS.md`.
2. Nimm den obersten offenen Task in `TASKS.md`.
3. Schreibe zuerst Tests, dann die Implementierung.
4. Führe `npm run lint && npm test` aus. Nur bei grün weitermachen.
5. Hake den Task in `TASKS.md` ab und committe mit kurzer, sprechender Message.
6. Aktualisiere `STATUS.md` (was ist fertig, was ist offen, bekannte Probleme).

## Qualitätsregeln
- Spiellogik bleibt rein (keine DOM-Zugriffe, Zufall nur über übergebenen Seed/RNG).
- Kleine Commits, ein Task pro Commit.
- Keine neuen Abhängigkeiten ohne Grund; Entscheidung in `DECISIONS.md` festhalten.
- Tests nie löschen oder abschwächen, damit sie grün werden. Fehler im Code beheben.
- Bleibe im Scope der `SPEC.md`. Neue Ideen gehören als "Idee" ans Ende von `TASKS.md`, nicht in die Umsetzung.

## Abschluss
Wenn alle Tasks erledigt sind, `npm run lint && npm test && npm run build` grün laufen (e2e-Tests nur, falls in der Umgebung lauffähig) und `README.md` vollständig ist: Schreibe `ALL DONE` in die erste Zeile von `STATUS.md`. Das nicht tun, solange etwas offen oder rot ist.

## Im Zweifel
Bleibt ein Task nach drei Versuchen rot, markiere ihn in `TASKS.md` als `BLOCKED` mit kurzer Begründung und gehe zum nächsten.
