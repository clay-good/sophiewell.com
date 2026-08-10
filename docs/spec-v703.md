# spec-v703.md — Reimers migration percentage (hip migration index)

> Status: **SHIPPED (2026-08-10).** Builds the `reimers-migration-percentage` tile. Catalog **1533 → 1534**, group G.

## Why

The catalog had hip-OA (Tönnis) and acetabular tools but not the **Reimers migration
percentage** — the standard radiographic measure of hip displacement and the number that drives
cerebral-palsy hip surveillance. Whole-concept gap.

## What it does

```
Migration percentage (MP) = (a / b) × 100
  a = femoral-head width lateral to Perkin's line (mm)
  b = total femoral-head width (mm)
```

| MP | Reading |
| --- | --- |
| ≤ 33% | normal / contained |
| > 33% | subluxated (hip-surveillance referral threshold) |
| ~90–100% | dislocated |

## Posture (spec-v97)

Measures displacement on a single film; it does not by itself dictate surgery. It supports
rather than replaces the surveillance program and clinical judgment. The lateral width cannot
exceed the total femoral-head width (validated).

## Files

- `lib/reimers-migration-percentage-v703.js` — `reimersMigrationPercentage()`, `REIMERS_NOTE`.
- `views/group-v703.js` (RV703) — two millimetre number inputs; a11y-checked.
- `mcp/adapters/reimers-migration-percentage-v703.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + thresholds, related (tonnis-hip-oa, cobb-angle).
- `test/unit/reimers-migration-percentage.test.js` — 5 tests (worked example 40%, formula, bands,
  33% threshold, validation incl. a > b).
- `docs/spec-v703.md` (this file).

## Sourcing (spec-v97)

Reimers J. The stability of the hip in children. *Acta Orthop Scand Suppl.* 1980;184:1-100. The
formula and the ≤ 33% / > 33% / dislocation thresholds were confirmed against the AACPDM hip-
surveillance care pathway and a peripheral review, which report the same definition and cut-points.
