# v11 audit - ketamine-propofol

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: ACEP Clinical Policy on procedural sedation (Ann Emerg Med 2014;63(2):247-258).

lib/medication-v5.js ketaminePropofol() computes initial dose (mg) and volume at the agent concentration (ketamine 50, propofol 10, ketofol 5 mg/mL each) plus a re-dose increment. No infusion automation.

## Boundary examples added
- ketamine 1 mg/kg 70 kg: 70 mg = 1.4 mL, redose 35 mg.
- propofol 1 mg/kg 70 kg: 70 mg = 7 mL.
- ketofol 0.5 mg/kg 50 kg: 25 mg = 5 mL.

## Cross-implementation differential
- Hand-calc 70/50 = 1.4 mL. Sophie 1.4. PASS.

## Edge-input handling notes
- agent must be ketamine/propofol/ketofol; mgkg 0.1-5 bounded. Monitored-setting requirement surfaced.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
