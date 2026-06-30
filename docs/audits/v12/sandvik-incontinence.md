# v12 audit - sandvik-incontinence

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Sandvik H, et al. J Epidemiol Community Health. 1993;47(6):497-499; Neurourol Urodyn. 2000;19(2):137-145. The frequency x amount product and the 1-2/3-6/8-9/12 bands cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v182.js sandvikIncontinence()` returns frequency x amount (1-12). Group E, Class A.

## Source-governance notes
- Frequency 1-4 x amount 1-3 = 1-12; bands 1-2 slight, 3-6 moderate, 8-9 severe, 12 very severe (only 1,2,3,4,6,8,9,12 occur). Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- product = frequency x amount; the slight/moderate/severe/very-severe edges; blanks/out-of-range -> valid:false.

## Edge-input handling notes
- frequency 1-4, amount 1-3 validated; blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
