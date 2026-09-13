# Middle-earth Atlas

An interactive, illustrated map of Middle-earth with searchable places,
historical events, map layers, and character journeys. It is a static site:
there is no backend, build step, or runtime package dependency.

[Open the live atlas](https://atlas.bag-end.eu)

## Run locally

Serve the repository over HTTP and open the shown URL:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Opening `index.html` directly is not
supported because the browser needs to load the separate source and asset
files.

To run the repository checks, install Node.js 20 or newer and use:

```sh
npm test
```

No `npm install` is required.

## Project structure

```text
index.html              Document shell and inline interactive map SVG
src/app.js              Application and interaction logic
src/data.js             Places, journeys, and timeline data
src/images.js           Image metadata and asset paths
src/details.mjs         Lazy-loaded close-up miniatures and viewport culling
src/styles.css          Interface and layout styles
src/map.css             SVG map styles used by the renderer
assets/images/          Illustrated place images
assets/texture.png      Map paper texture
nginx.conf              UTF-8 static-server configuration
scripts/                Repository validation
```

The inline SVG remains the source artwork. One overview bitmap is reused during
gestures; the culled vector map always returns at rest, so detail stays sharp at
any display pixel ratio. Panning and zooming never prepare additional SVG images.
The overview uses at most about 16 MB of RGBA pixels on mobile/touch devices or
24 MB on desktop. Browser rendering overhead is additional to those budgets.
Decoded images are detached after drawing; hiding the page cancels pending work
and releases the canvas. Timeline and artwork-layer changes rebuild the preview.
Labels, journeys and interactive miniatures remain separate. Marker emphasis
animations finish after two pulses, allowing a settled map to stop repainting.

Zoom in closely to find **Little discoveries**: original SVG miniatures with
short stories, available by touch or keyboard and switchable in Layers. Their
small module is warmed during idle time (unless Data Saver is enabled); artwork
appears at zoom 3.2, with finer discoveries at 4.4. Only nearby artwork is mounted, its screen size is capped, and the layer
is hidden during gestures without changing the movement bitmap's memory budget.
With the timeline enabled, dated miniatures follow the selected year. The
miniatures are illustrative references, not precise geographical records.

## Docker

The included image serves the static site with nginx:

```sh
docker build -t middle-earth-atlas .
docker run --rm -p 8080:80 middle-earth-atlas
```

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the
development workflow and the rules for data and image contributions.

## Licensing and trademarks

The source code and documentation are available under the
[MIT License](LICENSE).

The images in `assets/images/` are copyrighted fair-use content and are
explicitly excluded from the MIT License. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) before copying or
redistributing the project.

This is an unofficial fan project. It is not affiliated with or endorsed by
the Tolkien Estate, Middle-earth Enterprises, or their licensees.

## Reading pages, discovery and data

The map is complemented by static place and journey guides at `/places/` and
`/journeys/`, a source/method page at `/methodology/`, and documented JSON
exports at `/data/`. Reading pages work without JavaScript. The map supports
`/?place=rivendell`, `/?journey=fellowship`, `/?chapter=lotr-b1-c01`, `/?event=EVENT_ID`, and optional
`age=TA&year=3019` for place/journey views. Browser history restores selections.

After the first online visit, the interactive atlas works offline. Place artwork
and reading pages are cached as they are visited; offline typography falls back
to the system-font stack if Google Fonts is unavailable.

After changing atlas data, publication settings, references, or templates, run:

```sh
npm run generate
npm test
```

`content/publication.json` selects the reading pages and canonical production
origin. `content/references.json` holds scoped reading references. The
HTML fragments in `content/` supply methodology and data documentation.
`scripts/generate-content.mjs` generates and tracks HTML, sitemap, robots.txt,
publication IDs, and JSON exports. Commit generated output together with its
inputs. Normal hosting still needs no build step or dependencies. `npm test`
checks that output is current, links resolve, and URL/data contracts agree.

The original social preview source is `assets/atlas-social.svg`; its raster
counterpart is `assets/atlas-social.png` (1200 × 630). It uses no third-party
illustration. nginx serves stable assets with revalidation and compresses text
responses. Deployment should include all directories copied by the Dockerfile.

See `docs/plan-seo-geo-agents.md` and `docs/verification-seo-geo-agents.md` for
implementation scope, verification results, and remaining live measurements.
