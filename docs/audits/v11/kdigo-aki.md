# v11 audit - KDIGO AKI Staging (`kdigo-aki`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2:1-138. AKI staging by serum creatinine (the urine-output criterion is acknowledged but the bundled tile uses the creatinine path, since UOP is workflow-dependent and not always recordable in a one-shot calculator). Stage 1 = 1.5-1.9x baseline or >=0.3 mg/dL absolute rise; Stage 2 = 2.0-2.9x baseline; Stage 3 = >=3.0x baseline OR Cr >=4.0 mg/dL OR initiation of RRT.

## Boundary examples added
- Stage 1 (ratio): baseline 1.0 / current 1.6 -> 1.6x -> Stage 1. PASS.
- Stage 1 (absolute): baseline 1.0 / current 1.35 -> 1.35x but +0.35 absolute -> Stage 1 via absolute-rise criterion. PASS.
- Stage 2: baseline 1.0 / current 2.5 -> 2.5x -> Stage 2. PASS.
- Stage 3 (ratio): baseline 1.0 / current 3.5 -> 3.5x -> Stage 3. PASS (matches META example).
- Stage 3 (absolute Cr): baseline 1.5 / current 4.2 -> 2.8x but Cr >=4.0 -> Stage 3 via absolute-creatinine criterion. PASS.
- No AKI: baseline 1.0 / current 1.2 -> 1.2x, +0.2 absolute (below 0.3) -> No AKI. PASS.

## Cross-implementation differential
- KDIGO 2012 Table 2 staging definitions cross-verified against the bundled band logic.
- MDCalc KDIGO AKI Staging: META example (baseline 1.0, current 3.5) returns Stage 3. Sophie matches. PASS.
- Cross-checked the 0.3 mg/dL absolute-rise criterion against KDIGO 2012 §2.1.

## Edge-input handling notes
- Both Cr inputs in mg/dL; non-numeric / negative values rejected.
- Tile renders a clear note that urine-output criteria are excluded and the user should escalate stage if oliguria criteria are independently met (KDIGO 2012 §2.1).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled numeric inputs; compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
