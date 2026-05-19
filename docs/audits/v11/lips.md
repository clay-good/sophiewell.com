# v11 audit - lips

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Gajic O, Dabbagh O, Park PK, et al. *Early identification of patients at risk of acute lung injury: evaluation of lung injury prediction score in a multicenter cohort study.* Am J Respir Crit Care Med. 2011;183(4):462-470. Weighted predisposing conditions (shock 2, aspiration 2, sepsis 1, pneumonia 1.5, high-risk surgery 1.5, high-risk trauma 2) and modifiers (alcohol 1, obesity 1, hypoalbuminemia 1, chemo 1, FiO2>0.35 or >4 L/min 2, tachypnea 1.5, SpO2<95% 1, acidosis 1.5, diabetes -1). Cutoff >=4 = high risk for ALI/ARDS.

`lib/scoring-v4.js lips()` sums the 15 boolean predictors per Gajic 2011 Table 2; diabetes contributes -1.

## Boundary examples added
- low (tile example): no predictors -> 0 (below cutoff).
- mid: sepsis (1) + pneumonia (1.5) + tachypnea (1.5) -> 4.0 (at cutoff; high risk).
- protective: pneumonia (1.5) + diabetes (-1) -> 0.5 (below cutoff; diabetes protective in Gajic 2011).
- high: shock (2) + sepsis (1) + pneumonia (1.5) + high-risk surgery (1.5) + obesity (1) + hypoalbuminemia (1) + FiO2 (2) + tachypnea (1.5) + SpO2 (1) + acidosis (1.5) -> 14.0 (deep into high-risk band).

## Cross-implementation differential
- Reference: Gajic O, et al. Am J Respir Crit Care Med. 2011;183(4):462-470 Table 2 hand sum.
- Test case: sepsis + pneumonia + tachypnea.
- Sophie result: 4.0 (high-risk band).
- Reference: 1 + 1.5 + 1.5 = 4.0; >=4 cutoff. PASS.

## Edge-input handling notes
- 15 boolean inputs; diabetes is the only negative weight (-1) per Gajic 2011.

## A11y / keyboard notes
- 15 labeled checkboxes; Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
