# v11 audit - drip

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Webb BJ, Dascomb K, Stenehjem E, et al. *Derivation and Multicenter Validation of the Drug Resistance in Pneumonia Clinical Prediction Score.* Antimicrob Agents Chemother. 2016;60(5):2652-2663. Four major (2 each) + six minor (1 each) risk factors; cutoff >=4 for high risk for drug-resistant pneumonia (DRP). Endorsed by 2019 ATS/IDSA for risk-adjusted empiric antibiotic selection.

`lib/scoring-v4.js drip()` sums the weighted risk factors per Webb 2016 Table 2.

## Boundary examples added
- low (tile example): no factors -> 0 (low).
- borderline: 2 majors -> 4 (cutoff met).
- borderline 2: 1 major + 2 minors -> 4 (cutoff met).
- below cutoff: 1 major + 1 minor -> 3 (not high risk).
- high (maximum): all factors -> 4*2 + 6*1 = 14 (deep into high-risk).

## Cross-implementation differential
- Reference: Webb BJ, et al. Antimicrob Agents Chemother. 2016;60(5):2652-2663 Table 2 hand sum.
- Test case: long-term care + tube feeding + hospitalization + CPD.
- Sophie result: 2 + 2 + 1 + 1 = 6 (high).
- Reference: same. PASS.

## Edge-input handling notes
- Ten boolean inputs only.

## A11y / keyboard notes
- 10 labeled checkboxes grouped under two `<h3>` headers (majors / minors). `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
