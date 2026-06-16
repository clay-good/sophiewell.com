# v12 audit - sokal-cml

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Sokal JE, et al. Blood. 1984;63(4):789-799 (Sokal); Pfirrmann M, et al. Leukemia. 2016;30(1):48-56 (ELTS).

`lib/hemonc-v94.js sokalCml()` computes the Sokal relative-risk exponential and the ELTS score over age, spleen size, platelets and blast %, banding each.

## Boundary worked examples added
- age 50, spleen 5, platelets 300, blasts 2 -> Sokal 0.91, ELTS 1.58 (both intermediate).
- Sokal band edges around 0.8 / 1.2.
- ELTS band edges around 1.5680 / 2.2185.
- guarded domains: zero/negative platelet -> surfaced fallback.
- extreme age does not leak a non-finite Sokal (overflow -> null, ELTS still finite).

## Cross-implementation differential
- Reference: Sokal 1984 hazard coefficients; Pfirrmann 2016 ELTS coefficients and cutoffs. Match. PASS.

## Edge-input handling notes
- Platelets must be > 0 (the ELTS term raises them to a negative power); age/spleen/blasts must be finite and non-negative. The Sokal exp() overflow for an extreme input is surfaced as a finite null, not Infinity. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Four labeled numeric inputs; output aria-live="polite", nullable scores route through fmt(). 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
