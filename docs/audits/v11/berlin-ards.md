# v11 audit - berlin-ards

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: ARDS Definition Task Force, Ranieri VM, Rubenfeld GD, et al. *Acute Respiratory Distress Syndrome: The Berlin Definition.* JAMA. 2012;307(23):2526-2533. All four required: timing <=1 week of insult, bilateral opacities, not fully explained by cardiac failure or fluid overload, PEEP/CPAP >=5 cmH2O. Severity by PaO2/FiO2: mild 200-300, moderate 100-200, severe <=100.

`lib/scoring-v4.js berlinArds()` short-circuits to "not met" if any of the four criteria is unchecked; otherwise computes PaO2/FiO2 and assigns the severity band.

## Boundary examples added
- not met (tile example): no criteria checked -> ARDS not met.
- mild: all four + PaO2 180, FiO2 0.6 (P/F 300) -> ARDS, mild (200-300).
- moderate: all four + PaO2 90, FiO2 0.6 (P/F 150) -> ARDS, moderate.
- severe: all four + PaO2 50, FiO2 0.8 (P/F 62.5) -> ARDS, severe.
- borderline >300: all four + PaO2 200, FiO2 0.5 (P/F 400) -> criteria not met (P/F >300).

## Cross-implementation differential
- Reference: ARDS Definition Task Force. JAMA. 2012;307(23):2526-2533 Table 1.
- Test case: all four criteria + PaO2 90, FiO2 0.6 (P/F 150).
- Sophie result: moderate ARDS (P/F 150).
- Reference: same severity. PASS within one ordinal category.

## Edge-input handling notes
- PaO2 and FiO2 are optional; if missing, returns ARDS yes/no without severity.

## A11y / keyboard notes
- Four labeled checkboxes plus two number inputs; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
