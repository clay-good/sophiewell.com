# v12 audit - rose-syncope

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Reed MJ, Newby DE, Coull AJ, et al. J Am Coll Cardiol. 2010;55(8):713-721.

`lib/cardio-v104.js roseSyncope()` evaluates the seven BRACES-plus-bradycardia criteria; any single positive criterion returns high risk (1-month serious outcome / death), all-negative is low risk. Class A.

## Boundary worked examples added
- all negative -> low risk.
- any single positive (BNP) -> high risk, count 1.
- bradycardia alone -> high risk.
- multiple positives counted.
- fuzz: boolean criteria, no non-finite leak.

## Cross-implementation differential
- Reference: the ROSE Figure 2 rule box (verified verbatim against the JACC 2010 full text). Thresholds: BNP >= 300 pg/mL, bradycardia <= 50, Hgb <= 90 g/L, Q wave not lead III, SaO2 <= 94%. Match. PASS.

## Edge-input handling notes
- Boolean flags only; the positive-criteria list and count drive the verdict.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. Risk-stratification aid, not an admission order.

## Defects opened
- none

## Status
- PASS
