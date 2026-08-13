# spec-v730.md — Severity of Dependence Scale (SDS)

> Status: **SHIPPED (2026-08-13).** Builds the `sds-dependence` tile. Catalog **1560 → 1561**, group G.

## Why

The catalog had alcohol-use screens (AUDIT-C, CAGE) and opioid withdrawal (COWS) but not the
**SDS**, the standard brief measure of the *degree of psychological dependence* on a substance.
Gap in addiction-medicine tools.

## What it does

Five items each **0–3** (items 1–4 never→always; item 5 not-difficult→impossible), summed to
**0–15**. Higher = greater psychological dependence.

**Substance-specific screening cutoffs** (a total at/above suggests dependence):

| Substance | Cutoff |
| --- | --- |
| heroin | ≥ 5 |
| cocaine | ≥ 3 |
| amphetamines | ≥ 5 |
| cannabis | ≥ 4 |
| alcohol | ≥ 4 |
| other | no fixed cutoff |

## Posture (spec-v97)

Screens the severity of psychological dependence to prompt fuller assessment; it is not a
diagnosis. The cutoffs are presented as a substance-specific table rather than one band. It
supports rather than replaces clinical evaluation.

## Files

- `lib/sds-dependence-v730.js` — `sdsDependence()`, `SDS_NOTE`.
- `views/group-v730.js` (RV730) — a substance select + five 0–3 selects; a11y-checked.
- `mcp/adapters/sds-dependence-v730.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + substance cutoffs, related (auditc, cows).
- `test/unit/sds-dependence.test.js` — 5 tests (worked example 5/heroin, cocaine & cannabis
  cutoffs, other=no cutoff, below-cutoff, required substance + items).
- `docs/spec-v730.md` (this file).

## Sourcing (spec-v97)

Gossop M, Darke S, Griffiths P, et al. The Severity of Dependence Scale (SDS). *Addiction.*
1995;90(5):607-614 (PMID 7795497). The 5-item 0–3 scoring (0–15 total) and the substance-specific
cutoffs (heroin/amphetamine ≥ 5, cocaine ≥ 3, cannabis/alcohol ≥ 4) were confirmed against the
original and a Flinders AOD screening reference; the cutoffs are presented as a table, not one band.
