# spec-v677.md — McMahon Score for rhabdomyolysis

> Status: **SHIPPED (2026-08-09).** Builds the `mcmahon-rhabdo` tile. Catalog **1507 → 1508**, group G.

## Why

Rhabdomyolysis was an **entirely uncovered** topic in the catalog (zero tiles). The McMahon score is the
validated bedside tool for it: from admission values it predicts the composite risk of in-hospital death or
acute kidney injury requiring renal replacement therapy (RRT), so clinicians can target aggressive
renal-protective therapy at the patients who need it.

## What it does

A weighted sum, total **0–19**:

| Component | Points |
| --- | --- |
| Age 51–70 / 71–80 / > 80 | 1.5 / 2.5 / 3 |
| Female sex | 1 |
| Initial creatinine 1.4–2.2 / > 2.2 mg/dL | 1.5 / 3 |
| Initial calcium < 7.5 mg/dL | 2 |
| Initial CPK > 40,000 U/L | 2 |
| Cause **not** seizures/syncope/exercise/statins/myositis | 3 |
| Initial phosphate 4.0–5.4 / > 5.4 mg/dL | 1.5 / 3 |
| Initial bicarbonate < 19 mEq/L | 2 |

**< 6 = low risk** (~2–3%); **≥ 6 = high risk** (consider renal-protective therapy regardless of CPK); **> 10**
carries substantially higher risk. The ≥ 6 cut is ~86% sensitive / ~68% specific for RRT.

## Posture (spec-v97)

Calculated on admission/initial labs in adults with rhabdomyolysis (CPK typically > 5,000 within 72 h). Not
for pre-existing end-stage renal disease or CK from myocardial infarction. It estimates risk to guide therapy;
it supports rather than replaces clinical judgment.

## Files

- `lib/mcmahon-rhabdo-v677.js` — `mcmahonRhabdo()`, `MCMAHON_NOTE`.
- `views/group-v677.js` (RV677) — six age/lab number inputs + two selects (sex, cause); a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/mcmahon-rhabdo-v677.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialties, related.
- `test/unit/mcmahon-rhabdo.test.js` — 7 tests (zero baseline, each weight incl. fractional, exact thresholds,
  risk bands, ≥ 6 flag, worked 16/19 example, input validation).
- `docs/spec-v677.md` (this file).

## Sourcing (spec-v97)

McMahon GM, Zeng X, Waikar SS. A risk prediction score for kidney failure or mortality in rhabdomyolysis.
*JAMA Intern Med.* 2013;173(19):1821-1828 (PMID 24000014). A source-verification subagent confirmed every
component and threshold — including the fractional age (1.5/2.5), creatinine (1.5), and phosphate (1.5) weights
and the +3 "cause not seizures/syncope/exercise/statins/myositis" rule — the 0–19 range, and the < 6 low-risk /
≥ 6 high-risk interpretation with ~86%/68% sensitivity/specificity, cross-checked against MDCalc and FPNotebook
(MDCalc and FPNotebook agree exactly; the primary JAMA article is paywalled).
