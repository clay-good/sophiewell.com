# v12 audit - pitt-bacteremia

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Paterson DL, Ko WC, Von Gottberg A, et al. International prospective study of Klebsiella pneumoniae bacteremia. Ann Intern Med. 2004;140(1):26-32.

`lib/idcrit-v99.js pittBacteremia()` sums the temperature band + hypotension (2) + mechanical ventilation (2) + cardiac arrest (4) + mental status (alert 0 / disoriented 1 / stupor 2 / coma 4) to a total of 0-14; a score >= 4 denotes high mortality risk. Class A.

## Boundary worked examples added
- severe temperature + hypotension, alert -> 4 (at threshold).
- all components maxed -> 14.
- normothermic, alert, stable -> 0 (below threshold).

## Cross-implementation differential
- Reference: the Pitt Bacteremia Score point assignment. Match. PASS.

## Edge-input handling notes
- Blank temperature or mental status surfaces valid:false; bounded integer sum; no NaN reaches the DOM. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
