# spec-v757.md — The catalog gets a page

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> New build step + one page. No tile added, no compute changed. Catalog stays **1564**.

## Why

[spec-v751](spec-v751.md) removed the browse nav, which was right: the home page takes a question
now. But search only works if you can name the thing you want, and a reader who cannot — a new
nurse, someone browsing to find out what this even is — was left with no way in.

The capability already existed and was simply hidden: focusing the search box lists all 1564 A-Z.
It was undiscoverable, unlinkable, and uncrawlable.

There was a second, unrelated cost. `/tools/<id>/` existed only in `sitemap.xml` and in whatever
`Related tools` happened to pick, and `/tools/` itself was a **404**. 1564 pre-rendered pages had
no hub.

## What it does

| | |
|---|---|
| **The page** | `/tools/`, every tile, grouped by the catalog's own specialty taxonomy. |
| **Why grouped, not A-Z** | A flat list of 1564 names is not browsable. The groups let a reader find the neighbourhood before the name. |
| **Counts** | Per group, computed from `UTILITIES` at build time — so nothing here can drift the way a hand-typed count does, and no `check-catalog-truth` surface is needed. |
| **Jump nav** | One pill per specialty at the top; a reader 900 names deep can get back without scrolling for it. |
| **Primary action** | *Ask for it instead →* in the accent colour. Browsing is the fallback, and the page says so. |
| **Entry point** | A footer badge, one click away, never on the path of the reader who types. |
| **Crawl graph** | Every `/tools/<id>/` page links back to `/tools/`; `/tools/` links out to all 1564. |

## The home page also gets a floor

Top-aligned, the box clung to the header with a screen of dead space under the footer — the shape
of a page that ran out of content rather than one that only ever had a question to ask. The home
container now has a floor to centre against.

**Scoped to the home container, and that scoping is the whole lesson.** The first cut made `<body>`
a flex column to pin the footer, which is the usual idiom. A flex item does not shrink past its
content, so every tile with a wide reference table — `anticoag-reversal`, `peds-dose`, the whole
billing group — stopped being able to scroll that table inside its own box and pushed the document
to **385px inside a 320px viewport**. Twenty tiles in the whole-catalog sweep, from one line of CSS.

Two follow-up patches failed before the right answer showed up, and both failed for instructive
reasons:

| Attempt | Why it did not work |
|---|---|
| `min-width: 0` on the flex item | Necessary but not sufficient. |
| `flex: 1 0 auto` | The middle `0` is **flex-shrink**, so the item still could not shrink. |
| **Scope it to the home container** | The document stays in normal flow. Only one page changes. |

1564 pages restructured for one page's whitespace was the wrong trade twice over.

## Where it lives

- `scripts/build-tools-index.mjs` — **new.** Writes `dist/tools/index.html`.
- `scripts/build.mjs` — wired in after `build-tool-pages.mjs`.
- `scripts/build-sitemap.mjs` — `/tools/` listed.
- `scripts/build-tool-pages.mjs` — the `Browse all tools` line on every tile page.
- `index.html` — the `.all-tools-badge` footer entry.
- `styles.css` — `.tools-index`, `.ti-*`, `.all-tools-badge`, and the home-container floor.

## Gotchas

- **Do not make `<body>` a flex container.** See above. Anything that needs to shrink inside it —
  a wide table with its own `overflow-x: auto` — stops being able to.
- The group label map is the page's own copy of `GROUP_LABELS`. A group present in `UTILITIES` but
  missing from the map still renders, under `Group <letter>`, so a new group appears on the page
  rather than vanishing from it.
- `.ti-list` uses CSS `columns`, not grid, so names flow down each column in reading order. It
  drops to one column under 600px; a multi-column list is exactly the shape that overflows a narrow
  phone if the column minimum is set too wide.

## Proof

- `test/integration/static-pages-mobile.spec.js` — `/tools/` at 320px; and a new
  `tools index` check that the page lists **every** pre-rendered tile, that the per-group counts
  sum to the catalog, that the jump nav reaches every group it names, and that the primary action
  still points at `/`.
- `test/integration/smoke.spec.js` — `spec-v757 home: the footer offers the whole catalog`.
- `test/integration/mobile-no-hscroll.spec.js` — the whole-catalog 320px sweep, which is what
  caught the `<body>` flex regression and confirmed the fix.
- Full chromium suite: **130 passed**, including the 25.5-minute whole-catalog interaction sweep
  and the 24.8-minute numeric sweep.
