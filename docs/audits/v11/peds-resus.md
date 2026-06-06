# v11 audit - peds-resus

- Auditor: CG
- Date: 2026-06-06 (spec-v56). Guideline-derived (AHA): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: AHA PALS 2020 (Circulation 2020;142(16 suppl 2):S469-S523).

lib/medication-v5.js pedsResus() computes the isotonic bolus (mL/kg x weight, weight capped at 50 kg adult dose) and flags 20 mL/kg in a cardiac/DKA context.

## Boundary examples added
- 15 kg x 20: 300 mL, no caution in sepsis.
- 20 kg x 10: 200 mL.
- cardiac/DKA + 20 mL/kg: caution flag; 70 kg -> capped 1000 mL.

## Cross-implementation differential
- Hand-calc 15x20 = 300. Sophie 300. PASS.

## Edge-input handling notes
- weight 0.5-150, mlPerKg 5-20 bounded; reassess-after-each reminder surfaced.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
