# spec-v683.md — Effective serum osmolality (tonicity)

> Status: **SHIPPED (2026-08-09).** Builds the `effective-osmolality` tile. Catalog **1513 → 1514**, group G.

## Why

The catalog computed **total** calculated osmolality (inside the `osmolal-gap` tile) but not
**effective** osmolality (tonicity) as a standalone value. Tonicity is a distinct concept:
it excludes urea and other freely permeant osmoles, so it reflects the osmotic gradient that
actually moves water — and it is the number in the diagnostic criteria for the hyperosmolar
hyperglycemic state (HHS). Axis gap.

## What it does

```
Effective osmolality (mOsm/kg) = 2 × sodium (mEq/L) + glucose (mg/dL) / 18
```

Urea is **excluded** (that is the whole difference from total osmolality). Reference range
~275–295 mOsm/kg. An effective osmolality **> 320 mOsm/kg is a diagnostic criterion for HHS**
and correlates with depressed mental status in hyperglycemic crises.

## Posture (spec-v97)

A calculated value that supports rather than replaces clinical assessment. The > 320 threshold
is one HHS criterion among several (with glucose and acid-base status), not a standalone
diagnosis.

## Files

- `lib/effective-osmolality-v683.js` — `effectiveOsmolality()`, `EFFECTIVE_OSM_NOTE`.
- `views/group-v683.js` (RV683) — two number inputs (sodium, glucose); a11y-checked.
- `mcp/adapters/effective-osmolality-v683.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + range bands, related (osmolal-gap, dka-hhs).
- `test/unit/effective-osmolality.test.js` — 5 tests (normal, HHS case 330, urea excluded,
  band edges, validation).
- `docs/spec-v683.md` (this file).

## Sourcing (spec-v97)

Formula is standard physiology; the > 320 mOsm/kg HHS threshold and the exclusion of urea are
per the ADA hyperglycemic-crises consensus (Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN.
Hyperglycemic crises in adult patients with diabetes. *Diabetes Care.* 2009;32(7):1335-1343,
PMID 19564476), cross-checked against a nephrology reference on serum osmolality and a
hyperglycemic-crisis reference; both give 2×Na + glucose/18 and the > 320 HHS criterion.
