# spec-v641.md — 2022 ACR/EULAR Eosinophilic Granulomatosis with Polyangiitis Classification Criteria

> Status: **SHIPPED (2026-08-03).** Builds the `egpa-acr-eular-2022` tile. Catalog **1471 → 1472**, group G.

## Why

The **fifth and final** 2022 ACR/EULAR vasculitis tile, **completing the set**: with `gca-acr-eular-2022`
(built earlier) and this session's `takayasu`, `gpa`, `mpa`, and now `egpa`, the catalog carries all five
2022 ACR/EULAR vasculitis classification criteria. EGPA (formerly Churg-Strauss syndrome) was the last gap.

## What it does

The criteria apply only once a diagnosis of **small- or medium-vessel vasculitis** has been made and mimics
excluded (a consideration stated in the note; no scored absolute-requirement gate). Seven weighted items are
summed, and a cumulative score **≥ 6 classifies as EGPA** (validation sensitivity 85%, specificity 99%).

| Item | Points |
| --- | --- |
| Maximum blood eosinophil count ≥ 1 × 10⁹/L | +5 |
| Obstructive airway disease | +3 |
| Nasal polyps | +3 |
| Extravascular eosinophilic-predominant inflammation | +2 |
| Mononeuritis multiplex or motor neuropathy not due to radiculopathy | +1 |
| Positive cANCA or anti-PR3 antibody | **−3** |
| Hematuria | **−1** |

## Two things a family-copy implementation gets wrong

1. **Eosinophilia is the heaviest POSITIVE item here (+5)** — the exact reverse of GPA and MPA, where blood
   eosinophilia is −4 (it points toward EGPA). Copying the GPA/MPA sign is the natural error.
2. **The threshold is ≥ 6, one point higher than the GPA/MPA ≥ 5.** A test confirms that eosinophilia alone
   (+5) does *not* classify, whereas it would under a ≥ 5 rule.

There is **no pauci-immune glomerulonephritis item** in the EGPA criteria (that belongs to GPA/MPA); the only
renal item is hematuria (−1). Source verification caught this before it was miscoded.

## Scope (spec-v11 §5.3)

A **classification** rule, built to standardize study cohorts, not to diagnose an individual. The diagnosis
and management decision stay with the clinician.

## Files

- `lib/egpa-v641.js` — `egpaAcrEular2022()`, `EGPA_NOTE`.
- `views/group-v641.js` (RV641) — seven checkboxes with signed labels; a11y-checked, no innerHTML, no network.
- `mcp/adapters/egpa-v641.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/egpa.test.js` — 7 tests (example, positive eosinophilia, ≥ 6 threshold, per-item weights, two
  negatives, range, empty).
- `docs/spec-v641.md` (this file).

## Sourcing (spec-v97)

Grayson PC, Ponte C, Suppiah R, et al. 2022 American College of Rheumatology/EULAR Classification Criteria
for Eosinophilic Granulomatosis with Polyangiitis. *Arthritis Rheumatol.* 2022;74(3):386-392
(doi:10.1002/art.41982; co-published *Ann Rheum Dis.* 2022;81(3):309-314, doi:10.1136/annrheumdis-2021-221794).
Every point value, the ≥ 6 threshold (verified specifically as one higher than GPA/MPA), and the seven-item
list (with the extravascular-inflammation item present and no pauci-immune-GN item) were confirmed across the
primary abstract and multiple independent sources with no inconsistencies.
