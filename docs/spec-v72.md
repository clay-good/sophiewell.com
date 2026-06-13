# spec-v72.md — Bring every primary interactive control up to the 44px touch target (WCAG 2.5.5)

> Status: **IMPLEMENTED (2026-06-13). Catalog unchanged at 337.**
> A responsiveness/accessibility completion, not a new tile. The site is built
> for the nurse on shift, who reaches for it on a phone as often as a
> workstation, but four interactive controls rendered below the 44 CSS px
> touch-target floor (WCAG 2.5.5 Target Size, Apple HIG): the copy pills
> (~24px tall, present on every tool that emits a copyable result — the most
> frequently hit small target on the site), the topbar theme toggle (40px), the
> breadcrumb "back" button (~30px), and the "load example" reset (~36px). v72
> raises each to a 44px target, removes the dead `.example-btn` CSS rule the
> [spec-v9](spec-v9.md) `.example-btn` → `.example-reset` rename orphaned, and
> adds a permanent regression guard so a new control (or a padding tweak) can
> never silently reintroduce a sub-44px tap target. Every prior spec (v4 through
> v71) remains in force; v72 adds no runtime network call, no AI, and no new
> tile.

## 1. Thesis

The horizontal-scroll guarantee ([mobile-no-hscroll.spec.js](../test/integration/mobile-no-hscroll.spec.js))
already enforces that nothing overflows the viewport at 320px. But a layout that
*fits* is not the same as a layout that is *comfortable to operate with a
thumb*. The other half of mobile usability is target size: a control that is an
easy click with a mouse pointer can be a routine mis-tap on a phone if its
small dimension falls below ~44px.

A quick measurement at 360px found four offenders, all the result of a base
`button` rule (`padding: 10px 16px`, ~44px tall) being overridden *down* for
visual compactness:

| Control | Selector | Before | Where it appears |
|---|---|---|---|
| Copy pill | `.copy-btn` | ~24px tall | every tool that emits a copyable result (`lib/clipboard.js`, `lib/result-copy.js`, `lib/table.js`) |
| Theme toggle | `.topbar-theme-toggle` | 40×40px | the topbar, on every page |
| Breadcrumb back | `.breadcrumb-back` | ~30px tall | every dynamic tool view |
| Load-example reset | `.tool-meta .example-reset` | ~36px tall | scoring/calculator tiles with a worked example |

The copy pill is the worst case and the highest-traffic: it is ~24px tall (right
at the WCAG 2.5.8 AA *minimum* of 24px, with zero margin), and the pills are
often packed side by side in a `.copy-row`, compounding mis-taps.

## 2. The change

Each control is brought to a **44px minimum in its small dimension**, matching
the height of the base `button` so the controls read as a consistent family
rather than a set of mismatched slivers. The change is pure CSS plus one dead-
rule deletion; no renderer, no compute, no markup changes.

```
.copy-btn               min-height: 44px; inline-flex centering (was padding 4px 10px, ~24px)
.topbar-theme-toggle    44 x 44px        (was 40 x 40px)
.breadcrumb-back        min-height: 44px; inline-flex centering (was ~30px)
.tool-meta .example-reset  min-height: 44px (was ~36px)
.tool-meta .example-btn    RULE DELETED   (dead since the spec-v9 rename to .example-reset)
```

- **Small font preserved.** The copy/example controls keep their `0.85rem`
  label; only the box grows, so the pills stay visually light while the tap
  zone becomes a full target. Native `<button>` content centering (reinforced
  with `inline-flex; align-items: center` where the control was not already a
  flex box) keeps the label vertically centered in the taller box.
- **No horizontal-scroll regression.** `min-height` does not change width; the
  theme toggle gains 4px of width but the topbar is a flex row with ample room
  even at 320px. The existing full-catalog 320px hscroll sweep re-runs green.
- **Dead CSS removed.** `.tool-meta .example-btn` referenced a class retired in
  the [spec-v9](spec-v9.md) `.example-btn` → `.example-reset` rename; no live
  element has carried `example-btn` since. The stale `:not(.example-btn)`
  exclusion in [tool-interactions.spec.js](../test/integration/tool-interactions.spec.js)
  is corrected to `:not(.example-reset)`, restoring the documented intent of
  exercising the example button separately from the body-button click loop.

## 3. Robustness

- The change is presentational only. No tile output, scoring band, citation, or
  catalog count changes; `UTILITIES.length` stays **337**.
- A new e2e regression guard,
  [mobile-touch-targets.spec.js](../test/integration/mobile-touch-targets.spec.js),
  loads `/#anion-gap` at 360px (a route that renders three copy pills plus the
  example reset, and like every tool view carries the breadcrumb back-button and
  topbar theme toggle) and asserts every instance of all four control classes
  measures ≥44px in its binding dimension, reporting every offender at once.
  chromium-only (target size is engine-agnostic layout, the same rationale the
  hscroll catalog sweep uses).

## 4. Doc drift fixed alongside (housekeeping)

Three accuracy fixes surfaced by a documentation audit, unrelated to the CSS but
shipped in the same commit:

- [docs/deployment.md](deployment.md): the post-deploy CSP verification line was
  missing `'wasm-unsafe-eval'` in `script-src` (added for the vendored on-device
  OCR WebAssembly engine; `_headers`, SECURITY.md, and README already carried
  it). A `curl -I` check against the documented value would not have matched
  production.
- [README.md](../README.md): the `npm run test:unit` count was `3,468`; the
  suite reports `3,469`.
- [docs/operations.md](operations.md): the "add a pure function" step listed
  `lib/decoder.js` as a current compute module, but it was deleted in spec-v29;
  replaced with the live modules (`lib/clinical.js`, `lib/clinical-v5.js`,
  `lib/field.js`, `lib/scoring-v4.js`).

## 5. Files touched

```
docs/spec-v72.md                              (this file)
styles.css                                    (.copy-btn, .topbar-theme-toggle, .breadcrumb-back, .example-reset -> 44px; delete dead .example-btn)
test/integration/mobile-touch-targets.spec.js (new: 44px touch-target regression guard)
test/integration/tool-interactions.spec.js    (stale :not(.example-btn) -> :not(.example-reset))
docs/deployment.md                            (CSP script-src += 'wasm-unsafe-eval')
docs/operations.md                            (drop deleted lib/decoder.js from the compute-module list)
README.md                                     (test:unit count 3,468 -> 3,469; intro spec-progression + range -> v72)
CHANGELOG.md                                  (Unreleased: v72 entry, +0 catalog delta)
```

## 6. Acceptance criteria

- At 360px the copy pills, theme toggle, breadcrumb back-button, and load-example
  reset each measure ≥44px in their binding dimension; the new spec passes.
- The full-catalog 320px no-horizontal-scroll sweep still passes (no width
  regression from the toggle change).
- `tool-interactions.spec.js` still passes with the corrected exclusion.
- `UTILITIES.length` is still **337**; all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass.
- The CHANGELOG records v72 with a +0 catalog delta.

## 7. Out of scope for v72

- **No font-size changes.** A few de-emphasis/metadata labels render at ~12.5px
  (`.lab-result-source`, `.remember-note`, lookup-table headers); they are
  secondary text and were left as-is to avoid layout shifts. v72 is target-size
  only.
- **No new tile, no compute change, no change to any tile's output.**
- **No change to the base `button` rule** (already ≥44px) or to in-prose links
  (raising those to 44px would distort body copy; the guard targets controls,
  not text links).
