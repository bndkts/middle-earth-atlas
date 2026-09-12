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
