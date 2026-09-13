# Contributing

Thanks for helping improve Middle-earth Atlas.

## Development workflow

1. Fork the repository and create a focused branch.
2. Serve the repository with `python3 -m http.server 8000`.
3. Make and manually verify your changes in a modern browser.
4. Run `npm test` before opening a pull request.
5. Describe the user-visible change and the checks you performed.

The project intentionally has no build step or package dependencies. Please do
not add a framework or build tool for a change that can be made with the
existing HTML, CSS, and JavaScript.

## Map performance checks

`npm test` includes dependency-free regression tests for viewport caching,
touch frame batching, and timeline update cancellation. For rendering changes,
also check dragging, pinch-to-zoom, releasing one finger during a pinch,
timeline scrubbing/presets, and viewport resizing in a browser. Test on a real
phone when possible; CPU-throttled desktop emulation does not reproduce its GPU.
For map gestures, also test WebKit, interruption during the sharp-map fade, and
reduced-motion settings. The bitmap must remain aligned with the vector map.

Keep viewport measurements in `measureViewport()` and avoid layout reads after
map style writes. Touch rendering is frame-batched; release flushes the final
position. The movement bitmap uses a 4 MP budget on narrow/touch screens and
6 MP on desktop; the stationary map remains vector-sharp.
Move the bitmap via CSS transforms, not per-frame canvas drawing. Keep the static
SVG layers hidden during movement and the visible overlay composited. On release,
restore the vector map before fading out the bitmap; new input cancels that fade.

With an optional `playwright-cli` installation, run the repeatable mobile touch
benchmark in a dedicated local browser session:

```sh
playwright-cli -s=atlas-perf open http://localhost:8000 --browser chrome
playwright-cli -s=atlas-perf run-code "$(cat scripts/measure-mobile.js)" --raw
```

The script resets storage and offline caches for the local test origin. It uses
390×844, DPR 2, 4× CPU slowdown, a fixed map view, and trusted CDP touch input for
sheet dragging, native scrolling, pan, pinch, and cancellation. Compare against
an unchanged checkout served on localhost:8001 with the same browser and fonts.
It reports frame intervals and browser layout/style/task counters, including a
600 ms settling window. Input delivery waits for browser acknowledgement, so
slow runs take longer; these are work/latency comparisons, not a fixed-duration
FPS test. Screenshots are written to ignored `output/playwright/`.

## Data changes

Place, journey, and timeline records live in `src/data.js`. Keep IDs stable,
use unique lowercase kebab-case IDs for new places, and provide numeric map
coordinates. When changing historical or geographical information, include a
source in the pull-request description.

Run `npm test` after editing data. The validator checks required fields,
duplicate IDs, journey legs, image references, and asset files.

## Image changes

Image metadata lives in `src/images.js`, and the corresponding WebP files live
in `assets/images/`. The object key must match an existing place ID and the
asset path must point to a committed file.

Content images are not covered by the MIT License. Only submit an image when
its use in this project's context is lawful, and include its creator, source,
rights status, and any required attribution. By contributing an image, you are
not granting downstream users rights that you do not hold. See
`THIRD_PARTY_NOTICES.md`.

## Scope and style

- Keep changes small and reviewable.
- Preserve keyboard navigation and accessible labels.
- Avoid adding external dependencies unless they solve a clear, documented
  maintenance problem.
- Do not commit generated editor files, credentials, or local server output.

## Reading pages and public data

Keep place, journey, and event IDs stable, even when titles or dates change.
Add new event IDs explicitly to `src/data.js`; never derive public IDs from
array positions. The static generator reads the existing dataset without
introducing a runtime build requirement.

After editing data, `content/publication.json`, `content/references.json`, or
content templates, run `npm run generate` and commit the generated changes.
`npm test` checks output freshness as well as links, metadata, export identity,
and URL interpretation. Do not hand-edit generated HTML or JSON. The generated
metadata block in `index.html` is managed by the same command; the rest of the
map shell remains hand-maintained.

Publish additional reading pages only when descriptions, sources and useful
relationships are present. Distinguish reading references from individually
verified claims. Keep uncertainty notices next to reconstructed dates or
positions, including JSON exports. Null values must not turn into invented
historical dates. Do not treat map coordinates as latitude/longitude.

Check new pages without JavaScript and at mobile widths. Changes to navigation
must preserve direct links, browser Back/Forward, keyboard focus and the
existing map-gesture behavior. For breaking export changes, add a new version
under `data/`; preserve existing versioned contracts.
