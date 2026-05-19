# v11 audit - vis

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Gaies MG, Gurney JG, Yen AH, et al. *Vasoactive-inotropic score as a predictor of morbidity and mortality in infants after cardiopulmonary bypass.* Pediatr Crit Care Med. 2010;11(2):234-238. VIS = dopamine + dobutamine + 100*epinephrine + 100*norepinephrine + 10*milrinone + 10000*vasopressin. Inputs in mcg/kg/min except vasopressin (units/kg/min). Inotrope Score (IS) per Wernovsky G, et al. Circulation. 1995;92(8):2226-2235.

`lib/clinical-v4.js vis()` implements the Gaies 2010 weighted sum and also surfaces the simpler Wernovsky 1995 IS = dopamine + dobutamine + 100*epinephrine.

## Boundary examples added
- low (tile example): all drips at 0 -> VIS 0.0.
- mid: dopamine 5, norepinephrine 0.05 -> VIS 5 + 100*0.05 = 10.0 (moderate band).
- high: norepinephrine 0.2 + epinephrine 0.05 + vasopressin 0.0004 (4 units/h on 50 kg) -> VIS 100*0.2 + 100*0.05 + 10000*0.0004 = 29.0 (high band).
- Wernovsky IS: dopamine 5 + dobutamine 5 + epinephrine 0.05 -> IS 5 + 5 + 100*0.05 = 15.

## Cross-implementation differential
- Reference: Gaies MG, et al. Pediatr Crit Care Med. 2010;11(2):234-238 equation.
- Test case: dopamine 5, dobutamine 5, epinephrine 0.05, norepinephrine 0.05, milrinone 0.5, vasopressin 0.
- Sophie result: VIS = 5 + 5 + 5 + 5 + 5 + 0 = 25.0; IS = 5 + 5 + 5 = 15.0.
- Reference: same. PASS within 0.5%.

## Edge-input handling notes
- All inputs default to 0 if missing.
- Vasopressin unit (units/kg/min) is non-intuitive; the renderer labels the field explicitly. Typical adult vasopressin doses (0.01-0.06 units/min on 70 kg = 0.00014-0.00086 units/kg/min) produce VIS contributions of ~1.4 to ~8.6.

## A11y / keyboard notes
- Six labeled number inputs; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
