# v12 audit - mifflin-st-jeor

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247 (formula and sex constant cross-verified against the original paper, Medscape/QxMD, and a dietitian calculator reference; ≥ 2 independent sources, spec-v97).

`lib/nutrition-energy-v152.js mifflinStJeor()` consumes weight (kg), height (cm),
age (yr), sex, and an optional activity factor, and computes REE = 10·wt +
6.25·ht − 5·age + s (s = +5 male / −161 female) with TDEE = REE × factor. Class A.

## Source-governance notes
- Sex constant +5 (male) / −161 (female) — both branches unit-tested on identical
  anthropometrics so a default does not silently apply the wrong constant.
- Activity factors sedentary 1.2 / light 1.375 / moderate 1.55 / very 1.725 /
  extra 1.9 are a practice convention (not from the 1990 paper); the resting REE
  is reported separately from TDEE so the renderer never presents TDEE as resting.

## Boundary worked examples added
- male 70/175/40 → REE 1599; male-vs-female ±constant pair (gap 166); activity
  factor → TDEE; blank input → valid:false.

## Edge-input handling notes
- A blank/non-finite weight, height, or age surfaces a complete-the-fields
  fallback rather than NaN; covered by the spec-v59 fuzz harness, zero non-finite
  leaks.

## A11y / keyboard notes
- Four labeled inputs + a sex and activity select; output aria-live. 320px sweep,
  no hscroll.

## Defects opened
- none

## Status
- PASS
