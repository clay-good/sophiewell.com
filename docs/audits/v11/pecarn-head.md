# v11 audit - pecarn-head

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Kuppermann N, Holmes JF, Dayan PS, et al. *Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study.* Lancet. 2009;374(9696):1160-1170. Figure 2 (age <2 algorithm) and Figure 3 (age >=2 algorithm).

`lib/scoring-v4.js pecarnHead()` implements the two age-banded algorithms (Kuppermann 2009 Figure 2 and Figure 3) and returns one of three tiers (`very-low`, `intermediate`, `high`) with the ciTBI risk percentage cited from the original Kuppermann 2009 figures.

## Boundary examples added
- low (age >=2 very-low): age 5, GCS 15, no high or intermediate predictor -> very-low risk, ciTBI <0.05% per Kuppermann 2009 Figure 3. Tile empty-state example.
- mid (age <2 intermediate): age 1, GCS 15, occipital/parietal/temporal hematoma -> intermediate risk, ciTBI ~0.9%.
- high (age <2): age 1, palpable skull fracture -> high risk, ciTBI ~4.4%.
- high (age >=2): age 8, signs of basal skull fracture -> high risk, ciTBI ~4.3%.

## Cross-implementation differential
- Reference implementation: Kuppermann N, et al. Lancet. 2009;374(9696):1160-1170 Figures 2 and 3 (hand walk-through).
- Test case: age 1, GCS 15, palpable skull fx.
- Sophie result: tier = 'high', ciTBI 4.4%.
- Reference result: palpable skull fracture in the age <2 branch is a high-risk predictor -> high risk. PASS within one ordinal category.

## Edge-input handling notes
- Age branches at <2 vs >=2 years. The renderer surfaces age-specific predictors in a single combined form per Kuppermann 2009 Figures 2 and 3.
- LOC predictor diverges between branches (>=5 sec for <2; any duration for >=2); the renderer encodes both via a single checkbox that the function interprets per the age branch.
- The 'not acting normally per parent' predictor applies only to age <2; defaults to true (acting normally) so the empty-state example renders very-low risk.

## A11y / keyboard notes
- One age input plus ten labeled checkboxes grouped under high-risk and intermediate-risk section headers; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
