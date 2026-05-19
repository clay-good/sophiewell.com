# v11 audit - nigrovic

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Nigrovic LE, Kuppermann N, Macias CG, et al. *Clinical prediction rule for identifying children with cerebrospinal fluid pleocytosis at very low risk of bacterial meningitis.* JAMA. 2007;297(1):52-60. Five weighted criteria: positive CSF Gram stain (+2); CSF ANC >=1000/mm^3 (+1); CSF protein >=80 mg/dL (+1); peripheral ANC >=10,000/mm^3 (+1); seizure at or before presentation (+1). Cutoff: 0 = very low risk for bacterial meningitis (NPV ~99.9%); >=1 = not low risk; do not discharge.

`lib/scoring-v4.js nigrovic()` sums the five weighted boolean contributions. CSF Gram-stain positivity is weighted +2 per Nigrovic 2007; all other criteria +1. The very-low-risk cutoff is strictly score === 0 (the published rule's NPV breaks down at score >=1).

## Boundary examples added
- 0 (tile example) -> very low risk; NPV ~99.9% band.
- 1 (peripheral ANC alone) -> not low risk; do not discharge.
- 2 (positive Gram stain alone) -> not low risk (Gram stain weighted +2).
- 6 (all criteria) -> not low risk.
- 1 via seizure alone -> not low risk.

## Cross-implementation differential
- Reference: Nigrovic 2007 §Results.
- Test case: positive Gram stain + CSF ANC >=1000 = 3 -> not low risk.
- Sophie result: 3, not low risk band.
- Reference: same. PASS.

## Edge-input handling notes
- Each boolean coerced via `x ? weight : 0`.
- Very-low-risk band is exclusive to score 0; the published rule does not have a "0-1 low" band.

## A11y / keyboard notes
- Five labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
