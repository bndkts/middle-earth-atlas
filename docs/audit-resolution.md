# Nachprüfung und Behebung der Findings 1–37

Stand: 12. September 2026. Drei parallele Teilprüfungen für Fakten, Geografie und Entfernungen; anschließend Integration und Browserprüfung. Die Nummern entsprechen dem ursprünglichen Audit (P0–P2). Bestätigte Fehler wurden korrigiert; widerlegte Aussagen wurden zurückgenommen, unsichere Angaben als solche dargestellt.

| Nr. | Ergebnis der kritischen Nachprüfung und Umsetzung |
| --- | --- |
| 1 | Behoben: Zeitwert und Kartenposition aller 185 Timeline-Ereignisse getrennt. Ereignisse verwenden `absoluteYear` und geografische `x/y` sowie Ortsreferenzen. |
| 2 | Teilweise bestätigt: keine belastbare einheitliche Skalierung. Gerundete, ausdrücklich schematische Schätzwerte; keine Distanz für vergrößerte Innenorte. Die frühere Edoras-Abweichung von −25 % ist zurückgenommen, weil Straßenstrecke und Luftlinie vermischt wurden. |
| 3 | Behoben: Reisezuordnung über explizite Orts-IDs statt räumlicher Nähe oder Namensfragmenten. |
| 4 | Behoben: gezeichnete Route und gemessene Strecke verwenden dieselbe Polyline einschließlich Zwischenpunkten. |
| 5 | Behoben: angekündigter Straßenaufschlag von einem Drittel wird tatsächlich in die Reisezeit eingerechnet. |
| 6 | Behoben: unbelegte Geschwindigkeiten konkreter Figuren/Heere entfernt. Generische Szenarien mit offengelegten Annahmen ersetzen sie. Auch die ursprüngliche vorgeschlagene Ersatzgeschwindigkeit ist kein kanonischer Standard. |
| 7 | Behoben: Bilbos Route, Forest Gate und Spinnenbegegnung an den nördlichen Elf-path angepasst; Verwechslung mit der Old Forest Road entfernt. |
| 8 | Behoben: Wellinghall an Methedras versetzt und als ungefähr lokalisiert gekennzeichnet. Die ursprünglich genannten „104 Meilen“ waren lediglich Karteneinheiten. |
| 9 | Behoben: Grey Wood zwischen Mindolluin und Amon Dîn statt bei Halifirien platziert. |
| 10 | Frühere sichere Positionsbehauptung zurückgenommen: Thorin’s Halls liegt in den südlichen Blue Mountains; die genaue Lage zum Golf ist umstritten. Keine unbelegte Verlegung; Unsicherheit im Ortstext erklärt. |
| 11 | Behoben: Great Barrow östlich von Bombadils Haus in den Barrow-downs eingeordnet; Reisestation verknüpft. Exakter Punkt bleibt rekonstruiert. |
| 12 | Teilweise bestätigt: historische Waldnamen zeitlich begrenzt. Eregion/Hollin bleibt nach dem Untergang des Elbenreichs eine geografische Bezeichnung; die Forderung nach vollständigem Ausblenden war falsch. |
| 13 | Behoben: Pelargir am 13. März; Flotte erbeutet, nicht vernichtet. |
| 14 | Behoben: Tod Brands und Dáins am 17. März, Befreiung vom Belagerungsring am 27. März. |
| 15 | Behoben: Bywater unterscheidet nahezu 70 getötete Gegner und 19 gefallene Hobbits sowie Gefangene/Verwundete. |
| 16 | Jahreskritik zurückgenommen: Battle of the Plains war 1856; 1851 begannen die Invasionen. Falsche Zuschreibung an Minohtar entfernt und Marharis Rolle korrigiert. |
| 17 | Schlachtfeld bei Tharbad korrigiert. Die Datierung 1700/1701 ist in Referenzen uneinheitlich; als unsicherer Zeitraum dargestellt, 1701 dient der Sortierung. |
| 18 | Behoben: Shelobs Angriff/Gefangennahme am 13. März; Betreten ihres Bereichs am 12. März bleibt davon unterschieden. Timeline entsprechend umgeordnet. |
| 19 | Behoben: Thrórs Kammer endet nicht 2770; Besuch der Ruine 2941 berücksichtigt. |
| 20 | Behoben: Verlauf der Belagerung von Gondor bis zum Tordurchbruch und Entsatz am 15. März korrigiert. |
| 21 | Gemischter Befund: Monument erst nach T.A. 933 errichtet, erinnert an S.A. 3261; frühere Korrektur war falsch. Unbekannte exakte Bau-/Zerstörungsjahre und Gundabads unbelegtes Plünderungsjahr entfernt. Long-Winter-Intervalle bis 2759 verlängert. |
| 22 | Behoben: „Existed“ durch passende Bezeichnungen für Ereignis-, Reichs-, Vor-Ruinen- oder belegten Zeitraum ersetzt. Unbekannte Grenzen bleiben unbekannt. Falsche Enddaten von Mazarbul, Thrórs Kammer und Ithilien entfernt. Timeline erklärt die Bedeutung ausgegrauter Orte. |
| 23 | Behoben: Timeline-Regler reicht dynamisch bis zum letzten enthaltenen Ereignis. Ereignisreiche Jahre zeigen sämtliche Ereignisse des Jahres. |
| 24 | Behoben für echte Ortsbesuche: 127 Reisestationen und 185 Ereignisse sind explizit verknüpft und koordinatengleich. Regionale Durchquerungen/Flussübergänge bleiben ungefähre Wegpunkte statt künstlich auf Beschriftungszentren zu springen. |
| 25 | Behoben: keine numerischen Entfernungen/Reisezeiten zu Flächenankern; Oberfläche erklärt die Einschränkung. |
| 26 | Behoben hinsichtlich Kurvenüberschwingern und abweichender Messgeometrie: Polyline mit Stützpunkten, einschließlich Bilbos Rückweg um den nordwestlichen Mirkwood. Geländeabhängige Navigation ist weiterhin nicht vorhanden; Routen sind Rekonstruktionen. |
| 27 | Behoben: Belegost nordöstlich von Dolmed. Übertragung der Geografie des Ersten auf das Dritte Zeitalter bleibt ungefähr. |
| 28 | Behoben: Bard schießt aus der brennenden Stadt, nicht aus einem Boot. |
| 29 | Behoben: erfundene Begegnung/Herausforderung des lebenden Smaug an der Brücke von Dale entfernt. |
| 30 | Behoben: Faramirs Hinterhalt nach North Ithilien verlegt; 2901 ist kein Ende der geografischen Regionen. |
| 31 | Behoben: Durin VI stirbt 1980, Náin I und die Flucht der Überlebenden folgen 1981. |
| 32 | Behoben: unbelegtes Niederbrennen entfernt. Auch die frühere Aussage einer durchgehend verlassenen Stadt war falsch: Der Witch-king besetzte Fornost 1974–75. |
| 33 | Behoben: Elfhelm säubert Anórien; Aragorn entsendet getrennt Männer zur Rückeroberung von Cair Andros. Falsche Éomer-Zuschreibung entfernt. |
| 34 | Behoben: erfundenes Jahr Fo.A. 175 entfernt. „Nach Fo.A. 171“ ausdrücklich als Schlussfolgerung und unbekanntes Ereignisjahr gekennzeichnet; Zahlenwert nur Sortieranker. |
| 35 | Behoben: derselbe Master stiehlt Hilfsgold; Bard wird König von Dale, nicht dessen Nachfolger als Master. |
| 36 | Behoben: unbelegtes Baujahr 2063 und Ende 2941 der Kerker entfernt. 3019 bezeichnet das Ende Dol Guldurs; keine Behauptung kontinuierlichen Gefängnisbetriebs. |
| 37 | Behoben: Validator prüft Koordinaten, IDs, Typen, Quellenformat, Zeitrechnung und Intervalle. Neue Regressionstests prüfen Timeline-Kartenposition, vollständige Ereignisjahre, Reglergrenzen, Reisezuordnung, Routengeometrie, Wiederholungsbesuche, Straßenfaktor und unzulässige Distanzziele. |

## Belege und Prüfgrenzen

- [Faktenprüfung mit Quellen je Finding](audit-facts.md)
- [Geografieprüfung, Quellen und Datenvertrag](audit-geography.md)
- [Distanzprüfung und zurückgenommene Skalierungsbehauptungen](audit-distances.md)

Die Quellenprüfung stützt sich auf Referenzartikel mit Verweisen auf Tolkiens Texte. Sie ist keine vollständige erneute Primärtextprüfung jeder Aussage des Atlas. Exakte Koordinaten vieler Orte sind nicht überliefert. Die bestehende schematische Karte wurde nicht in eine überall maßstabsgetreue Karte oder ein Gelände-Routingnetz umgebaut; diese Grenzen werden sichtbar benannt.

## Verifikation

`npm test`: 16 Tests erfolgreich; Syntax und Datenprüfung für 579 Orte, 9 Reisen, 185 Ereignisse und 239 Bilddatensätze erfolgreich. Alle 312 expliziten Ortsreferenzen stimmen mit den Ortskoordinaten überein.

Browserprüfung: Caradhras-Ereignis erscheint auf Caradhras statt am falschen Kartenrand; T.A. 3019 zeigt alle 36 Ereignisse. Edoras–Minas Tirith zeigt gerundete Schätzwerte und Reisezeiten mit Straßenaufschlag. White Tower als Ziel zeigt keine irreführende Innenortdistanz. Bilbos Verlauf ab Forest Gate am nördlichen Elf-path visuell geprüft. Keine Warnungen oder Fehler im erfassten Browserlog.
