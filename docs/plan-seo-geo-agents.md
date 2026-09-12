# Plan: SEO, GEO und Agent-Zugänglichkeit

Stand: 12. September 2026. Die abgehakten Veröffentlichungsaufgaben bezeichnen lokal erzeugte, deploybare Dateien, nicht einen erfolgten Live-Release. Status: lokal umgesetzt und geprüft; Deployment und kontogebundene Messungen offen.

Ergebnisse und Prüfgrenzen: [Prüfprotokoll](verification-seo-geo-agents.md).

## Ziel

Orte und Reisen sollen über Suchmaschinen auffindbar, als einzelne Quellen
zitierbar und von Browser- sowie datenlesenden Agents direkt nutzbar werden.
Die interaktive Karte bleibt der zentrale Einstieg; ergänzende Inhaltsseiten
machen das vorhandene Wissen unabhängig von Karteninteraktionen zugänglich.

## Ausgangslage und Grenzen des Audits

- `src/data.js` enthält 579 Orte, 9 Reisen und 185 Timeline-Ereignisse.
- Stabile Orts-IDs, alternative Namen, Quellenlinks und Unsicherheitsangaben
  sind bereits vorhanden.
- Orts- und Reisedetails entstehen durch JavaScript nach Interaktion.
  Eigene Inhalts-URLs und URL-basierte Zustandswiederherstellung fehlen.
- `index.html` enthält Titel und Beschreibung, aber keine Canonical- oder
  Social-Metadaten. Sitemap und robots.txt fehlen im Repository.
- Die Live-Domain war aus der Audit-Umgebung nicht erreichbar. Indexierung,
  CDN-Regeln, Response-Header und reale Ladezeiten sind noch ungeprüft.
- Im Arbeitsverzeichnis bestehen bereits Änderungen an Karte, Styles und
  Tests. Diese vor Umsetzung erneut sichten und bei Änderungen erhalten.

## Technische Leitlinien

- Kein Framework-Wechsel, kein Backend und keine neuen Laufzeitabhängigkeiten.
- Bestehende Daten als gemeinsame Quelle für Karte und Inhaltsseiten nutzen.
- Ein kleines Node-Skript ohne zusätzliche Pakete erzeugt statisches HTML.
  Die erzeugten Seiten werden eingecheckt, sodass lokaler Server und nginx
  weiterhin ohne Build-Schritt starten. CI prüft, ob die Ausgabe aktuell ist.
- Nur veröffentlichungsreife Inhalte erzeugen; zunächst zwei Pilotseiten,
  anschließend eine explizite Auswahl erweitern.
- HTML-Inhalte und strukturierte Daten stimmen überein. Alle Besucher erhalten
  dieselben Inhalte, ohne Sonderseiten nur für Bots.
- Bestehende englische Inhaltssprache beibehalten. Übersetzungen sind ein
  separates Vorhaben.

## 1. Pilot: eigenständige Inhalte und Karteneinstiege

- [x] Generator und gemeinsame Seitentemplates implementieren, beispielsweise
  `scripts/generate-content.mjs` mit einer expliziten Liste veröffentlichter IDs.
- [x] `/places/rivendell/` erzeugen: eindeutiger Titel und H1, Kurzbeschreibung,
  alternative Namen, Region, Chronik, Quellen und relevante Verknüpfungen.
- [x] `/journeys/fellowship/` erzeugen: kurze Einführung, geordnete Stationen,
  vorhandene Datumsangaben, Notizen und verfügbare Ortsverknüpfungen.
- [x] `/places/` und `/journeys/` als HTML-Verzeichnisse erzeugen. Nur bereits
  existierende Inhaltsseiten verlinken; für andere Orte Karteneinstiege nutzen.
- [x] Verzeichnisse aus dem statischen HTML des Atlas verlinken und dort eine
  sichtbare, knappe Einführung mit Hauptüberschrift bereitstellen.
- [x] Direkte Karteneinstiege unterstützen: `/?place=rivendell` und
  `/?journey=fellowship`. Auswahl beim Laden wiederherstellen.
- [x] Navigation zu Inhaltsseiten als echte `<a href>` ausgeben. Aktionen wie
  Zoom und Layer-Umschaltung bleiben Buttons.
- [x] URL bei Orts-/Reisewechsel synchronisieren; `popstate` unterstützt
  Browser-Zurück/Vorwärts. Ungültige IDs führen zu einem verständlichen Zustand.
- [x] Root-relative Asset-Links und Docker-COPY für die neuen Verzeichnisse
  ergänzen. Nicht existierende Inhaltsseiten behalten echte HTTP-404-Antworten.

Abnahme: Beide Pilotseiten sind ohne JavaScript vollständig lesbar, direkt
aufrufbar und aus einem Verzeichnis erreichbar. Ihr Kartenlink öffnet den
richtigen Ort beziehungsweise die richtige Reise. Reload und Browser-History
funktionieren. Der Pilot lädt keine vollständige interaktive Karte mit.

## 2. Metadaten, Discovery und weitere Inhalte

- [x] Seitenspezifische Titel und Beschreibungen für Start-, Verzeichnis- und
  Detailseiten ergänzen; Starttitel benennt Karte, Timeline und Reisen.
- [x] Produktionsbasis `https://atlas.bag-end.eu` zentral konfigurieren.
- [x] Canonicals festlegen: Inhaltsseiten jeweils auf sich selbst; reine
  Karten-Zustandsvarianten auf die Atlas-Startseite. Diese Varianten nicht als
  zusätzliche Inhaltsseiten in die Sitemap aufnehmen.
- [x] Sitemap aus der Liste veröffentlichter Seiten erzeugen. `lastmod` nur
  verwenden, wenn eine tatsächliche Inhaltsänderung bekannt ist.
- [x] robots.txt mit Sitemap-Verweis ausliefern. Suchcrawler-Zugriff und
  Trainingscrawler-Regeln getrennt betrachten; Live-CDN-Regeln mitprüfen.
- [x] Open-Graph- und Social-Card-Metadaten mit geeignetem, rechtlich nutzbarem
  Vorschaubild ergänzen; keine Bildrechte aus dem Code-Lizenzstatus ableiten.
- [x] Passendes JSON-LD für Website und Breadcrumbs ergänzen. Fiktive
  Kartenkoordinaten nicht als reale geografische Koordinaten deklarieren.
- [x] Nach erfolgreichem Pilot weitere wichtige Orte und Reisen kuratieren
  und veröffentlichen; dünne oder ungeprüfte Seiten zunächst zurückstellen.

Abnahme: Veröffentlichte URLs liefern 200, unbekannte Inhalts-URLs 404.
Canonicals, Sitemap und interne Links sind konsistent. Metadaten sind bereits
im Response-HTML vorhanden; strukturierte Daten beschreiben sichtbare Inhalte.

## 3. GEO: Quellen und nachvollziehbare Aussagen

- [x] Quellen- und Methodikseite veröffentlichen und aus Details verlinken.
- [x] Kartenmaßstab, schematische Positionen, Zeitrechnung und Berechnung von
  Entfernungen dort verständlich erklären.
- [x] Für die Pilotseiten zentrale Aussagen an Quellen prüfen und verfügbare
  Buch-, Kapitel- oder Anhangreferenzen ergänzen. Fehlende Belege nicht erfinden.
- [x] Quellen für Reisen und Ortskontext einzelner Stationen ergänzen;
  ihre bisherige Datenstruktur enthält keine eigenen Quellenfelder.
- [x] Belegte Angaben, ungefähre Positionen und modellierte Reisezeiten direkt
  am jeweiligen Inhalt unterscheiden. Einschränkungen auch bei isoliert
  lesbaren Zahlen und Tabellen erhalten.
- [x] Verantwortlichkeit und Verfahren für Korrekturen sichtbar machen;
  Prüfdatum nur nach tatsächlicher inhaltlicher Prüfung setzen.

Abnahme: Ein Leser kann zentrale Aussagen der Pilotseiten zur Quelle
zurückverfolgen und Schätzungen als solche erkennen. Zitierbare Seiten haben
stabile URLs. Eine garantierte Aufnahme in KI-Antworten ist kein Abnahmekriterium.

## 4. Browser-Agents und Tastaturbedienung

- [x] Layer-Schalter über `aria-labelledby` mit ihren sichtbaren Namen verbinden.
- [x] Kategorien als Filter-Buttons mit `aria-pressed` auszeichnen, sofern das
  bisherige Filterverhalten erhalten bleibt; unvollständige Tab-Semantik entfernen.
- [x] Klickbare Reisestationen durch native Buttons oder Links bedienbar machen.
- [x] Gleichlautende Reise-„details“-Buttons eindeutig benennen.
- [x] Tatsächlichen Zeitpunkt über `aria-valuetext` am Zeitregler mitteilen und
  eine explizite Jahres-/Zeitalter-Eingabe oder gleichwertige Auswahl anbieten.
- [x] Ein URL-Format für Zeitangaben dokumentieren, etwa
  `/?place=rivendell&age=TA&year=3019`; Jahr innerhalb des Zeitalters eindeutig
  von der internen absoluten Zeitachse unterscheiden.
- [x] Fokus nach Navigation und dynamischen Änderungen sinnvoll führen;
  Suchergebnisanzahl über einen zurückhaltenden Statusbereich melden.

Abnahme: Suche, Ortsauswahl, Reiseauswahl, Stationen, Layer und Jahresauswahl
sind per Tastatur und anhand benannter UI-Elemente bedienbar. Ein Browser-Agent
kann einen konkreten Ort und eine Reise ohne koordinatenbasiertes Raten öffnen.

## 5. Statischer Datenzugang für Agents

- [x] Versionierten JSON-Export aus derselben Datenquelle erzeugen, beispielsweise
  `/data/v1/places.json`, `/data/v1/journeys.json` und `/data/v1/events.json`.
- [x] Verständliche Feldnamen, stabile IDs, vollständige Quellen-URLs und
  Links zu vorhandenen Inhaltsseiten beziehungsweise Karteneinstiegen verwenden.
- [x] Für Timeline-Ereignisse vor Veröffentlichung stabile IDs ergänzen;
  keine Array-Indizes als dauerhafte Kennungen verwenden.
- [x] Koordinatensystem, Kalender, Unsicherheiten, Datenversion und
  Nutzungsbedingungen auf einer verlinkten Datendokumentationsseite erklären.
- [x] Quellen und Schätzungskennzeichnungen im Export erhalten. Bildrechte
  ausdrücklich vom Daten-/Code-Zugang unterscheiden.

Abnahme: Ein Client kann ohne JavaScript-Ausführung Orte, Reisen und Ereignisse
lesen und verknüpfen; Zeitwerte und Koordinaten sind eindeutig interpretierbar.
Ein MCP-Server, OpenAPI-Service oder eigener Suchdienst ist zunächst nicht nötig.

## 6. Live-Verifikation, Performance und Erfolgsmessung

- [ ] Nach Deployment: Erreichbarkeit, Redirects, MIME-Typen, robots.txt, Sitemap und mögliche
  Bot-Blockaden der tatsächlichen Hosting-/CDN-Konfiguration prüfen.
- [x] Kompression und Cache-Header messen. Cache-Strategie mit aktualisierbaren
  Asset-URLs abstimmen, statt unveränderte Dateinamen unbegrenzt zu cachen.
- [x] Startseite und Pilotseiten mobil auf Ladezeit und Bedienreaktion prüfen;
  Lokale Browser-Labordaten von verfügbaren realen Core-Web-Vitals-Daten trennen; Ergebnisse im Prüfprotokoll.
- [ ] Search-Console-Zugriff prüfen, sofern verfügbar: Sitemap einreichen,
  Pilot-URLs inspizieren und gerenderten Inhalt überprüfen.
- [ ] Ausgangswerte und spätere Entwicklung dokumentieren: indexierte
  Inhaltsseiten, Suchimpressionen, Klicks und relevante Suchanfragen.
- [ ] Optional erkennbare KI-Referrals beobachten; diese sind kein vollständiges
  Maß aller Erwähnungen oder Zitate in KI-Antworten.

## Umsetzung und Checks

Reihenfolge: zuerst Paket 1 vollständig abnehmen; danach Paket 2 und die
Quellenarbeit am Pilot. Paket 4 folgt vor dem breiten Ausbau, Paket 5 danach.
Live-Messungen aus Paket 6 möglichst früh als Baseline durchführen und nach
Veröffentlichung wiederholen.

- Pro Arbeitspaket einen überschaubaren, überprüfbaren Änderungssatz erstellen.
- Generator auf deterministische Ausgabe, korrekte Links, HTML-Escaping und
  fehlende Ziel-IDs prüfen. CI erkennt veraltete erzeugte Dateien.
- Bestehendes `npm test` nach Codeänderungen ausführen.
- Navigation mit und ohne JavaScript sowie direkte URLs und Browser-History
  im Browser prüfen. Bei Kartenänderungen die Gesture-/Rendering-Checks aus
  `CONTRIBUTING.md` zusätzlich durchführen.
- README und CONTRIBUTING um Generierungs- und Veröffentlichungsablauf ergänzen.

## Bewusst nachrangig

`llms.txt`, zusätzliche KI-Protokolle, vollständige Mehrsprachigkeit und
massenhaft automatisch erzeugte FAQ-/Ereignisseiten sind keine Voraussetzung
für den Pilot. Sie werden nur bei einem konkreten zusätzlichen Bedarf bewertet.

## Grundlagen

- [Google: crawlbare Links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

Google nennt für seine KI-Suchfunktionen die üblichen SEO-Grundlagen und verlangt
keine speziellen KI-Dateien. Die zusätzlichen JSON- und Bedienempfehlungen hier
sind Architekturentscheidungen für dieses Projekt, keine Rankinggarantien.
