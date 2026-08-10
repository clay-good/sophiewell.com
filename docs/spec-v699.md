# spec-v699.md — Frontal Assessment Battery (FAB)

> Status: **SHIPPED (2026-08-10).** Builds the `fab` tile. Catalog **1529 → 1530**, group G.

## Why

The catalog had global cognitive screens (SLUMS, Mini-Cog) and dementia staging (FAST) but not
a dedicated **executive/frontal-function** battery. The FAB fills that gap and helps separate a
frontal-dementia pattern from an Alzheimer-type pattern.

## What it does

Six subtests, each scored **0–3** by the examiner, summed to **0–18** (higher = better):

1. Conceptualization (similarities)
2. Mental flexibility (verbal fluency)
3. Motor programming (Luria fist-edge-palm series)
4. Sensitivity to interference (conflicting instructions)
5. Inhibitory control (go / no-go)
6. Environmental autonomy (prehension behavior)

A total **< 12** suggests frontal / dysexecutive dysfunction (the cut-point depends on age and
education).

## Posture (spec-v97)

An examiner-administered screen, not a diagnosis; the < 12 cut-point is age- and
education-dependent. It supports rather than replaces formal neuropsychological assessment.
Neutral task labels only — no proprietary item wording is reproduced.

## Files

- `lib/fab-v699.js` — `fab()`, `FAB_NOTE`.
- `views/group-v699.js` (RV699) — six 0–3 selects; a11y-checked, no innerHTML.
- `mcp/adapters/fab-v699.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, subtests + cut-point, related (slums, mini-cog, fast-dementia).
- `test/unit/fab.test.js` — 5 tests (max 18, min 0, the < 12 cut boundary, worked example 10,
  per-subtest validation).
- `docs/spec-v699.md` (this file).

## Sourcing (spec-v97)

Dubois B, Slachevsky A, Litvan I, Pillon B. The FAB: a Frontal Assessment Battery at bedside.
*Neurology.* 2000;55(11):1621-1626 (PMID 11113214). The six subtests, the 0–3 per-item scoring,
the 0–18 total, and the < 12 dysfunction cut-point were confirmed against the original and a
reproduction; only the deterministic sum is implemented (neutral task labels), not proprietary
item wording.
