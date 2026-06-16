# v12 audit - flipi

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Solal-Celigny P, et al. Follicular lymphoma international prognostic index. Blood. 2004;104(5):1258-1265 (FLIPI); The International Non-Hodgkin's Lymphoma Prognostic Factors Project. N Engl J Med. 1993;329(14):987-994 (IPI).

`lib/hemonc-v94.js flipi()` computes the FLIPI (0-5) and IPI (0-5) five-factor counts, sharing age/stage/LDH, and maps each to its survival band.

## Boundary worked examples added
- age > 60, stage III/IV, LDH high -> FLIPI 3 (high), IPI 3 (high-intermediate).
- no factors -> both low.
- FLIPI band edges 1/2/3.
- IPI band edges 2/3/5.

## Cross-implementation differential
- Reference: FLIPI (low 0-1, intermediate 2, high >=3) and IPI (low 0-1, low-int 2, high-int 3, high 4-5). Match. PASS.

## Edge-input handling notes
- Binary factors default unchecked (= absent, 0 points). Out-of-set toggles count as 0. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Seven yes/no <select>s; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
