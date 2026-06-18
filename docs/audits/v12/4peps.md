# v12 audit - 4peps

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Roy PM, Friou E, Germeau B, et al. JAMA Cardiol. 2021;6(6):669-677.

`lib/vte-v106.js fourPeps()` sums the 13 weighted items to a total clamped to
-5..+21 and maps it to the four probability tiers, each naming the selected D-dimer
strategy. Class A (fixed 2021 score).

## Boundary worked examples added
- age 40 alone -> -2, very low (no test).
- band flip: total 12 (moderate) -> 13 (high) crossing the boundary.
- negative items: chronic respiratory disease -1 and HR < 80 -1 lower the total.
- total clamps to the published -5..+21 range under saturated input.
- age required; blank/zero age -> surfaced fallback.

## Cross-implementation differential
- Reference: item points re-fetched and cross-verified across the original paper
  (PMC7931139), ClinCaseQuest, and MDCalc. Age < 50 -2 / 50-64 -1; chronic
  respiratory disease -1; HR < 80 -1; chest pain + dyspnea +1; male +2; estrogen +2;
  prior VTE +2; syncope +2; immobility +2; SpO2 < 95% +3; calf pain/edema +3; PE most
  likely +5. Tier cutoffs < 0 / 0-5 / 6-12 / >= 13. Match. PASS.

## Edge-input handling notes
- HR and SpO2 are optional numeric thresholds: a blank value simply does not score
  its item (mirrors an unchecked criterion), it does not throw.
- the moderate strategy names the age-adjusted cutoff (age x 10 ng/mL for age > 50).

## A11y / keyboard notes
- Labeled number inputs + checkboxes; output aria-live="polite". 320px sweep passes
  with no horizontal scroll. Pretest tool, not an imaging order.

## Defects opened
- none

## Status
- PASS
