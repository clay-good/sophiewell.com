# v12 audit - ktv-urr

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Daugirdas JT. Second generation logarithmic estimates of single-pool variable volume Kt/V: an analysis of error. J Am Soc Nephrol. 1993;4(5):1205-1213.

`lib/nephro-v92.js ktvUrr()` computes the urea reduction ratio URR = (1 - post-BUN/pre-BUN) x 100% and the Daugirdas second-generation single-pool Kt/V = -ln(R - 0.008·t) + (4 - 3.5·R)·UF/W (R = post/pre BUN, t hours, UF litres, W post-dialysis kg), against the KDOQI minimum targets (URR >= 65%, spKt/V >= 1.2).

## Boundary worked examples added
- pre 60, post 18, UF 3 L, 4 h, 70 kg -> URR 70%, Kt/V 1.44 (both targets met).
- URR 65% target edge (post/pre 0.35 -> met; 0.36 -> below).
- URR reported alone when the Kt/V inputs are blank (partial input).
- ln-domain guard: R - 0.008·t <= 0 surfaces a defined-not-computed Kt/V; pre-BUN <= 0 is valid:false.

## Cross-implementation differential
- Reference: Daugirdas 1993 second-generation equation + KDOQI hemodialysis adequacy targets. The logarithmic form and the 0.008 / (4 - 3.5R) coefficients match. PASS.

## Edge-input handling notes
- Pre-BUN division and the logarithm domain are both guarded; URR is computed independently of Kt/V so a blank UF/time/weight still yields URR. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Five labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
