# spec-v669.md — Walter Index (1-year mortality after hospitalization in older adults)

> Status: **SHIPPED (2026-08-08).** Builds the `walter-index` tile. Catalog **1499 → 1500**, group G.

## Why

The catalog already ships the Lee 4-Year Mortality Index (`lee-mortality-index`) for *community-dwelling*
older adults, but not its inpatient companion. The Walter Index is the canonical bedside estimate of
**1-year mortality applied at hospital discharge** in adults 70 or older — the point at which discharge
planning, goals-of-care conversations, and cancer-screening decisions are actually made.

## What it does

A weighted point sum (JAMA 2001, Table 3), total 0–20:

| Risk factor | Points |
| --- | --- |
| Male sex | 1 |
| Dependent in 1–4 of 5 ADLs (at discharge) | 2 |
| Dependent in all 5 ADLs | 5 |
| Congestive heart failure | 2 |
| Cancer — solitary (non-metastatic) | 3 |
| Cancer — metastatic | 8 |
| Serum creatinine > 3.0 mg/dL | 2 |
| Serum albumin 3.0–3.4 g/dL | 1 |
| Serum albumin < 3.0 g/dL | 2 |

The five ADLs are the basic (Katz) ADLs: bathing, dressing, transferring, toileting, eating.

Validation-cohort 1-year mortality bands (Table 4):

| Score | 1-year mortality |
| --- | --- |
| 0–1 | ~4% |
| 2–3 | ~19% |
| 4–6 | ~34% |
| ≥ 7 | ~64% |

## Posture (spec-v97)

This is a population-level prognostic estimate applied **at discharge** in adults ≥ 70 on general medical
services. It was not derived for surgical or ICU-only populations and never predicts an individual patient's
death; the renderer flags scores ≥ 4 (the 34%/64% bands) and states the estimate informs care planning only.

## Files

- `lib/walter-index-v669.js` — `walterIndex()`, `WALTER_NOTE`.
- `views/group-v669.js` (RV669) — three categorical selects (sex, ADL, cancer), one CHF checkbox, two lab
  number inputs (creatinine, albumin); a11y-checked, no innerHTML, no network.
- `mcp/adapters/walter-index-v669.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialties, related.
- `test/unit/walter-index.test.js` — 7 tests (zero case, each weight, exact lab thresholds, bands, abnormal
  flag, worked example = 11/20 → 64%, required-input validation).
- `docs/spec-v669.md` (this file).

## Sourcing (spec-v97)

Walter LC, Brand RJ, Counsell SR, Palmer RM, Landefeld CS, Fortinsky RH, Covinsky KE. Development and
validation of a prognostic index for 1-year mortality in older adults after hospitalization. *JAMA.*
2001;285(23):2987-2994 (PMID 11410097). A source-verification subagent confirmed the nine point weights
(Table 3), the four mortality bands with their validation-cohort percentages (Table 4, n=1427), the exact
lab cut-points (creatinine > 3.0 mg/dL; albumin > 3.4 = 0, 3.0–3.4 = 1, < 3.0 = 2), and the five basic ADLs,
cross-checked against the ePrognosis input structure.
