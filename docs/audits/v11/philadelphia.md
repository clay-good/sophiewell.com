# v11 audit - philadelphia

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Baker MD, Bell LM, Avner JR. *Outpatient management without antibiotics of fever in selected infants.* N Engl J Med. 1993;329(20):1437-1441. Eight criteria; ALL must be met for safe outpatient management without empiric antibiotic: age 29-60 days; well-appearing; WBC <15 x10^9/L; band:neutrophil ratio <0.2; UA <10 WBC/HPF and few bacteria; CSF <8 WBC/mm^3 and Gram-stain negative; chest x-ray clear (if obtained); stool studies normal (if diarrhea).

`lib/scoring-v4.js philadelphia()` follows the same all-or-nothing pattern as Rochester. The CXR and stool criteria are conditional in the source ("if obtained" / "if diarrhea") but the tile asks the clinician to confirm each is satisfied -- a checkbox-true means either the test wasn't indicated or the result was normal.

## Boundary examples added
- 0 of 8 (tile example) -> not low risk.
- 7 of 8 (one missing) -> not low risk.
- 8 of 8 (all met) -> LOW risk; safe outpatient management band.

## Cross-implementation differential
- Reference: Baker 1993 §Methods.
- Test case: all met except band:neutrophil ratio not satisfied -> 7/8 -> not low risk.
- Sophie result: lowRisk false, failing ['bandToNeutrophilRatioLt0Point2'].
- Reference: same. PASS.

## Edge-input handling notes
- Conditional criteria (CXR, stool) ask clinician to verify "clear or not obtained" / "normal or no diarrhea" with a single checkbox; the source's conditional logic is resolved by the clinician.

## A11y / keyboard notes
- Eight labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
