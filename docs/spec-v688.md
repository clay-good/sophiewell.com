# spec-v688.md — Downton Fall Risk Index

> Status: **SHIPPED (2026-08-10).** Builds the `downton-fall-risk` tile. Catalog **1518 → 1519**, group G.

## Why

The catalog had Morse, STRATIFY, and Hendrich II fall-risk tools but not the **Downton index**,
a distinct and widely used fall-risk screen (especially in residential/inpatient elder care).
Cluster gap.

## What it does

One point per item present, total **0–11**:

| Item | Points |
| --- | --- |
| Known previous falls | 1 |
| Medications (1 each): tranquillizers/sedatives, diuretics, antihypertensives (non-diuretic), antiparkinson, antidepressants | up to 5 |
| Sensory deficits (1 each): visual, hearing, limb | up to 3 |
| Mental state: confused / cognitively impaired | 1 |
| Gait: unsafe (with or without aids) | 1 |

**≥ 3 = high fall risk.** Two preserved quirks: **other medications score 0** (only the five
named classes count), and an **"unable to walk" gait scores 0** (not at risk of falling while
walking) whereas an unsafe gait scores 1.

## Posture (spec-v97)

A screening aid that should trigger fall-prevention measures, not a prediction of any individual
fall. It supports rather than replaces clinical judgment.

## Files

- `lib/downton-fall-risk-v688.js` — `downtonFallRisk()`, `DOWNTON_NOTE`.
- `views/group-v688.js` (RV688) — nine checkboxes + two selects; a11y-checked, no innerHTML.
- `mcp/adapters/downton-fall-risk-v688.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, point table + quirks, related (morse-falls, stratify, hendrich-ii).
- `test/unit/downton-fall-risk.test.js` — 8 tests (baseline 0, each item, med/sensory counting,
  gait quirk, max 11, worked example 6, ≥ 3 cutoff, validation).
- `docs/spec-v688.md` (this file).

## Sourcing (spec-v97)

Point table from Downton JH (Falls in the Elderly, 1993); the ≥ 3 high-risk cut and the item
scoring were taken verbatim from Rosendahl E, Lundin-Olsson L, Kallin K, et al. (Aging Clin Exp
Res. 2003;15(2):142-147, Table 2), cross-checked against a STRATIFY/Downton validation
reproduction; both give range 0–11 and the ≥ 3 cut-point.
