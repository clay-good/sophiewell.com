# spec-v681.md — Sano score (IVIG resistance in Kawasaki disease)

> Status: **SHIPPED (2026-08-09).** Builds the `sano-kawasaki` tile. Catalog **1511 → 1512**, group G.

## Why

Completes the Kawasaki IVIG-resistance cluster: the catalog now carries all three of the
Japanese risk scores — **Egami** (`egami`), **Kobayashi** (`kobayashi-kawasaki`, spec-v680),
and now **Sano**. Sano is the simplest of the three (three labs, no age or timing input), so
it is the quickest to apply at the bedside before treatment.

## What it does

A count of three pre-treatment criteria, each worth 1 point (total **0–3**):

| Criterion | Points |
| --- | --- |
| AST ≥ 200 IU/L | 1 |
| Total bilirubin ≥ 0.9 mg/dL | 1 |
| CRP ≥ 7 mg/dL | 1 |

**Meeting ≥ 2 of the 3 = high risk** of IVIG resistance (derivation ~77% sensitive / ~86%
specific). Discrimination is lower in Western and infant cohorts.

## Posture (spec-v97)

A resistance-risk estimate from pre-treatment values, not an order for IVIG or adjunctive
therapy. It supports rather than replaces clinical judgment.

## Files

- `lib/sano-kawasaki-v681.js` — `sanoKawasaki()`, `SANO_NOTE`.
- `views/group-v681.js` (RV681) — three lab number inputs; a11y-checked, no innerHTML.
- `mcp/adapters/sano-kawasaki-v681.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, criteria + bands, related (egami, kobayashi-kawasaki).
- `test/unit/sano-kawasaki.test.js` — 6 tests (zero baseline, each criterion, exact
  thresholds, ≥ 2 cutoff worked example, all-three 3, validation).
- `docs/spec-v681.md` (this file).

## Sourcing (spec-v97)

Sano T, Kurotobi S, Matsuzaki K, et al. Prediction of non-responsiveness to standard
high-dose gamma-globulin therapy in patients with acute Kawasaki disease before starting
initial treatment. *Eur J Pediatr.* 2007;166(2):131-137 (PMID 16896641). The three criteria,
their thresholds, and the ≥ 2 cutoff were confirmed against two independent comparison
studies (a 2024 Egami/Kobayashi/Sano comparison and a 2023 IVIG-resistance-score
meta-analysis), which report them identically.
