# Regional geography review — 13 September 2026

This is a targeted topology pass, not a certification of all 579 coordinates.
Read each region as one composition: coastline → river → terrain extent → road
or journey → place anchor → lettering. Do not fix only the marker.

| Region | Relationships covered | Evidence and limits |
| --- | --- | --- |
| Eriador / Minhiriath | Eryn Vorn lies south/east of the Baranduin mouth; river fill, label path, estuary shading and all seven forest layers agree; woodland remains inside land | Existing SVG geometry tests and [Eryn Vorn](https://tolkiengateway.net/wiki/Eryn_Vorn); see `eryn-vorn-geography.md` |
| Shire / Barrow-downs | Great Barrow east of Bombadil; Hobbiton interiors explicitly display-separated | Existing relative placements retained; interior spacing is not a distance measurement |
| Blue Mountains | Belegost north of Dolmed; Nogrod south | [Belegost](https://tolkiengateway.net/wiki/Belegost), [Nogrod](https://tolkiengateway.net/wiki/Nogrod); First Age sites projected onto later geography, not exact surviving ruins |
| Rhovanion | Forest Gate, the Elf-path and Bilbo's journey share the existing reconstructed crossing route | Existing route validation retained; Enchanted River's label anchor is not its crossing; see `audit-geography.md` |
| Rohan / Fangorn | Wellinghall tied to Methedras, not the forest centre; woodland styling changes do not move tree anchors | [Wellinghall](https://tolkiengateway.net/wiki/Wellinghall); an anchor on the mountain, not an exact hall location |
| Gondor / Mordor | West-to-east sequence Minas Tirith → Osgiliath → Minas Morgul → Barad-dûr; Grey Wood south of Amon Dîn and north of Mindolluin | [Grey Wood](https://tolkiengateway.net/wiki/Grey_Wood), citing the published regional map and “The Ride of the Rohirrim”; no exact mileage inferred |
| Far north / Rhûn / Harad | No new positional claims or moves in this pass | Sparse-source areas require individual source review before relocation; no blanket “verified” status |

`scripts/geography.test.mjs` locks the listed relative marker relationships;
`scripts/terrain.test.mjs` and `scripts/feedback.test.mjs` cover the existing
Eryn Vorn artwork/river contract and chapter/route associations. Passing a marker
test is not proof that every surrounding drawn feature is canonically correct.

## Position contract

The optional per-place `position` record describes the **reason**, not a numeric
confidence score: `text-reconstruction`, `historical-reconstruction`,
`area-anchor`, or `display-offset`. The existing `ap` flag remains compatible.
Seven reviewed entries have notes in this pass. Other approximate entries are
explicitly unclassified in the UI, rather than automatically attributed to an
uncertain text. Notes are preserved in the open-data export.

## Required evidence for subsequent geographic edits

1. Record the named place and book/map reference, separating adaptations.
2. Inspect river and coastline paths, forest/mountain footprint, roads and labels
   together at overview and regional zoom; check timeline variants if relevant.
3. Write a failing relationship/geometry test before changing a confirmed defect.
4. Move all affected artwork, anchors and route references together.
5. Recheck culling buckets, regenerate data, and use the affected UI in a browser.

No coordinates were relocated during this pass. The secondary pages above were
consulted again; this is not a fresh inspection of every original book/map plate.
