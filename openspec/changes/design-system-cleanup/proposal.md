# Change: Design-system cleanup — one modern template every tool follows

## Why

The catalog is uniform enough to feel like one product, but it grew tile by tile over
~1,680 specs, and the shared layer shows its age in three ways:

1. **No written contract.** Until now there was no global design doc. Visual rules were
   scattered across numbered specs (spec-v9 region order, v72 touch targets, v73 color
   scheme, v751–v759 the home box) and an append-only `styles.css`, so each new tile
   reinvented spacing and chrome from whatever neighbor it was copied from. `docs/design.md`
   now fixes that; this change makes the catalog match it.
2. **Dated and inconsistent components.** The file-reader tiles mount the raw native
   `<input type="file">` (`Choose Files / No file chosen`), which is the least modern element
   on the site. Enum choices that should be a two-tap segmented control are long `<select>`
   popups. Result bands that should read at a glance as a status chip render as plain
   sentences. Multi-output tiles stack numbers as paragraphs instead of a stat grid.
3. **Text-formatting drift.** Some denser views (preview tables, long interpretation bands,
   X12/CSV output) show overlapping or cramped text and inconsistent spacing because they
   predate the shared `.tool-body` rhythm and `.table-scroll` rules.

This is a presentation-only cleanup. No compute, threshold, citation, example value, or MCP
adapter changes — the numbers every tile produces stay byte-identical.

## What Changes

- **Adopt the modern component set** from `docs/design.md` §5 as shared classes in
  `styles.css`, tokens only: filter chip, segmented control, status/severity chip, input
  chip, assist chip; stat/metric tile, dropzone card; skeleton/progress, empty, and error
  states. No per-tile CSS.
- **Replace the raw file input** on every file-reader tile with the shared `.dropzone` card
  (drag/drop, icon, hint, `drop-active` state, removable file chips), built on the existing
  `uploadWorkbench()` / `intake.js` plumbing.
- **Upgrade in place, archetype by archetype.** Calculators: answer card gains an optional
  status chip when the tile outputs a band; short enums become segmented controls; multi-output
  tiles use the stat grid. File readers: dropzone + parse progress. Specialized workbenches
  compose the shared components.
- **Fix the formatting defects** a finder sweep surfaces: overlapping/cramped text, headings
  out of order, spacing that bypasses the token scale.
- **Add two guard specs** so the cleanup cannot regress: a no-inline-style / no-per-tile-CSS
  check, and a status-chip-has-text (never color-only) check. Extend the existing mobile and
  answer-said-once sweeps to the new components.

## Impact

- **Propose-first, docs-only.** This change ships no catalog-count or code change. A later
  session (or waves of them) executes `tasks.md` against the real views.
- **Affected:** `styles.css` (new shared component rules), `views/upload-workbench.js`,
  `views/intake.js`, `views/home-files.js`, the ~9 upload tiles, the specialized workbenches
  (`views/pa-lint.js`, `views/rx-match-workbench.js`, `views/record-panel.js`), and the band-
  outputting calculators. `app.js` `renderToolView` gains optional answer-card status-chip and
  stat-grid helpers.
- **Not affected:** `lib/*` computes, `lib/meta.js` examples/citations, `mcp/adapters/*`,
  catalog count, deep-link hash format, byte-identical reproduction.
- **Governance:** `docs/design.md` becomes the referenced source of truth; `CONTRIBUTING.md`
  and `openspec/project.md` point to it.
