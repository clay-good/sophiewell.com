# spec-v640.md — 2022 ACR/EULAR Microscopic Polyangiitis Classification Criteria

> Status: **SHIPPED (2026-08-03).** Builds the `mpa-acr-eular-2022` tile. Catalog **1470 → 1471**, group G.

## Why

The **fourth** 2022 ACR/EULAR vasculitis tile this session's cluster, completing the ANCA-associated pair
with `gpa-acr-eular-2022` (spec-v639). With `gca-acr-eular-2022`, `takayasu-acr-eular-2022`, `gpa-...` and
this one, the catalog now carries four of the five 2022 ACR/EULAR vasculitis criteria (EGPA remains).

## What it does

The criteria apply only once a diagnosis of **small- or medium-vessel vasculitis** has been made and mimics
excluded (a consideration stated in the note; no scored absolute-requirement gate). Six weighted items are
summed, and a cumulative score **≥ 5 classifies as MPA** (validation sensitivity 91%, specificity 94%).

| Item | Points |
| --- | --- |
| Positive pANCA or anti-MPO antibody | +6 |
| Pauci-immune glomerulonephritis on biopsy | +3 |
| Fibrosis or interstitial lung disease on chest imaging | +3 |
| Nasal involvement (bloody discharge, ulcers, crusting, congestion, blockage, septal defect/perforation) | **−3** |
| Positive cANCA or anti-PR3 antibody | **−1** |
| Blood eosinophil count ≥ 1 × 10⁹/L | **−4** |

## The three negatives separate MPA from its neighbours

MPO-ANCA is the heaviest single weight (+6), but three items subtract: **nasal involvement (−3)** and
**cANCA/anti-PR3 (−1)** point toward GPA, and **blood eosinophilia (−4)** toward EGPA. The total spans **−8
to +12**. A test confirms a positive MPO-ANCA (+6) is pulled below the threshold by nasal involvement (−3) to
a net of 3 (not classified).

## Scope (spec-v11 §5.3)

A **classification** rule, built to standardize study cohorts, not to diagnose an individual. The diagnosis
and management decision stay with the clinician.

## Files

- `lib/mpa-v640.js` — `mpaAcrEular2022()`, `MPA_NOTE`.
- `views/group-v640.js` (RV640) — six checkboxes with signed labels; a11y-checked, no innerHTML, no network.
- `mcp/adapters/mpa-v640.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/mpa.test.js` — 6 tests (example, per-item weights, three negatives, threshold, range, empty).
- `docs/spec-v640.md` (this file).

## Sourcing (spec-v97)

Suppiah R, Robson JC, Grayson PC, et al. 2022 American College of Rheumatology/EULAR Classification Criteria
for Microscopic Polyangiitis. *Arthritis Rheumatol.* 2022;74(3):400-406 (doi:10.1002/art.41983; co-published
*Ann Rheum Dis.* 2022;81(3):321-326, doi:10.1136/annrheumdis-2021-221796). Every point value including all
three negatives, the ≥ 5 threshold, and the prerequisite were cross-checked across three independent sources
citing the primary criteria box, with no disagreement on the weights (one secondary source's arithmetic slip
on the maximum was identified and discarded; the correct maximum positive sum is +12).
