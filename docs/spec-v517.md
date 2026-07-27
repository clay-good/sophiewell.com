# spec-v517.md — PIPP (Premature Infant Pain Profile) tile

> Status: **SHIPPED (2026-07-27).** Builds the `pipp` tile — the seven-indicator procedural pain score for
> preterm and term newborns, total 0-21. Catalog **1366 → 1367**, group G.

## Why

A companion gap in a cluster the catalog otherwise covers well. NIPS, CRIES, N-PASS, FLACC, and COMFORT-B are
all present; `pipp` and `premature infant pain` were zero-hit. PIPP is the one that adjusts for the two things
that make a preterm infant *look* comfortable when they are not — **gestational age** and **behavioral
state** — which is exactly why NICUs use it for procedural pain.

## What it does

Seven indicators, each **0-3**, total **0-21**:

| Group | Indicators |
| --- | --- |
| Contextual (scored *before* the procedure) | gestational age, behavioral state |
| Physiologic (from the baseline) | maximum heart-rate rise, minimum oxygen-saturation fall |
| Facial (percent of the observation) | brow bulge, eye squeeze, nasolabial furrow |

**6 or less** is commonly read as minimal or no pain; **above 12** as moderate to severe.

The contextual pair is the instrument's point, and the tile surfaces it: a 26-week infant in quiet sleep
scores **6 before anything is observed**, while a term infant, awake, with a marked physiologic response
scores the same 6. The result reports "N of 6 from the contextual indicators" alongside the total so that
head start is visible rather than buried.

- `lib/pipp-v517.js` — pure scores → total, contextual subtotal, and both interpretive flags. Exports
  `PIPP_INDICATORS`, each with its own four option texts, so the renderer, the adapter, and the tests share
  one source of wording. Rejects a missing indicator, a non-integer, and anything outside 0-3.
- `views/group-v517.js` (RV517) — seven selects (dom `pp-ga`, `pp-state`, `pp-hr`, `pp-spo2`, `pp-brow`,
  `pp-squeeze`, `pp-furrow`), contextual ones first, each with a real `<label for>`.
- `lib/meta.js` — Stevens and colleagues 1996 citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1367.

**HIGH-STAKES:** it sums an observer's own ratings around **one procedure**. It is **not** a diagnosis,
**not** a measure of pain at rest or of ongoing or postoperative pain, and **not** a drug or dose
recommendation ([spec-v11](spec-v11.md) §5.3). The copy states the failure mode plainly: **a low score does
not mean the procedure did not hurt** — a sick, sedated, paralyzed, or exhausted infant may not mount the
facial or physiologic response the score is built on.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`pipp`), the full name (`premature infant
pain`), and every neighbouring instrument in the cluster (`nips`, `cries`, `n-pass`, `flacc`, `comfort`) —
each against **both** `corpus.json` and `app.js`; plus a `test/unit/` scan, which found `comfort-b.test.js`
and no PIPP.

## Sourcing (spec-v97)

- **Citation:** Stevens B, Johnston C, Petryshen P, Taddio A. Premature Infant Pain Profile: development and
  initial validation. *Clin J Pain.* 1996;12(1):13-22.
- Cross-verified against neonatal pain references reproducing the same seven indicators, the same 0-3
  per-indicator scale, the same gestational-age and behavioral-state bands, and the same 0-21 range.

## Verification

Lint (all catalog-truth surfaces at 1367), unit suite (+9 + fuzz), a11y, build — all green. A test pins the
contextual head start from both directions: preterm-in-sleep and term-awake-with-response both total 6.

## Out of scope

The tile does not score the revised PIPP-R (which reorders when the contextual indicators are added), sucrose
or other non-pharmacologic intervention response, or ongoing/postoperative pain — N-PASS and COMFORT-B, both
already in the catalog, cover that question. The MCP adapter + golden-probe promotion follow in the next wave
(342).
