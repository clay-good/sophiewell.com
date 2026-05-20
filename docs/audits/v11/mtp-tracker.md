# v11 audit - mtp-tracker

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Holcomb JB, Tilley BC, Baraniuk S, et al. *Transfusion of plasma, platelets, and red blood cells in a 1:1:1 vs 1:1:2 ratio and mortality in patients with severe trauma: the PROPPR randomized clinical trial.* JAMA. 2015;313(5):471-482. ATLS 10th ed (2018): cryoprecipitate 1 pooled dose (5-10 units) every 6 PRBC.

`lib/scoring-v4.js mtpTracker()` accepts `{prbcUnits, ffpUnits, plateletUnits, cryoUnits}` and returns `{prbcUnits, ffpUnits, plateletUnits, cryoUnits, ratio, cryoDoseDue, nextProduct, cumulativeUnits, banners}`.

## Boundary examples added
- 0/0/0/0 -> initial cooler banner.
- 6/4/6 -> next FFP.
- 6/6/4 -> next Platelets.
- 6/6/6 -> next PRBC.
- 12/12/12/1 -> 2 cryo doses due (ATLS 2018).
- 6/6/1/1 -> cumulative 14 units.
- Negative or non-integer values clamped / truncated.

## Cross-implementation differential
- Reference: PROPPR 2015 1:1:1 target; ATLS 2018 cryo cadence.
- Sophie result: matches each case. PASS.

## Edge-input handling notes
- All inputs default to 0 if blank.
- Ratio printed as PRBC:FFP:Platelets in unit counts.

## A11y / keyboard notes
- Four labeled number inputs; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
