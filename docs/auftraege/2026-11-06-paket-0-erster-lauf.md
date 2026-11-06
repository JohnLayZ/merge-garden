Auftrag: Paket 0 – Erster Lauf (komplettes Backlog T1 bis T19)
Datum: 2026-11-06
Status: ausgeführt und gemergt (Pull Request #1)
Grundlage im Repo: SPEC.md (Spielregeln, Design-Vorgaben), CLAUDE.md (Arbeitsregeln), TASKS.md (Backlog T1 bis T19)
Auftrag (Wortlaut)

Lies CLAUDE.md, SPEC.md und TASKS.md. Du bist Entwicklungsleiter und arbeitest das gesamte Backlog selbständig ab, ohne Rückfragen. Committe nach jedem Task und pushe regelmäßig. Wenn alles fertig ist und lint, Tests und Build grün sind, schreibe ALL DONE in die erste Zeile von STATUS.md.

Ergebnis
Alle Tasks T1 bis T19 abgearbeitet, ein Commit pro Task, dazu ein Fix-Commit für die Raster-Geometrie (Kacheln liefen bei 360 px über das Raster hinaus, per Screenshot entdeckt und behoben). STATUS.md beginnt mit ALL DONE.
Zum Schluss grün: Lint, 53 Unit-Tests, Build und 2 Playwright-Tests.
Playwright nutzt den vorinstallierten Chromium der Umgebung, sonst den normalen Download.
GitHub Pages: Workflow .github/workflows/deploy.yml läuft bei Push auf main, die Basis-URL wird aus dem Repo-Namen gesetzt. In den Repo-Einstellungen musste einmalig unter Pages die Quelle "GitHub Actions" gewählt werden. Der erste Deploy-Lauf scheiterte mit 404, weil Pages beim Merge noch nicht aktiv war, ein erneuter Lauf funktionierte.
Entscheidungen zu Unklarheiten in der Spec (DECISIONS.md): Die Gießkanne gibt keine Punkte und zählt nicht als Verschmelzung, man kann sie per Undo zurücknehmen. Mit 10 % Wahrscheinlichkeit erscheinen zwei Samen statt einem. Zwei Uralte Bäume verschmelzen nicht. Verloren ist das Spiel nur, wenn nichts mehr verschmilzt und keine Gießkanne mehr hilft.
Bewusst so gelassen: Nach dem Sieg durfte man zunächst weiterspielen (geändert in Paket 1). Nach einem Reload im gewonnenen Zustand erschien das Sieg-Overlay erneut.
Bekannte Mängel, die danach auffielen: Das Sieg-Overlay lag hinter dem Spielfeld (behoben in Paket 1). Animationen liefen bei abgeschalteten Windows-Animationen nicht (behoben in Paket 1).
