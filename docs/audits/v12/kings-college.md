# v12 audit - kings-college

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: O'Grady JG, et al. Early indicators of prognosis in fulminant hepatic failure. Gastroenterology. 1989;97(2):439-445; Bernal W, et al. Lancet. 2002;359(9306):558-563 (lactate modification).

`lib/rheum-periop-v89.js kingsCollege()` applies the King's College Criteria (acetaminophen pathway) for transplant referral in acetaminophen-induced acute liver failure. Poor prognosis when EITHER arterial pH < 7.30 after fluid resuscitation, OR all three of INR > 6.5 (PT > 100 s) + creatinine > 3.4 mg/dL (> 300 µmol/L) + grade III/IV encephalopathy. The Bernal modification (arterial lactate > 3.5 mmol/L early, > 3.0 after resuscitation) is surfaced as an additional limb. The three-part limb refuses a verdict unless both the coagulopathy and the renal components are entered (encephalopathy comes from a select); a partial limb is reported "incomplete," never a false negative. Creatinine is unit-aware (mg/dL or µmol/L).

## Boundary worked examples added
- pH 7.20 -> meets via the pH limb; pH 7.35 -> pH limb negative.
- INR 7, creatinine 4.0 mg/dL, grade III/IV -> meets via the three-part limb; PT 110, creatinine 320 µmol/L, grade III/IV -> meets (unit-aware).
- INR 7, grade III/IV, no creatinine -> three-part limb incomplete, does not meet.
- INR 5, creatinine 4.0, grade III/IV -> coagulopathy not met, does not meet.
- Lactate 3.4 after resuscitation -> modified limb met; 3.4 early -> not met; 3.6 early -> met.

## Cross-implementation differential
- Reference: O'Grady 1989 limbs + Bernal 2002 lactate thresholds, hand-checked against each branch. Sophie matches. PASS.

## Edge-input handling notes
- pH/INR/PT/creatinine/lactate coerced with pos()/fin(); each limb only fires when its inputs are present. No non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks). This is the acetaminophen pathway only; the non-acetaminophen criteria differ and are out of scope (spec-v89 §6).

## A11y / keyboard notes
- Five labeled numeric inputs, three labeled selects (creatinine unit, encephalopathy grade, lactate timing); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
