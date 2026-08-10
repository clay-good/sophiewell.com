# spec-v690.md — Edmonton Frail Scale (EFS)

> Status: **SHIPPED (2026-08-10).** Builds the `edmonton-frail-scale` tile. Catalog **1520 → 1521**, group G.

## Why

The catalog had several frailty tools (Fried, FRAIL scale, SOF, Groningen, Clinical Frailty
Scale) but not the **Edmonton Frail Scale** — a multidimensional, non-specialist-feasible screen
that a spec-v177 code comment had deferred on sourcing grounds. It is now sourceable. Cluster gap.

## What it does

Nine domains summed to a maximum of **17**:

| Domain | Score |
| --- | --- |
| Cognition (clock-drawing test) | 0–2 |
| Hospital admissions in the past year | 0–2 |
| Self-rated health | 0–2 |
| Instrumental ADLs needing help | 0–2 |
| Social support when needed | 0–2 |
| Timed Up and Go (3 m) | 0–2 |
| ≥ 5 prescription medications | 0/1 |
| Forgets to take medications | 0/1 |
| Recent weight loss | 0/1 |
| Low mood | 0/1 |
| Urinary incontinence | 0/1 |

**Bands:** 0–5 not frail; 6–7 apparently vulnerable; 8–9 mild; 10–11 moderate; 12–17 severe
frailty.

## Posture (spec-v97)

A screening aid to flag frailty and prompt further assessment, not a diagnosis. It supports
rather than replaces clinical judgment.

## Files

- `lib/edmonton-frail-scale-v690.js` — `edmontonFrailScale()`, `EFS_NOTE`.
- `views/group-v690.js` (RV690) — six selects + five checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/edmonton-frail-scale-v690.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, domains + bands, related (fried-frailty, frail-scale, cfs).
- `test/unit/edmonton-frail-scale.test.js` — 5 tests (all-zero, max 17, worked example 8, the
  five bands, validation).
- `docs/spec-v690.md` (this file).

## Sourcing (spec-v97)

Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K. Validity and reliability of the
Edmonton Frail Scale. *Age Ageing.* 2006;35(5):526-529 (PMID 16757522). Per-domain scoring and
the five-band original cut-points were verified and cross-checked against a BMC Geriatrics
reproduction and a clinical calculator; the five-band presentation (Rolfson) is used rather than
the collapsed "6-11 vulnerable" variant some secondary sources give.
