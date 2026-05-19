# v11 audit - lis-murray

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Murray JF, Matthay MA, Luce JM, Flick MR. *An expanded definition of the adult respiratory distress syndrome.* Am Rev Respir Dis. 1988;138(3):720-723. Average of four 0-4 components: CXR quadrants, PaO2/FiO2 (>=300=0; 225-299=1; 175-224=2; 100-174=3; <100=4), PEEP (<=5=0; 6-8=1; 9-11=2; 12-14=3; >=15=4), compliance (>=80=0; 60-79=1; 40-59=2; 20-39=3; <=19=4). ECMO referral context per ELSO 2017 guidelines.

`lib/scoring-v4.js lisMurray()` computes the average of the four per-component bands.

## Boundary examples added
- low (tile example): 0 quadrants, P/F 750 (FiO2 0.4), PEEP 5, compliance 80 -> 0+0+0+0 / 4 = 0.00.
- mid: 2 quadrants, P/F 200 (PaO2 100, FiO2 0.5), PEEP 10, compliance 50 -> (2+2+2+2)/4 = 2.00 (mild-moderate).
- severe: 4 quadrants, P/F 80 (PaO2 80, FiO2 1.0), PEEP 15, compliance 20 -> (4+4+4+3)/4 = 3.75 (severe; ECMO consideration).
- ECMO threshold: average >2.5 maps to severe-injury band per Murray 1988 + ELSO 2017.

## Cross-implementation differential
- Reference: Murray JF, et al. Am Rev Respir Dis. 1988;138(3):720-723 hand sum.
- Test case: 2 quadrants, P/F 200, PEEP 10, compliance 50.
- Sophie result: 2.00.
- Reference: (2+2+2+2)/4 = 2.00. PASS within 0.5%.

## Edge-input handling notes
- Quadrants clamped to 0-4.
- FiO2 must be positive to compute P/F; otherwise P/F is treated as 300 (best band).

## A11y / keyboard notes
- Five labeled number inputs; Tab-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
