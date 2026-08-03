# spec-v639.md — 2022 ACR/EULAR Granulomatosis with Polyangiitis Classification Criteria

> Status: **SHIPPED (2026-08-03).** Builds the `gpa-acr-eular-2022` tile. Catalog **1469 → 1470**, group G.

## Why

The **third** 2022 ACR/EULAR vasculitis tile, after `gca-acr-eular-2022` (built earlier) and
`takayasu-acr-eular-2022` (spec-v638, this session). GPA (formerly Wegener granulomatosis) is the classic
ANCA-associated vasculitis and was absent from the catalog.

## What it does

The criteria apply only once a diagnosis of **small- or medium-vessel vasculitis** has been made and mimics
excluded (a consideration stated in the note; unlike the large-vessel GCA/Takayasu criteria there is **no
scored absolute-requirement gate**). Ten weighted items are summed, and a cumulative score **≥ 5 classifies
as GPA** (validation sensitivity 93%, specificity 94%).

| Item | Points |
| --- | --- |
| Positive cANCA or anti-PR3 antibody | +5 |
| Nasal involvement (bloody discharge, ulcers, crusting, congestion, blockage, septal defect/perforation) | +3 |
| Cartilaginous involvement | +2 |
| Pulmonary nodules, mass, or cavitation on imaging | +2 |
| Granuloma, extravascular granulomatous inflammation, or giant cells on biopsy | +2 |
| Conductive or sensorineural hearing loss | +1 |
| Nasal/paranasal sinus inflammation, consolidation, or effusion, or mastoiditis on imaging | +1 |
| Pauci-immune glomerulonephritis on biopsy | +1 |
| Positive pANCA or anti-MPO antibody | **−1** |
| Blood eosinophil count ≥ 1 × 10⁹/L | **−4** |

## The two negatives are the whole point

A naive all-positive implementation misclassifies. **Positive pANCA/anti-MPO (−1)** and **blood eosinophilia
(−4)** subtract, because those findings point toward microscopic polyangiitis and EGPA respectively. The
total therefore spans **−5 to +17**. The lib carries both negatives, the view labels their sign, and a test
confirms a positive cANCA (+5) is pulled below the threshold by eosinophilia (−4) to a net of 1 (not
classified).

## Scope (spec-v11 §5.3)

A **classification** rule, built to standardize study cohorts, not to diagnose an individual. The diagnosis
and management decision stay with the clinician.

## Files

- `lib/gpa-v639.js` — `gpaAcrEular2022()`, `GPA_NOTE`.
- `views/group-v639.js` (RV639) — ten checkboxes with signed labels; a11y-checked, no innerHTML, no network.
- `mcp/adapters/gpa-v639.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/gpa.test.js` — 6 tests (example, per-item weights, both negatives, threshold, range, empty).
- `docs/spec-v639.md` (this file).

## Sourcing (spec-v97)

Robson JC, Grayson PC, Ponte C, et al. 2022 American College of Rheumatology/EULAR Classification Criteria
for Granulomatosis With Polyangiitis. *Arthritis Rheumatol.* 2022;74(3):393-399 (doi:10.1002/art.41986;
co-published *Ann Rheum Dis.* 2022;81(3):315-320, doi:10.1136/annrheumdis-2021-221795). Every point value
including both negatives, the ≥ 5 threshold, and the prerequisite were transcribed from Figure 1 (the
official criteria box) and cross-checked against the abstract and an independent source with no
inconsistencies.
