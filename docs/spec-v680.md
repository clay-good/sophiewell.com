# spec-v680.md — Kobayashi score (IVIG resistance in Kawasaki disease)

> Status: **SHIPPED (2026-08-09).** Builds the `kobayashi-kawasaki` tile. Catalog **1510 → 1511**, group G.

## Why

The catalog had the **Egami** IVIG-resistance score for Kawasaki disease but not the
**Kobayashi** score — a companion gap in the same cluster. Kobayashi is the most widely
cited of the Japanese IVIG-resistance risk scores and the one used to select patients for
intensified primary therapy in several trials.

## What it does

A weighted sum of seven pre-treatment findings, total **0–11**:

| Criterion | Points |
| --- | --- |
| Serum sodium ≤ 133 mmol/L | 2 |
| Treatment started on day ≤ 4 of illness | 2 |
| AST ≥ 100 IU/L | 2 |
| Neutrophils ≥ 80% | 2 |
| CRP ≥ 10 mg/dL | 1 |
| Age ≤ 12 months | 1 |
| Platelets ≤ 300 ×10³/µL | 1 |

**≥ 4 = high risk** of IVIG resistance (Japanese derivation ~76–86% sensitive / ~68–70%
specific). Discrimination is lower in Western and infant cohorts.

## Posture (spec-v97)

A resistance-risk estimate from pre-treatment values, not an order for IVIG or adjunctive
therapy. It supports rather than replaces clinical judgment.

## Files

- `lib/kobayashi-kawasaki-v680.js` — `kobayashiKawasaki()`, `KOBAYASHI_NOTE`.
- `views/group-v680.js` (RV680) — seven lab/age number inputs; a11y-checked, no innerHTML.
- `mcp/adapters/kobayashi-kawasaki-v680.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, point table + bands, related (egami, kawasaki-criteria).
- `test/unit/kobayashi-kawasaki.test.js` — 7 tests (zero baseline, each weight, exact
  thresholds, ≥ 4 cutoff, worked example 10/11, max 11, validation).
- `docs/spec-v680.md` (this file).

## Sourcing (spec-v97)

Kobayashi T, Inoue Y, Takeuchi K, et al. Prediction of intravenous immunoglobulin
unresponsiveness in patients with Kawasaki disease. *Circulation.* 2006;113(22):2606-2612
(PMID 16735679). Every criterion, weight, and the ≥ 4 cutoff were confirmed against two
independent comparison studies (a 2024 Egami/Kobayashi/Sano comparison and a 2023 IVIG-
resistance-score meta-analysis), which report the point table identically.
