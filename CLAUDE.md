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

## Aufträge dokumentieren
Bei jedem Auftrag legst du **vor** dem Release-Ablauf eine Datei in `docs/auftraege/` an. Dateiname: `JJJJ-MM-TT-paket-N-kurztitel.md` (Datum, fortlaufende Paketnummer, Kurztitel; nach Paket 3 kommt Paket 4 usw.). Inhalt: Auftragstext im Wortlaut und ein vollständig ausgefüllter Abschnitt "Ergebnis" (was umgesetzt wurde, was bewusst anders gelöst wurde, offene Punkte). Die Datei muss im selben Pull Request landen wie die Änderungen des Auftrags. Bei kleinen Aufträgen (z. B. ein einzelner Fehler) genügen der Auftragstext und zwei bis drei Zeilen Ergebnis. Bestehende Auftragsdateien nicht neu anlegen und den Wortlaut nie ändern.

## Release-Ablauf (bei jedem Auftrag, ganz zuletzt)
Sind alle Punkte eines Auftrags erledigt und `npm run lint`, `npm test` und `npm run build` grün:
1. Erstelle selbst einen Pull Request nach `main` mit aussagekräftigem Titel und kurzer Zusammenfassung.
2. Merge ihn (Squash-Merge ist okay). **Nur bei grünem Stand mergen.** Bei roten Tests oder Konflikten: nicht mergen, sondern beheben oder im Pull Request beschreiben, woran es hakt. **Branch-Löschung:** Lösche den Branch nach dem Merge nicht selbst (das GitHub-Werkzeug hat keine Lösch-Funktion; das Löschen übernimmt die Repo-Einstellung "Automatically delete head branches"). Erwähne den Branch im Abschlusstext nur, falls er nach dem Merge noch existiert.
3. Ist das Mergen mit den vorhandenen Berechtigungen nicht möglich, lass den Pull Request offen und weise im Abschlusstext klar darauf hin.
4. Prüfe nach dem Merge, soweit mit den Werkzeugen möglich, den Status des Deploy-Workflows (`.github/workflows/deploy.yml`, Reiter Actions) und warte maximal ca. 10 Minuten, bis er grün ist.
5. Schreibe erst dann den Abschlusstext. Seine **erste Zeile** nennt, ob der Merge nach `main` geklappt hat und ob die neue Version online ist. Kann der Status nicht abgefragt werden, sage das klar und erinnere daran, dass die neue Version erst nach dem Deploy (Reiter Actions, grüner Haken) online ist.
