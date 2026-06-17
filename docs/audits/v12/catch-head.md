# v12 audit - catch-head

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Osmond MH, Klassen TP, Wells GA, et al (Pediatric Emergency Research Canada). CATCH: a clinical decision rule for the use of computed tomography in children with minor head injury. CMAJ. 2010;182(4):341-348.

`lib/peds-v98.js catchHead()` flags CT indicated when any high-risk factor (GCS < 15 at 2 h, suspected open/depressed skull fracture, worsening headache, irritability) or medium-risk factor (basal-skull-fracture signs, large boggy scalp hematoma, dangerous mechanism) is present, naming the factor that fired. The validated alternative to pecarn-head. Class A.

## Boundary worked examples added
- high-risk GCS factor -> CT indicated (neurosurgical-intervention need).
- medium-risk hematoma alone -> CT indicated (brain injury on CT).
- no factors -> CT may be deferred.

## Cross-implementation differential
- Reference: the CATCH high/medium-risk factor lists. Match. PASS.

## Edge-input handling notes
- Pure boolean logic over fixed factor sets; no arithmetic. Out-of-enum factor keys are ignored. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
