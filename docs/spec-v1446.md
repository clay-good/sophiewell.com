# spec-v1446 — hypoglycemia level and first step

Found by the nurse-facing gap scan: `hypoglycemia` reached only a California adverse-event tile.
The catalog corrects high glucose (`insulin-correction`, `dka-hhs`) and had nothing for the low one.

## Sources, read 2026-09-24

- ADA, *Standards of Care in Diabetes-2025*, section 6 (Diabetes Care 2025;48(Suppl 1):S128-S145;
  open access, PMC11635034; DOI checked on Crossref): the three levels (level 1 < 70 and >= 54 mg/dL;
  level 2 < 54; level 3 a severe event needing assistance, irrespective of glucose);
  recommendation 6.15 (glucose preferred for the conscious person below 70; avoid fat or protein
  for the first treatment; repeat after 15 minutes if still low); 6.16 (glucagon for everyone on
  insulin or at high risk).
- The 15-20 g amount, the 15-minute recheck, the follow-up longer-acting carbohydrate, and glucagon
  routes: Alagiakrishnan K et al, *Geriatrics* 2026;11:118 (open access; DOI checked).
- A level 2 or 3 episode prompting a treatment-plan review is from ADA 2024, recommendation 6.15.

## Behavior

"Altered mental or physical status needing help" is asked first and, if yes, is level 3 whatever
the glucose (the glucose is then optional). Otherwise the glucose (mg/dL or mmol/L) sets level 1, 2
or none, at the exact ADA edges (70 and 54). Levels 1-2 get the oral steps; level 3 gets glucagon
or the facility protocol. Every answer says the facility protocol governs.

## Tests

`test/unit/hypoglycemia-level.test.js`: the 70/54 edges, level 3 regardless of glucose, the steps
and notes by level, and refusals.
