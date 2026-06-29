# v12 audit - cdc-stature-for-age

- Auditor: CG
- Date: 2026-06-29
- Spec: docs/spec-v169.md (feature spec of the spec-v168 Data-Sourced Reference-Table program)
- Citation re-verified against: Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC growth charts for the United States: methods and development. Vital Health Stat 11. 2002;(246):1-190.
- **Verbatim source:** CDC NCHS "Percentile Data Files with LMS Values",
  `statage.csv`. Source URL: https://www.cdc.gov/growthcharts/data/zscore/statage.csv
  Fetch date: 2026-06-29 (HTTP 200, 66 KB raw CSV).
- **Cross-verification source (spec-v97 >=2-source rule):** the SAME data file's
  own published percentile columns (P3, P5, P10, P25, P50, P75, P90, P95, P97).
  A generator (`scratchpad/gen-cdc-lms.mjs`, uncommitted) parsed the L/M/S columns
  programmatically and reconstructed every published percentile from the LMS set;
  the reconstruction matched the file's printed percentiles to a max relative
  error of **1.8e-9 across 3,924 checks** (218 ages x 2 sexes x 9 columns). The
  LMS coefficients and the published percentiles therefore agree to machine
  precision within the verbatim file -- no value was hand-transcribed.

`lib/peds-percentile-v169.js cdcStatureForAge()` converts a measured standing
height to an age- and sex-specific z-score via the CDC LMS transform
`z = ((height/M)^L - 1) / (L*S)` (reading `lib/growth-lms-data.js
CDC_STATURE_AGE`), then the percentile as the standard-normal CDF of z. Class A
(Clinical Math & Conversions, Group E).

## Group placement note
- spec-v169 §5 nominated Group N. Shipped in **Group E** instead, beside its
  growth-percentile siblings `peds-bmi-percentile` and `who-growth-zscore`, so
  the family is discoverable together. Group choice affects no gate; the
  deviation is intentional and recorded here.

## Source-governance notes
- LMS arrays are compiled constants parsed verbatim (spec-v100 §5 / spec-v97);
  not fabricated and not recalled. The data-module header records the per-table
  source and accessed date.
- Reference flags are the CDC charted cutoffs: below the 5th percentile low,
  5th-<95th within reference, >=95th high.
- Reports the percentile/z/band only; the growth-management decision stays with
  the clinician (spec-v11 §5.3).

## Boundary worked examples added
- male 10.04 y at the published P50 height (138.82 cm) -> 50th percentile, z 0.
- male 10.04 y at the published P95 height (149.91 cm) -> 95th, high (abnormal).
- female 8.04 y at the published P3 height (117.27 cm) -> 3rd, low (abnormal).
- male 10 y, 138 cm -> 46th percentile (z -0.09) (interpolated-age round case).
- age < 2, age > 20, missing sex/height -> valid:false.

## Edge-input handling notes
- Age outside 2-20 yr surfaces a complete-the-fields fallback pointing to the WHO
  0-2 yr tool. `interpLMS` returns null outside the tabulated range; `lmsToZ`
  guards M>0, S>0, X>0 and the L->0 branch, so no NaN/Infinity can leak. The
  percentile is clamped to [0.1, 99.9] so a copied value never reads as certainty.
- Covered by the spec-v59 fuzz harness (lib/peds-percentile-v169.js in MODULES):
  throw-safe and string-leak-free across the adversarial matrix.

## A11y / keyboard notes
- Sex select + two labeled number inputs; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none
