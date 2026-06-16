# v12 audit - ipss-r-mds

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Greenberg PL, Tuechler H, Schanz J, et al. Revised international prognostic scoring system for myelodysplastic syndromes. Blood. 2012;120(12):2454-2465.

`lib/hemonc-v94.js ipssrMds()` weights the cytogenetic group, marrow blast %, hemoglobin, platelets and ANC (0-10) and maps to the five-level category with the cited median survival and time to 25% AML evolution.

## Boundary worked examples added
- good cytogenetics, 7% blasts, Hgb 9, plt 150, ANC 1.5 -> 4, intermediate (OS 3.0 yr).
- best case -> 0, very low.
- category edges at 1.5 / 3 / 4.5 / 6.
- missing inputs -> surfaced guard.

## Cross-implementation differential
- Reference: Greenberg 2012 IPSS-R point table and category cutoffs. Match. PASS.

## Edge-input handling notes
- Non-finite/negative lab values return a surfaced valid:false. Out-of-set cytogenetic selector -> 0. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- One cytogenetic <select> + four labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. This is the clinical/cytogenetic IPSS-R, not the molecular IPSS-M.

## Defects opened
- none

## Status
- PASS
