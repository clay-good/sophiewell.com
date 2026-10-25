# Design — design-system cleanup

The visual contract is `docs/design.md`; this file records the build decisions for
executing the cleanup against it.

## D1. Shared classes only, tokens only

Every new component is a class in `styles.css`, defined once, built from tokens. No
inline styles, no per-tile stylesheets, no hard-coded hex/px. Rationale: one fix must
lift every tile, and the no-framework/append-only sheet only stays maintainable if
components are shared. A guard (`no-inline-style.spec.js` / lint rule) enforces it.

## D2. Replace the native file input with `.dropzone`

The raw `<input type="file">` is wrapped, not removed (it stays the actual input for
a11y and keyboard). The `.dropzone` card provides the visible surface: dashed border,
upload icon, "drop files or choose" hint, a `drop-active` teal outline (reusing the
existing `.intake-drop.drop-active` / `.task-hero.drop-active` behavior), and a list of
`.chip--input` file chips with a remove control after selection. Built on
`uploadWorkbench()` and `intake.js`; the worker-parse path and 50 MB limit are unchanged.

## D3. Segmented control vs select

A `<select>` stays the right control for long or open lists (specialty, drug, formula
with many variants). Convert to `.segmented` only when there are 2–4 mutually exclusive
options that fit on one row at 320px (sex M/F, a two-way formula toggle). Semantics: a
radiogroup (`role="radiogroup"` + `role="radio"`/`aria-checked`) so the choice is
announced and keyboard-navigable. The canonical-unit/first-option invariants that MCP
adapters depend on are untouched — this changes the control, not the value model.

## D4. Status chip on the answer card

When a tile outputs an interpretation band (low/moderate/high/critical, or a named
category), the answer card MAY show a `.chip--status` beside the value. Color comes from
a severity token; **the band name is always in the text**, so the chip is never
color-only. The band string is the one the tile already computes — no new thresholds,
no re-derivation. Tiles with no band show no chip.

## D5. Stat grid for multi-output tiles

Tiles that emit several numbers (e.g. a CrCl tile showing actual/ideal/adjusted) use a
`.stat` grid: each cell is a big value + caption. Replaces stacked paragraphs. Still
inside `#q-results` / the result region; the primary answer stays largest.

## D6. File-reader progress

The worker parse is async, so the reader shows a determinate progress/skeleton state
between "file chosen" and "results", never an open-ended spinner. Synchronous
calculators get no skeleton — their answer is instant and a loading state would be a lie.

## D7. Execution order (waves)

1. Land the shared classes + guards in `styles.css` (no view touched yet; visually inert).
2. Migrate the file readers to `.dropzone` (highest-visibility dated element).
3. Sweep calculators: status chip, segmented controls, stat grids, where applicable.
4. Fix the formatting-defect list from the finder sweep.
5. Migrate the specialized workbenches.
6. Turn on the guard specs in `release:check`.

Each wave is independently shippable and leaves the catalog count and every computed
value unchanged. A finder probe (`design-conformance-probe.spec.js`, non-asserting)
lists remaining raw file inputs, color-only bands, inline styles, and off-scale spacing
so waves can be sized.

## D8. What this change does NOT do

No compute, threshold, citation, example, or adapter edits. No new tiles, no catalog-count
movement, no deep-link hash changes. No framework, no CSS build step, no new runtime
dependency. Theming stays token-driven in both light and dark.
