# spec-v638.md — 2022 ACR/EULAR Takayasu Arteritis Classification Criteria

> Status: **SHIPPED (2026-08-03).** Builds the `takayasu-acr-eular-2022` tile. Catalog **1468 → 1469**, group G.

## Why

A **companion gap**. The 2022 ACR/EULAR criteria for the two large-vessel vasculitides were published together
in the same series, but only Giant Cell Arteritis (`gca-acr-eular-2022`) was in the catalog. Its sibling,
Takayasu arteritis, was missing.

## What it does

Two **absolute requirements** must both hold before scoring (each a checkbox that gates the total):

- Age ≤ 60 years at diagnosis
- Evidence of vasculitis on imaging (angiography, ultrasound, or PET of the aorta or branch arteries)

Ten weighted items then sum to a maximum of **19**. A cumulative score **≥ 5 classifies as Takayasu
arteritis** (sensitivity 93.8%, specificity 99.2%).

| Item | Points |
| --- | --- |
| Abdominal aorta involvement with renal or mesenteric involvement | +3 |
| Number of affected arterial territories (one / two / three or more) | +1 / +2 / +3 |
| Angina or ischemic cardiac pain | +2 |
| Arm or leg claudication | +2 |
| Vascular bruit | +2 |
| Reduced pulse in upper extremity | +2 |
| Carotid artery abnormality (reduced/absent pulse or tenderness) | +2 |
| Female sex | +1 |
| Arm systolic blood-pressure difference ≥ 20 mmHg | +1 |
| Symmetric involvement of paired arteries | +1 |

The arterial-territory count is a single select-one item (nine possible territories: thoracic aorta,
abdominal aorta, mesenteric, left/right carotid, left/right subclavian, left/right renal). **No item carries
a negative weight**, which is the one substantive contrast with the companion GCA criteria.

## Scope (spec-v11 §5.3)

A **classification** rule, built to standardize study cohorts, not to diagnose an individual. It is applied
only after a diagnosis of medium- or large-vessel vasculitis has been made and mimics excluded; the tile
frames a computed classification, and the diagnosis and management decision stay with the clinician. Until
both absolute requirements are checked the tile reports the criteria are not yet applicable rather than
scoring a partial total.

## Files

- `lib/takayasu-v638.js` — `takayasuAcrEular2022()`, `TAKAYASU_NOTE`.
- `views/group-v638.js` (RV638) — the two absolute-requirement checkboxes, the nine weighted items, and the
  arterial-territory select; a11y-checked labels, no innerHTML, no network, no storage.
- `mcp/adapters/takayasu-v638.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/takayasu.test.js` — 6 tests (entry gate, threshold, per-item weights, max score, territory select).
- `docs/spec-v638.md` (this file).

## Sourcing (spec-v97)

Grayson PC, Ponte C, Suppiah R, et al. 2022 American College of Rheumatology/EULAR Classification Criteria
for Takayasu Arteritis. *Arthritis Rheumatol.* 2022;74(12):1872-1880 (doi:10.1002/art.42324; co-published
*Ann Rheum Dis.* 2022;81(12):1654-1660, doi:10.1136/ard-2022-223482). Every point value, the ≥ 5 threshold,
and the ≤ 60 age gate were transcribed from Figure 1 (the official criteria box) and cross-checked against
the abstract and two independent searches with no inconsistencies.
