# v12 audit - hfa-peff

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Pieske B, Tschope C, de Boer RA, et al. Eur Heart J. 2019;40(40):3297-3317.

`lib/cardio-v102.js hfaPeff()` scores three domains (functional, morphological, biomarker), each none (0) / minor (1) / major (2), capped at 2 per domain, to a 0-6 total: >= 5 HFpEF confirmed, 2-4 indeterminate (proceed to diastolic stress / invasive testing), <= 1 unlikely. The published domain thresholds (age-adjusted e′, rhythm-dependent NT-proBNP/BNP cutoffs) are carried in the note. Class B (ESC HFA algorithm; docs/citation-staleness.md row).

## Boundary worked examples added
- major + minor + minor -> 4, indeterminate.
- major + major + minor -> 5, confirmed (band flip).
- all three major -> 6, confirmed (per-domain cap holds).
- a single minor domain -> 1, unlikely (edge).

## Cross-implementation differential
- Reference: the 2019 HFA-PEFF major/minor domain criteria and the 5 / 2-4 / 1 verdict thresholds. Match. PASS.

## Edge-input handling notes
- Domain selections mapped through a fixed none/minor/major table (unknown value -> 0); bounded sum capped at 2 per domain; reports which domains scored. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
