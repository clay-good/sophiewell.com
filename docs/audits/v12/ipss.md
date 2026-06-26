# v12 audit - ipss

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Barry MJ, Fowler FJ Jr, O'Leary MP, et al. The American Urological Association symptom index for benign prostatic hyperplasia. J Urol. 1992;148(5):1549-1557 (cross-verified against MDCalc and AUA/EAU guideline summaries; ≥ 2 sources, spec-v97).

`lib/urology-v153.js ipss()` consumes seven 0–5 symptom answers plus an optional
0–6 quality-of-life item and computes the 0–35 symptom total with mild/moderate/
severe bands. Group G, Class A.

## Source-governance notes
- Seven symptom items each 0–5 summed 0–35; bands 0–7 mild, 8–19 moderate, 20–35
  severe. Verified identical to the AUA Symptom Index (AUA-7); the "I-PSS" adds
  only the quality-of-life item.
- The quality-of-life item (0 delighted → 6 terrible) is reported alongside and is
  NEVER summed into the 0–35 total (a common scoring error). A unit test asserts the
  symptom total is invariant to the QoL value.
- AUA is not in the check-citations ISSUER_PATTERN, so no citation-staleness row
  (Class A).

## Boundary worked examples added
- 7/8 mild→moderate boundary with the QoL item present and proven excluded from the
  total; 19/20 moderate→severe boundary; all-0 → 0 mild; all-5 → 35 severe; partial
  form → valid:false.

## Edge-input handling notes
- Each item finite-checked and clamped to [0,5] (QoL [0,6]); a blank symptom item
  surfaces a complete-the-fields fallback rather than an undercounted total; covered
  by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Eight labelled selects (seven symptom + optional QoL); output aria-live. 320px
  sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
