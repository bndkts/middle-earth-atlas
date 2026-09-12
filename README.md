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
src/styles.css          Interface and layout styles
src/map.css             SVG map styles used by the renderer
assets/images/          Illustrated place images
assets/texture.png      Map paper texture
nginx.conf              UTF-8 static-server configuration
scripts/                Repository validation
```

The large SVG intentionally remains inline: the application manipulates its
elements directly and rasterizes parts of it while the map is moving.

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
