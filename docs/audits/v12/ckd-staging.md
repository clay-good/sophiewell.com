# v12 audit - ckd-staging

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.

`lib/nephro-v92.js ckdStaging()` maps eGFR to a GFR category (G1 >= 90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 < 15) and UACR to an albuminuria category (A1 < 30, A2 30-300, A3 > 300 mg/g, or the category entered directly), then returns the KDIGO heat-map cell (low / moderately increased / high / very high) where the two axes meet.

## Boundary worked examples added
- eGFR 38 + UACR 340 -> G3b/A3 -> very high (red).
- G3a/G3b eGFR edge: 45 -> G3a, 44 -> G3b.
- A2/A3 UACR edge: 300 -> A2, 301 -> A3.
- Heat-map cells: G1/A1 low, G3a/A2 high, G4/A1 very high.

## Cross-implementation differential
- Reference: KDIGO 2024 Figure (CGA heat-map). The G/A cut-points and the four-colour risk grid match. PASS.

## Edge-input handling notes
- A non-finite or negative eGFR, or a missing albuminuria input, returns a surfaced valid:false fallback; the A-category may be entered directly when no numeric UACR is given. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two labeled numeric inputs + one labeled albuminuria <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
