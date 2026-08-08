# spec-v668.md — Coronary artery calcium (CAC) Agatston score interpretation

> Status: **SHIPPED (2026-08-08).** Builds the `cac-agatston` tile. Catalog **1498 → 1499**, group G.

## Why

The CAC Agatston score is one of the most impactful tools in preventive cardiology, but the catalog only used
it *as an input* to the MESA CHD risk model (`mesa-chd`). This tile is the standalone interpretation of a total
CAC score into its risk category and the guideline statin-decision context.

## What it does

Classifies a total Agatston score:

| Total CAC | Category |
| --- | --- |
| 0 | no identifiable calcified plaque |
| 1–99 | mild |
| 100–399 | moderate |
| ≥ 400 | severe / extensive |

The 100 and 400 breakpoints are consensus across schemes (a finer scheme splits 1–99 into 1–10 minimal + 11–100
mild but shares the same decision boundaries).

## Posture (spec-v97)

In borderline-to-intermediate-risk primary-prevention adults where the statin decision is uncertain, the 2018
AHA/ACC cholesterol guideline uses CAC as a decision aid: CAC 0 favors deferring a statin (except with diabetes,
smoking, strong family history, etc.); 1–99 favors starting (especially ≥ 55); ≥ 100 or ≥ 75th percentile favors
statin therapy. This framing is **advisory, not an order**. A CAC of 0 lowers but does not eliminate risk (it
does not detect soft plaque). The age/sex/race percentile axis is not computed here.

## Files

- `lib/cac-agatston-v668.js` — `cacAgatston()`, `CAC_NOTE`.
- `views/group-v668.js` (RV668) — one integer score input; a11y-checked, no innerHTML, no network.
- `mcp/adapters/cac-agatston-v668.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/cac-agatston.test.js` — 6 tests (bands, exact 99/100 and 399/400 boundaries, abnormal flag,
  CAC-0-not-zero-risk, example, required whole-number).
- `docs/spec-v668.md` (this file).

## Sourcing (spec-v97)

Agatston AS, Janowitz WR, Hildner FJ, et al. Quantification of coronary artery calcium using ultrafast computed
tomography. *J Am Coll Cardiol.* 1990;15(4):827-832 (PMID 2407762). Grundy SM, Stone NJ, Bailey AL, et al. 2018
AHA/ACC Guideline on the Management of Blood Cholesterol. *Circulation.* 2019;139(25):e1082-e1143 (PMID
30586774). A source-verification subagent confirmed the 4-band absolute scheme (with the 0/100/400 breakpoints
consensus across competing schemes), the 2018 ACC/AHA statin-decision thresholds, and that CAC 0 does not mean
zero risk.
