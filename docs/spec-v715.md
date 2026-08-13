# spec-v715.md — Basic Erosive Wear Examination (BEWE)

> Status: **SHIPPED (2026-08-13).** Builds the `bewe` tile. Catalog **1545 → 1546**, group G.

## Why

This opens a **dentistry** vein in the catalog (approved this session). The catalog had no dental
content; BEWE is the standard screening index for erosive tooth wear and a clean deterministic
tool. This commit also adds `dentistry`, `oral-surgery`, and `orthodontics` to the closed
specialty vocabulary (`test/unit/specialty-coverage.test.js`).

## What it does

Divide the mouth into **6 sextants**; score the single most-affected surface in each 0–3:

| Score | Meaning |
| --- | --- |
| 0 | no erosive tooth wear |
| 1 | initial loss of surface texture |
| 2 | distinct defect, hard-tissue loss < 50% of the surface |
| 3 | hard-tissue loss ≥ 50% |

**BEWE total = sum of the highest score in each of the 6 sextants (0–18).**

| Total | Level / management |
| --- | --- |
| 0–2 | none — routine maintenance (~3-yr recall) |
| 3–8 | low — hygiene/diet assessment, fluoride (~2-yr) |
| 9–13 | medium — as above + avoid restorations, monitor (6–12 mo) |
| ≥ 14 | high — as above + consider restorations (6–12 mo) |

## Posture (spec-v97)

Screens erosive tooth wear and guides follow-up intervals; it does not diagnose the cause. It
supports rather than replaces the full dental examination and clinical judgment.

## Files

- `lib/bewe-v715.js` — `bewe()`, `BEWE_NOTE`.
- `views/group-v715.js` (RV715) — six sextant selects (0–3); a11y-checked.
- `mcp/adapters/bewe-v715.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, per-sextant scores + levels.
- `test/unit/specialty-coverage.test.js` — added `dentistry`, `oral-surgery`, `orthodontics`.
- `test/unit/bewe.test.js` — 5 tests (all-zero, max 18, worked example 9, risk levels, validation).
- `docs/spec-v715.md` (this file).

## Sourcing (spec-v97)

Bartlett D, Ganss C, Lussi A. Basic Erosive Wear Examination (BEWE). *Clin Oral Investig.*
2008;12(Suppl 1):S65-S68 (PMID 18228057). The per-surface 0–3 criteria, the sum-of-6-sextants
total, and the 0–2 / 3–8 / 9–13 / ≥ 14 risk-level cut-points were confirmed against the original
and a BDJ recommendations reproduction, which agree.
