# v11 audit - Revised Cardiac Risk Index (Lee) (`rcri`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Lee TH, Marcantonio ER, Mangione CM, et al. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation. 1999;100(10):1043-1049. Six factors: high-risk surgery, ischemic heart disease, congestive heart failure, cerebrovascular disease, insulin-treated DM, preoperative Cr > 2.0 mg/dL. Class bands: 0 = I (0.4%), 1 = II (0.9%), 2 = III (6.6%), >=3 = IV (>=11%). Sophie's `rcri` (lib/clinical-v5.js:363) implements the six factors and the four class bands verbatim from Lee 1999 Table 3.

## Boundary examples added
- Class I (no factors): 0 -> 0.4% major cardiac event risk. PASS.
- Class II (1 factor): high-risk surgery alone -> 0.9%. PASS.
- Class III (2 factors): high-risk surgery + IHD -> 6.6%. PASS (matches META example expected).
- Class IV (>=3 factors): all six checked -> >=11%. PASS.

## Cross-implementation differential
- Lee 1999 Table 3 risk percentages (0.4%, 0.9%, 6.6%, 11.0%) cross-verified against Sophie's hard-coded bands; exact match.
- MDCalc Revised Cardiac Risk Index: META example (2 factors) returns Class III ~6.6%. Sophie matches. PASS.

## Edge-input handling notes
- All six factors implemented as independent boolean inputs; no numeric validation needed.
- Tile renders the six factor descriptions per Lee 1999 verbatim (e.g., "preoperative serum Cr > 2.0 mg/dL", not "elevated Cr").
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Six labelled checkbox inputs; compute button keyboard-reachable; result region updates aria-live. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
