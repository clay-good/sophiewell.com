# v11 audit - Antibiotic Renal Dose Adjustment (`abx-renal`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: FDA-approved labeling on DailyMed for the four bundled antibiotics; cross-checked against the Sanford Guide to Antimicrobial Therapy (current) renal-adjustment table.

## Boundary examples added (CrCl band coverage)
`abxRenalDose` selects the band where `crCl >= band.crClFrom && crCl < band.crClTo` (treating `null` as +Inf). Per spec-v11 §3.3 step 10, coverage rows hit different bands and different drugs.
- cefepime, CrCl 80 mL/min -> band 60-Inf: 1-2 g q8-12h
- cefepime, CrCl 45 mL/min -> band 30-60: 1-2 g q12-24h
- cefepime, CrCl 20 mL/min -> band 11-30: 500 mg-1 g q24h
- cefepime, CrCl 8 mL/min -> band 0-11: 250-500 mg q24h
- piperacillin-tazobactam, CrCl 50 mL/min -> band 40-Inf: 4.5 g q8h
- piperacillin-tazobactam, CrCl 30 mL/min -> band 20-40: 3.375 g q8h
- piperacillin-tazobactam, CrCl 10 mL/min -> band 0-20: 2.25 g q8h
- vancomycin, any CrCl -> single PK-driven band: weight-based load 25-30 mg/kg, then dose by trough/AUC, PK-driven interval
- ciprofloxacin, CrCl 60 mL/min -> band 50-Inf: 400 mg IV / 500-750 mg PO q12h
- ciprofloxacin, CrCl 40 mL/min -> band 30-50: 400 mg IV / 250-500 mg PO q12h
- ciprofloxacin, CrCl 15 mL/min -> band 5-30: 400 mg IV / 250-500 mg PO q18-24h

All bands verified against the matching DailyMed package insert "Use in Renal Impairment" tables.

## Cross-implementation differential
- Reference implementation: Sanford Guide to Antimicrobial Therapy (current) renal-adjustment table for cefepime.
- Test case: cefepime in CrCl 45 mL/min.
- Sophie result: 1-2 g q12-24h.
- Reference result: 1-2 g q12-24h (Sanford; matches the FDA label).
- Delta: 0%. PASS.

## Edge-input handling notes
- Renderer requires `crCl > 0` before invoking the lookup. PASS.
- Drug selector is a closed list sourced from the bundled shard; unknown drugs cannot be typed in. PASS.
- When no band matches (e.g., the shard's bands don't cover the entered CrCl), the renderer prints "No dose band found." rather than a silent NaN. PASS.
- The CrCl band selector uses half-open intervals (`>= lo && < hi`); the audit confirms there is no boundary CrCl where two bands overlap or where a band is silently skipped.

## A11y / keyboard notes
- Drug select + CrCl number input, both label-bound. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
