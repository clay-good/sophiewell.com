# v11 audit - rockall

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Rockall TA, Logan RFA, Devlin HB, Northfield TC. *Risk assessment after acute upper gastrointestinal haemorrhage.* Gut. 1996;38(3):316-321. Table 1 (per-parameter weights) and Figure 2 (rebleed and mortality bands). Pre-endoscopy variant per Vreeburg EM, et al. Gastroenterology. 1999 / NICE CG141 endorsement.

Five-parameter complete (post-endoscopy) Rockall score (range 0-11) per Rockall 1996 Table 1: age band (<60 = 0; 60-79 = 1; >=80 = 2); shock (none = 0; tachycardia HR>=100, SBP>=100 = 1; hypotension SBP<100 = 2); comorbidity (none = 0; CHF/IHD/major morbidity = 2; renal or hepatic failure or metastatic CA = 3); endoscopic diagnosis (Mallory-Weiss or no lesion = 0; all other = 1; upper GI malignancy = 2); stigmata of recent hemorrhage (clean base or dark spot = 0; blood, adherent clot, or visible/spurting vessel = 2). The pre-endoscopy variant per Vreeburg 1999 / NICE CG141 omits the last two parameters (range 0-7). `lib/scoring-v4.js rockall()` implements both modes and the Rockall 1996 Figure 2 mortality bands.

## Boundary examples added
- low: all minimum bands -> 0 (low risk; mortality 0.1-0.4% per Rockall 1996 Figure 2).
- mid: age 60-79 (1) + tachy (1) + CHF (2) + other dx (1) + clean (0) = 5 (high risk; mortality 24.6-39.6% per Rockall 1996 Figure 2).
- high: every maximum band -> 11 (very high risk; mortality >=40% per Rockall 1996 Figure 2).

Pre-endoscopy variant asserted: same maximums with `preEndoscopy: true` -> 7 (the 0-7 range called out in spec-v12 §3.3.2).

## Cross-implementation differential
- Reference implementation: Rockall TA, et al. Gut. 1996;38(3):316-321, Table 1 + Figure 2.
- Test case: age 60-79 + tachycardia + CHF + other dx + clean base/dark spot.
- Sophie result: 5, high-risk band (mortality 24.6-39.6%).
- Reference result: 1 + 1 + 2 + 1 + 0 = 5; Rockall 1996 Figure 2 places 5 in the high-risk band.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Five categorical selects with the source's category labels printed verbatim; defaults to the all-zero (low-risk) case.
- The pre-endoscopy toggle is a single checkbox; when checked, the endoscopic-diagnosis and stigmata selects still display (so the user sees what is being dropped) but their values are not added to the score. The output heading switches between "Complete Rockall" and "Pre-endoscopy Rockall" so the active mode is unambiguous.

## A11y / keyboard notes
- Five labeled selects, one labeled checkbox; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
