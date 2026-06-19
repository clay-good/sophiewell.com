# v12 audit - sedan-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Strbian D, Engelter S, Michel P, et al. Symptomatic intracranial hemorrhage after stroke thrombolysis: the SEDAN score. Ann Neurol. 2012;71(5):634-641 (re-fetched; point table and sICH series cross-verified against MDCalc calc/2039 and the validation reproduction PMC4241589).

`lib/neuro-v117.js sedanScore()` sums the five SEDAN items to 0-6: blood glucose
(<=8.0/8.1-12.0/>12.0 mmol/L = 0/+1/+2), early infarct signs (+1), dense
cerebral artery sign (+1), age > 75 (+1), and NIHSS >= 10 (+1). The sICH series
is verbatim: 1.4% / 2.9% / 8.5% / 12.2% / 21.7% / 33.3% at 0-5. Class A.

## Boundary worked examples added
- high glucose, early infarct, dense artery, age 80, NIHSS 12 -> 6/6, sICH ~33.3%.
- normal glucose, no signs, age 60, NIHSS 5 -> 0/6, sICH ~1.4%.
- mid glucose (+1), NIHSS 10 (+1) -> 2/6, sICH ~8.5%.
- age and NIHSS boundaries: 75 vs 76; NIHSS 9 vs 10.
- partial inputs render a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the point table, the contiguous glucose bands (<= 8.0 / 8.1-12.0 /
  > 12.0 mmol/L, equivalently <= 144 / 145-216 / > 216 mg/dL), and the sICH
  series match the derivation across three sources. The derivation tabulates
  rates through 5 as the top stratum; a score of 6 (maximal glucose plus all
  four binaries) falls in that >= 5 stratum and reports the 5-row rate -- not a
  fabricated 6-row value. Match. PASS.

## Edge-input handling notes
- age and NIHSS are required, non-negative; glucose is a select, early/dense are
  booleans. The sICH lookup index is clamped 0-5. A scalar fuzz arg yields a
  valid:false fallback.

## A11y / keyboard notes
- One select, two checkboxes, two labeled number inputs; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
