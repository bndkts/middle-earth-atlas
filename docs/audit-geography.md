# Geography and route recheck (12 September 2026)

The earlier audit mixed confirmed defects, schematic-map limitations, and claims stronger than their sources. Coordinates below are editorial placements within this SVG, not surveyed coordinates or canonically exact mile positions.

| Finding | Recheck and resolution |
| --- | --- |
| 1 | Confirmed: all timeline `y` values were dates, not map positions. Every event now has separate `absoluteYear`, `x`, `y`, and an explicit `placeId`. Regional events use approximate location anchors. |
| 2 | Partly confirmed. The SVG cannot support exact mileage at every scale. In particular, expanded city interiors are not a mile-scale plan. The original Edoras comparison also mixed the 102-league journey statement with straight-line distance; it cannot justify a universal rescaling. Distances must be schematic estimates and interior/area anchors must not be treated as exact distance endpoints. |
| 7 | Confirmed mismatch between the Elf-path drawn in the SVG and Bilbo's route. Forest Gate is the northern path entrance, not the Old Forest Road entrance. The journey now follows the path control locations through the Enchanted River crossing; the river's label anchor is not treated as its crossing. The spider encounter belongs after that crossing. Exact encounter positions remain reconstructed. |
| 8 | Confirmed relationship: Wellinghall is in the flanks of Methedras. Revised place placement is approximate. The earlier numerical error of “104 miles” was only 104 SVG units and should not be stated as a measured geographic error. |
| 9 | Confirmed relationship: Grey Wood is east of Amon Dîn and north of Mindolluin, not near Halifirien. Revised placement is approximate. |
| 10 | Qualified. Tolkien places Thorin's hall in the southern Blue Mountains beyond the Lune. Whether this means south of the Gulf is not unambiguously established by that wording. A precise relocation must be labelled a reconstruction, not a canonical correction. |
| 11 | Confirmed relational inconsistency: the Great Barrow belongs in the Barrow-downs east of Bombadil's house. Exact coordinates are unknown. The Fellowship leg is now linked to the Great Barrow, rather than a regional centre. |
| 17 | Gwathló near Tharbad is supported; the river-mouth identification confuses Ciryatur's landing place with the battle. Tolkien Gateway and Tolkiendil date the battle 1701; Encyclopedia of Arda uses probably 1700. Atlas adopts 1701 with the uncertainty recorded here. |
| 24 | Confirmed duplicate coordinate problem for actual point locations. Journey stops now link by explicit place IDs and use those coordinates. River crossings, traversed regions, passing points and reconstruction anchors remain separate approximate waypoints rather than being moved to regional label centres. |
| 26 | Catmull–Rom smoothing is not terrain-aware. Render and measurement should share the waypoint polyline. Intermediate `via` points describe a schematic detour before the next named stop, including Bilbo's return around northwest Mirkwood. This removes curve overshoot; it does not claim turn-by-turn route precision. |
| 27 | Confirmed: Belegost lies northeast of Dolmed, Nogrod southeast. Translating First Age geography onto the Third Age basemap remains approximate. |

Additional timeline corrections: the Battle of the Plains remains **1856**. The earlier proposed 1851 correction was wrong: attacks began in 1851, the named battle followed in 1856. Shelob's attack is 13 March 3019. Durin VII's invented Fo.A. 175 date is removed; “after Fo.A. 171” is explicitly an inference from the copying of the Red Book, not an attested bound or a known event year. Its numeric value is a sorting anchor and the UI uses the uncertainty label.

## Sources consulted

- [Battle of the Plains](https://tolkiengateway.net/wiki/Battle_of_the_Plains), citing *Unfinished Tales*, “Cirion and Eorl”.
- [Battle of the Gwathló](https://tolkiengateway.net/wiki/Battle_of_the_Gwathl%C3%B3), [Tolkiendil chronology](https://www.tolkiendil.com/encyclo/evenements/2a/guerres/bataille_du_gwathlo), and [Encyclopedia of Arda alternative dating](https://www.glyphweb.com/arda/b/battleofthegwathlo.html).
- [Elf-path](https://tolkiengateway.net/wiki/Elf-path), citing *The Hobbit*, “Flies and Spiders” and the Map of Wilderland.
- [Wellinghall](https://tolkiengateway.net/wiki/Wellinghall), citing *The Two Towers*, “Treebeard”.
- [Grey Wood](https://tolkiengateway.net/wiki/Grey_Wood), and *The Return of the King*, “The Ride of the Rohirrim”.
- [Thorin's hall](https://tolkiengateway.net/wiki/Thorin%27s_Halls), including its distinction between the published location and the abandoned 1960 rewrite.
- [Dolmed](https://tolkiengateway.net/wiki/Dolmed), [Belegost](https://tolkiengateway.net/wiki/Belegost), and *The Silmarillion*, “Of the Sindar”.
- [Durin VII](https://tolkiengateway.net/wiki/Durin_VII), especially the note identifying the post-171 date as an inference.

## Data contract

`timeline.absoluteYear` is the chronology/sorting coordinate. `timeline.x/y` are map coordinates. `placeId` is an explicit association, never a proximity match. `approximate` indicates a reconstructed/area anchor. `timeLabel` overrides numeric year display for uncertain chronology. A journey leg's optional `via` array contains ordered `{x,y}` route support points traversed **before** that leg; these points are not named visits.
