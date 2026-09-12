# Distance and journey audit (2026-09-12)

## Findings re-evaluated

- **2:** A global exact mile-per-unit scale is unsupported. The original comparison of Edoras–Minas Tirith straight-line geometry against a travelled road length did **not** establish a 25% geographical error. Nor is a text estimate a precise calibration control. Therefore no arbitrary global rescaling is applied. Macro distances remain explicitly schematic estimates, rounded to about two significant figures, including the scale bar and Nearby values. Small sites/interiors and area anchors no longer produce numerical distances or travel times.
- **3:** Confirmed proximity/substr matching confused nearby or co-located places with actual visits. Both place pages and directions now use only explicit journey `placeId` links. Highlighting uses the same ID. Repeated visits select the shortest mapped intervening segment; dates remain chronological even with reversed selections.
- **4, 26:** Confirmed the spline and reported polygon length differed. Journeys now render and measure the same polyline. Optional `via` points on an arriving leg carry explicit bends, including in progress displays and partial-route measurements. Sparse routes remain reconstructions, not measured roads: straight segments cannot guarantee obstacle avoidance without additional geography.
- **5:** Confirmed the advertised one-third road allowance was absent from time calculations. Scenarios now calculate `(mapDistance * 4 / 3) / dailyPace` and disclose that road length and paces are illustrative assumptions.
- **6:** The former 100 miles/day attribution to Théoden is unsupported. The earlier audit's proposed approximately 60 miles/day is also not a sufficiently established universal replacement: mileage depends on start/end and route reconstruction. Named character/army claims (including Eagle and Shadowfax flight/riding times) are removed. Generic 18/40/60 mile/day scenarios are explicitly hypothetical.
- **24:** Coordinate mismatch alone is not always an error: visiting a river means visiting a crossing, not its region-label anchor. Stable IDs identify definite site visits; a route's regional crossings may retain their own independently justified coordinates. Data alignment is handled by the geography audit.
- **25:** Confirmed area-label anchors are not endpoints for meaningful physical distances. Their directions panel now explains why no distance/time is supplied and suggests major point landmarks.

## Evidence and scope

Code confirmed the 14-unit matching radius, 1-unit-to-mile conversion, missing road factor, Catmull–Rom interpolation, and direct segment summation. These are deterministic implementation findings.

[The Ride of the Rohirrim](https://tolkiengateway.net/wiki/The_Ride_of_the_Rohirrim) identifies a multi-day journey and detour through the Woses' paths; it does not establish a standard 100-mile daily rate. Primary narrative reference: *The Return of the King*, Book V, chapters 3 and 5, and Appendix B, 9–15 March 3019.

[Minas Tirith](https://tolkiengateway.net/wiki/Minas_Tirith) documents a compact seven-level city. The map's enlarged placement of individual halls and gates is therefore unsuitable for inter-site mileage. No unsupported precise city diameter is used as a new calibration.

The revision intentionally preserves rough map estimates as a useful orientation feature. It does not claim to transform the existing schematic drawing into a uniformly surveyed map. Rank-four markers and dwelling/hall/inn/tomb/gate types are conservatively excluded because no consistent local scale is supplied.

Regression coverage: exact-visit matching versus co-location; intermediate geometry and subroute start handling; repeated visits; the actual road-time allowance; ineligible distance targets and estimate formatting. These tests exercise the application functions directly and run under `npm test`.
