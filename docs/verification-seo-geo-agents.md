# SEO, GEO and agent implementation — verification

Date: 12 September 2026. The implementation is prepared in the working tree;
no deployment, commit or Search Console change was performed in this task.

## Implemented

- 22 featured place guides and all 9 journey guides, plus place/journey
  directories, methodology and data documentation. The place directory links
  all 579 places; entries without a reading page open on the map.
- Shared, dependency-free static generation with an explicit publication list,
  tracked outputs, stale-file checking and scoped source references.
- 36 canonical HTML URLs in the sitemap; robots.txt, social metadata and an
  original 1200 × 630 PNG preview, WebSite/BreadcrumbList JSON-LD.
- Direct place, journey, event and age/year links, browser-history restoration,
  input validation and useful invalid-link feedback.
- Named layer switches, filter state, keyboard-operable waypoints/events,
  exact age/year input, spoken slider dates and focus management.
- Versioned JSON for 579 places, 9 journeys and 185 events, with persisted IDs,
  full source links, revision hashes, coordinate/calendar and reuse notes.
- Docker static-file inclusion; nginx text compression and revalidation for
  stable filenames. Reading pages do not load the map or its scripts.

## Automated checks

`npm run generate`, `npm test`, and `git diff --check` were used. The tests
include existing map/data checks and new coverage for deterministic generation,
missing/duplicate IDs, generated HTML links, canonicals, JSON-LD parsing,
export identities/uncertainty, era boundaries, invalid URL states, coalesced
history updates and actual social-image dimensions.

The existing timeline test doubles were extended for the newly exposed
accessibility and URL interfaces. Existing assertions remain in place.

## Browser and HTTP checks

Using the locally installed Playwright CLI, against a Python static server:

- Chromium: Rivendell → search Moria → Back → Forward → Reload; all restored
  the intended place. A delayed search callback that overwrote selection was
  found and fixed. Search panels no longer add spurious history entries.
- Chromium: all 30 Fellowship waypoints are native buttons; keyboard activation
  works. Road layer toggling retains focus and reports checked state.
- Chromium: exact S.A. 1697 entry, combined place/year link, invalid place link
  and the Caradhras event link work.
- JavaScript disabled at 390 × 844: Rivendell, Fellowship and the atlas entry
  remain navigable. Rivendell has no horizontal overflow.
- Mobile Chromium: touch pan, pinch, one-finger release and resize completed
  without JavaScript errors. Reduced-motion rendering was exercised.
- WebKit: place links, search/Back, pan, zoom with a subsequent gesture, resize
  and exact year entry passed, without JavaScript errors.
- All 36 sitemap pages returned 200 locally. An unknown place page returned
  404. The place JSON response used `application/json`.
- Mobile reading page, journey map, timeline and social preview screenshots
  were inspected. Local screenshot artifacts live under ignored
  `output/playwright/`.

These are desktop browser/emulation checks, not a test on a physical phone.
A small number of browser screenshot attempts timed out in the original
headed tab; isolated contexts produced the inspected captures successfully.

## Local performance observations

Single local Chromium sample, viewport 390 × 844, no network/CPU throttling,
reduced motion. LCP observed after load with an additional 800 ms observation
window. These are diagnostic lab observations, not field Core Web Vitals or
Lighthouse scores, and not a before/after benchmark.

| Page | HTML bytes | Script requests | Observed LCP | Observed CLS |
|---|---:|---:|---:|---:|
| Rivendell | 5,991 | 0 | 104 ms | 0 |
| Fellowship | 15,235 | 0 | 56 ms | 0 |
| Interactive atlas | 1,201,366 | 5 | 956 ms | 0.0042 |

No horizontal overflow was observed for these three views. The large map
remains inline by design; reading pages provide a lightweight content path.

## Live baseline and remaining external checks

Public HTTP checks succeeded after allowing network access:

- `https://atlas.bag-end.eu/`: HTTP 200, `text/html; charset=utf-8`.
- HTML was already gzip-compressed when requested with compression support.
- The existing response exposed ETag and Last-Modified, without an explicit
  Cache-Control header in the observed response.
- `/robots.txt` and `/sitemap.xml`: HTTP 404 on the existing deployment.

The current deployment predates these changes. The following require the
actual release or external account/environment access:

- Deploy the prepared files, then recheck live redirects, canonical metadata,
  sitemap URLs, JSON MIME types, compression and Cache-Control headers.
- Run the Docker/nginx image validation in an environment with Docker. Neither
  Docker nor nginx was available locally; Python HTTP checks do not validate
  nginx runtime behavior.
- Inspect actual CDN/bot policies; a normal HTTP response alone cannot prove
  that authenticated search crawlers are permitted.
- In Search Console, submit the sitemap and inspect pilot URLs once deployed.
  No Search Console connector or account data was available in this task.
- Record index coverage, impressions, clicks, relevant queries and available
  field performance data after recrawling. Optional AI-referral tracking remains
  a measurement decision, not an added analytics dependency.

No claims are made about current rankings, actual index coverage, real-user
Core Web Vitals, or guaranteed inclusion in generative answers.
