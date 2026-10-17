# spec-v1643: Retired tool pages redirect to their survivors

> Status: **SHIPPED (2026-10-17).**

## What was wrong

When a tile is retired as a duplicate (spec-v914, v948, v973, v1642), its hash link (`#old-id`) redirects
in the browser and agents resolve the old id through `data/id-aliases.json`. Its pre-rendered page did
not. The build stops writing `/tools/<old-id>/`, and the Worker's single-page-application fallback then
answers that address with the home page and a 200. On the live site, `/tools/kings-score/` served the
home page. That address is the one a search result or a bookmark holds.

## What it does

`scripts/build-redirects.mjs` runs in `npm run build` right after the tool pages are written. For each
alias it adds two lines to `dist/_redirects`, one with the trailing slash and one without, each a 301 to
`/tools/<canonical>/`. An alias whose survivor has no page is left out, so it cannot send anyone to the
home page again. All 14 retired ids are covered.

## Proof

- `test/unit/build-redirects.test.js`: every alias produces both lines and points at a tile still in the
  catalog, and no retired id is back in the catalog.
- Wrangler's own parser accepted the file ("Parsed 28 valid redirect rules"). Its local server would not
  start in the build sandbox, so the live check is `curl -sI https://sophiewell.com/tools/hatch-af/` after
  the deploy.
