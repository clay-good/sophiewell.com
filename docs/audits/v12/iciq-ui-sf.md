# v12 audit - iciq-ui-sf

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Avery K, et al. ICIQ. Neurourol Urodyn. 2004;23(4):322-330. The three scored items (0-5, 0-6, 0-10), the 0-21 total, and the 1-5/6-12/13-18/19-21 bands cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v182.js iciqUiSf()` sums the 3 scored items to 0-21. Group G, Class A.

## Source-governance notes
- Score = frequency(0-5) + amount(0-6) + impact(0-10); total 0-21; bands 1-5 slight, 6-12 moderate, 13-18 severe, 19-21 very severe. The 4th self-diagnostic item is unscored. ICIQ free to use, registered with the ICIQ Group Bristol; the tile ships the scoring only (no copyrighted item text). Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- sums the three items (13 example); no-incontinence 0; the slight/moderate/severe/very-severe edges; out-of-range/blank -> valid:false.

## Edge-input handling notes
- Each item validated to its range; blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
