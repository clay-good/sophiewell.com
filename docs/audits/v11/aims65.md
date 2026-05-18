# v11 audit - aims65

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Saltzman JR, Tabak YP, Hyett BH, Sun X, Travis AC, Johannes RS. *A simple risk score accurately predicts in-hospital mortality, length of stay, and cost in acute upper GI bleeding.* Gastrointest Endosc. 2011;74(6):1215-1224. Table 4 (in-hospital mortality by score).

Five binary criteria, one point each (range 0-5): albumin < 3.0 g/dL (A), INR > 1.5 (I), altered mental status (M), SBP <= 90 mmHg (S), age > 65 (65). `lib/scoring-v4.js aims65()` implements the count and the six-band in-hospital-mortality split (0 -> 0.3%; 1 -> 1.2%; 2 -> 5.3%; 3 -> 10.3%; 4 -> 16.5%; 5 -> 24.5%) reproduced verbatim from Saltzman 2011 Table 4.

## Boundary examples added
- low: no criteria -> 0 (in-hospital mortality 0.3%).
- mid: albumin + age -> 2 (in-hospital mortality 5.3%).
- high: every criterion -> 5 (in-hospital mortality 24.5%).

Every per-score band is independently asserted via the regex match on the band string.

## Cross-implementation differential
- Reference implementation: Saltzman JR, et al. Gastrointest Endosc. 2011;74(6):1215-1224, Table 4.
- Test case: albumin < 3.0 + age > 65.
- Sophie result: 2, in-hospital mortality 5.3%.
- Reference result: 2, in-hospital mortality 5.3% per Saltzman 2011 Table 4.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Five checkboxes; the labels include the original A/I/M/S/65 mnemonic letters in parentheses so a clinician familiar with the acronym sees the mapping immediately.

## A11y / keyboard notes
- Five labeled checkboxes; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
