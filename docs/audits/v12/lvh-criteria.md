# v12 audit - lvh-criteria

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Sokolow M, Lyon TP. Am Heart J. 1949;37(2):161-186 (Sokolow-Lyon); Casale PN, Devereux RB, et al. J Am Coll Cardiol. 1985;6(3):572-580 (Cornell voltage).

`lib/cardio-v90.js lvhCriteria()` applies the two ECG-LVH voltage criteria: Sokolow-Lyon (SV1 + max(RV5, RV6) >= 35 mm) and Cornell voltage (SV3 + RaVL > 28 mm men, > 20 mm women). Each sum is shown against its threshold with a met/not-met determination. Voltages clamp to a non-negative magnitude; no division.

## Boundary worked examples added
- SV1 20, RV5 18, RV6 16, SV3 12, RaVL 10, male -> Sokolow 38 positive, Cornell 22 negative.
- Sokolow-Lyon 35 mm edge: SV1 17 + RV5 18 = 35 met; 34 not met.
- Cornell sex-specific: SV3 13 + RaVL 12 = 25 positive for women (> 20), negative for men (> 28).

## Cross-implementation differential
- Reference: hand computation. 20 + max(18,16) = 38 >= 35 -> Sokolow positive; 12 + 10 = 22, not > 28 -> Cornell negative (male). Sophie matches. PASS.

## Edge-input handling notes
- A partial limb (e.g. SV1 without RV5/RV6) reports the criterion as unknown, not a false negative. Negative amplitudes clamp to 0 (a measured amplitude is a magnitude). The spec-v59 fuzz harness covers the module, zero non-finite leaks. Voltage criteria are specific but not sensitive; the note states echocardiography is the reference standard.

## A11y / keyboard notes
- Five labeled numeric inputs, one labeled select (sex); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
