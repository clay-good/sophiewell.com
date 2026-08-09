# spec-v674.md — Onychomycosis Severity Index (OSI)

> Status: **SHIPPED (2026-08-08).** Builds the `osi-onychomycosis` tile. Catalog **1504 → 1505**, group G.

## Why

The catalog ships the major dermatology severity indices (`pasi`, `easi`, `scorad`, `napsi`, `dlqi`, Hurley)
but not the standard grading instrument for onychomycosis. OSI is the validated way to grade a fungal nail and
track its response to antifungal therapy — a companion to NAPSI (which grades *psoriatic* nails).

## What it does

A single-nail score:

> OSI = area-of-involvement (0–5) × proximity-to-matrix (1–5) + 10 (if dermatophytoma **or** > 2 mm subungual hyperkeratosis)

| Area (0–5) | % nail involved | | Proximity (1–5) | Zone |
| --- | --- | --- | --- | --- |
| 0 | 0% | | 1 | distal quarter |
| 1 | 1–10% | | 2 | second quarter |
| 2 | 11–25% | | 3 | third quarter |
| 3 | 26–50% | | 4 | proximal quarter |
| 4 | 51–75% | | 5 | matrix |
| 5 | > 75% | | | |

Total 0–35: **0 none**, **1–5 mild**, **6–15 moderate**, **16–35 severe**.

## Posture (spec-v97)

Because area and proximity are **multiplied**, an area score of 0 yields a total of 0 regardless of the other
inputs (the tile states this). The 10-point bonus is added **once** as an OR condition (either feature, not
per-feature). OSI grades a nail to standardize severity and track therapy; it is a grading instrument, not a
treatment order.

## Files

- `lib/osi-onychomycosis-v674.js` — `osiOnychomycosis()`, `OSI_NOTE`.
- `views/group-v674.js` (RV674) — two selects (area 0–5, proximity 1–5) + one bonus checkbox; a11y-checked,
  no innerHTML, no network.
- `mcp/adapters/osi-onychomycosis-v674.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialty, related.
- `test/unit/osi-onychomycosis.test.js` — 7 tests (formula, +10 bonus once, area-0 → 0, band boundaries,
  abnormal ≥ 6, worked 12/35 example, input validation).
- `docs/spec-v674.md` (this file).

## Sourcing (spec-v97)

Carney C, Tosti A, Daniel R, Scher R, Rich P, DeCoster J, Elewski B. A new classification system for grading
the severity of onychomycosis: Onychomycosis Severity Index. *Arch Dermatol.* 2011;147(11):1277-1282 (PMID
21810660). A source-verification subagent confirmed the multiplicative formula, the 0–5 area anchors and 1–5
proximity zones, the single 10-point OR bonus, the 0–35 range, and the mild/moderate/severe cutoffs (1–5 /
6–15 / 16–35) against the primary full text.
