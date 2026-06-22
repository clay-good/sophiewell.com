# v12 audit - hadlock-efw

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Hadlock FP, Harrist RB, Sharman RS, Deter RL, Park SK. Estimation of fetal weight with the use of head, body, and femur measurements -- a prospective study. Am J Obstet Gynecol. 1985;151(3):333-337 (re-fetched; the four-parameter coefficients cross-read verbatim across perinatology.com, onlinemedicaltools.com, and the primary abstract).

`lib/ob-v138.js hadlockEfw()` computes log10(EFW in grams) = 1.3596 - 0.00386 x AC x FL
+ 0.0064 x HC + 0.00061 x BPD x AC + 0.0424 x AC + 0.174 x FL, all biometry in cm, then
the 10^x back-transform. Class A (fixed 1985 regression; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- BPD 9.0 / HC 33.0 / AC 30.0 / FL 7.0 cm -> log10 3.4149, EFW 2600 g.
- monotonicity: a smaller biometry set yields a smaller weight than a larger one.
- non-positive / missing biometry -> valid:false (no 10^x of a bad domain).
- implausible biometry -> valid:false, never Infinity (log10 clamped to [0,12]).

## Cross-implementation differential
- The distinguishing BPD x AC term confirms this is the four-parameter ("Hadlock 4")
  model, NOT the three-parameter 1.5662/HC^2 form (which has no BPD term). Constant
  1.3596 and all six terms matched across three sources. Match. PASS.

## Edge-input handling notes
- Four positive number inputs; any non-positive or blank surfaces a complete-the-fields
  fallback. The log10 result is range-checked before 10^x so the gram value is always
  finite.

## A11y / keyboard notes
- Four labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
