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
src/raster-cache.js     Incremental nearby-terrain cache with a fixed pixel budget
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

The large SVG intentionally remains inline as the source artwork and fallback.
The renderer uses an overview bitmap during gestures and prepares sharper
512-pixel terrain tiles in idle time, starting with the viewport and then
one surrounding ring. Geometry outside each tile is omitted. Only one tile is
prepared at a time, with longer pauses after expensive draws; gestures and hidden
tabs pause the queue. Panning and zooming move existing bitmaps. At rest, cached
terrain is used only when it fully covers the viewport at the actual display pixel
ratio. Otherwise the sharp vector map returns after the gesture, including when
idle work is delayed or the memory budget cannot accommodate full-resolution tiles.

The cache retains at most 20 tiles on mobile/touch devices (about 21 MB of RGBA
pixels), or 32 on desktop (about 34 MB), in addition to the existing 16/50 MB
overview bitmap. A pending decode and browser bookkeeping add transient overhead.
Eviction releases canvas storage; timeline and artwork-layer changes invalidate
both caches. Labels, journeys and interactive miniatures remain separate.
Reduced-resolution tiles remain movement previews; they never determine the
sharpness of the resting map.

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
`/?place=rivendell`, `/?journey=fellowship`, `/?event=EVENT_ID`, and optional
`age=TA&year=3019` for place/journey views. Browser history restores selections.

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
