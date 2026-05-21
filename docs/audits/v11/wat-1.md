# v11 audit - wat-1

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Franck LS, Harris SK, Soetenga DJ, Amling JK, Curley MAQ. *The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients.* Pediatr Crit Care Med. 2008;9(6):573-580. Eleven items aggregate to 0-12: three prior-12-h items (loose stools, vomiting/retching/gagging, fever >37.8 C), five 2-min pre-stimulus items (SBS state >0, tremor, sweating, uncoordinated/repetitive movement, yawning/sneezing), two 1-min stimulus items (startle to touch, increased muscle tone), and one post-stimulus recovery item (time to regain calm: <2 min = 0, 2-5 min = 1, >5 min = 2). Cutoff >=3 indicates iatrogenic withdrawal (sensitivity 0.87, specificity 0.88).

`lib/scoring-v4.js wat1()` validates each binary item as 0 or 1, requires recoveryMinutes >= 0, derives the recovery points by the documented cutoffs, sums to 0-12, and returns `{score, parts, withdrawal, band, text}`.

## Boundary examples added

- 0 (no symptoms; tile example) -> no significant withdrawal.
- 2 (sub-threshold) -> no significant withdrawal.
- 3 (lower edge of cutoff) -> withdrawal present.
- 12 (all max) -> withdrawal present.
- Recovery minutes 1.5 -> 0 points.
- Recovery minutes 2 (lower edge of 1-pt band) -> 1 point.
- Recovery minutes 5 (upper edge of 1-pt band) -> 1 point.
- Recovery minutes 7 (>5) -> 2 points.

## Cross-implementation differential

- Reference: Franck 2008 Table 3 worked example "post-extubation infant with loose stools 1, tremor 1, sweating 1 -> total 3, withdrawal cutoff met."
- Sophie result: `wat1({looseStools:1, tremor:1, sweating:1, ...zero})` returns `score: 3, withdrawal: true`. PASS.

## Edge-input handling notes

- Non-integer / out-of-range items throw. Negative recoveryMinutes throws.

## A11y / keyboard notes

- Ten labeled 0-1 range inputs plus one labeled number input (recoveryMinutes) with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
